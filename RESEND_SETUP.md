# Resend Email Setup

Complete guide for the contact-form email pipeline: [Resend](https://resend.com) as the sending
provider, [React Email](https://react.email) for templates. Written to be reusable in future
projects — steps 1-4 are already done for **thedecoder.in** on this project; skip to
[Remaining steps for this project](#remaining-steps-for-this-project) if you just need to finish
setup here.

## Architecture

```
Contact.tsx (form, honeypot field)
  -> useContactForm.ts (client validation, POST /api/contact)
  -> src/app/api/contact/route.ts (rate limit -> honeypot check -> Joi validation -> save -> email)
  -> src/services/email/service.ts (Resend transport)
  -> src/services/email/templates/*.tsx (React Email components, rendered to HTML + text)
```

Two emails are sent per submission:
- **Admin notification** → `ADMIN_EMAIL` (falls back to `FROM_EMAIL`) — all submitted fields +
  submission ID, timestamp, IP address, user agent.
- **Visitor confirmation** (auto-reply) → the address the visitor submitted — thank-you copy,
  message summary, reference ID, expected response time.

## 1. Create a Resend account

Sign up at [resend.com](https://resend.com). Free tier: 3,000 emails/month, 100/day — plenty for a
portfolio contact form.

## 2. Add and verify your sending domain

1. Dashboard → **Domains** → **Add Domain** → enter your domain (e.g. `yourdomain.com`).
2. Resend generates DNS records — typically an SPF/TXT record, a DKIM/TXT record, and an
   MX record for the Return-Path/bounce subdomain. The exact host/value pairs are shown per-domain
   in the dashboard; copy them exactly.
3. **Where to add these records**: log into whichever service manages your domain's DNS.
   - **At your registrar** (Namecheap, GoDaddy, etc.): registrar dashboard → your domain →
     DNS / Nameservers → Manage DNS → Add Record. Paste in the type (TXT/MX), host/name, and
     value Resend gave you exactly as shown — don't add quotes Resend didn't include, and don't
     append your domain to the host field if Resend's UI already shows it as a full name.
   - **Cloudflare**: DNS tab → Add record. Same field mapping. Leave the proxy status
     ("orange cloud") **off** (grey/DNS-only) for these records — proxying breaks mail records.
   - **Vercel DNS**: Project → Domains → your domain → DNS Records → Add.
4. Save, then wait for propagation (usually minutes, can take up to 48h).
5. Back in the Resend dashboard, click **Verify DNS Records**. Repeat until every record shows
   green/verified.

## 3. Create an API key

Dashboard → **API Keys** → **Create API Key**.
- Scope: **Sending access** (not full account access).
- Restrict to your verified domain if the option is offered.
- Copy the key immediately — it's shown once.

## 4. Configure environment variables

Local development (`.env.local`, gitignored — never commit it):

```env
RESEND_API_KEY=re_your_key_here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your Name
ADMIN_EMAIL=you@example.com          # where admin notifications land
RATE_LIMIT_MAX=5                     # contact-form submissions per IP per window
RATE_LIMIT_WINDOW=900000             # window in ms (900000 = 15 min)
```

`FROM_EMAIL` must be on the verified domain (step 2) — Resend rejects sends from unverified
domains except to the account owner's own address (useful for early testing before verification
finishes).

Production (Vercel): Project Settings → Environment Variables → add the same keys for both
**Production** and **Preview** environments. Never put real secrets in `.env.example` or
`.env.production.example` — those are committed templates with empty values.

## 5. Test the transport in isolation

```bash
node scripts/test-resend-email.mjs
```

Sends one email directly through the Resend API, independent of the Next.js app — confirms the
key/domain/from-address combination works before testing the full form.

## 6. Test the full contact flow locally

```bash
npm run dev
```

Fill out the contact form at `/#contact`. Confirm:
- Admin notification arrives at `ADMIN_EMAIL`.
- Confirmation email arrives at the address you submitted.
- Check Resend dashboard → **Logs** for delivery status/errors on both.

Also verify the guardrails:
- **Honeypot**: in devtools, set the hidden `website` input's value to anything non-empty and
  submit. Expect a normal-looking success response, but no new document in the `Contact`
  collection and no emails sent (check server logs for a `contact_honeypot_triggered` security
  event).
- **Rate limit**: submit more than `RATE_LIMIT_MAX` times within the window. Expect a 429 and the
  frontend's "Too many requests. Please try again later." message.

## 7. Check domain status anytime

```bash
node scripts/check-resend-domain.mjs
```

Lists every domain on the account and each DNS record's verification status — useful while
waiting on propagation, or to sanity-check production config.

## Deployment checklist

- [ ] Domain verified in Resend (all DNS records green)
- [ ] `RESEND_API_KEY` set in Vercel for **Production** and **Preview**
- [ ] `FROM_EMAIL`, `FROM_NAME`, `ADMIN_EMAIL` set in Vercel for **Production** and **Preview**
- [ ] `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW` set (or accept the code fallback defaults)
- [ ] Honeypot field renders in the deployed form's HTML (view source, confirm the hidden
      `website` input is present and off-screen, not `display:none`)
- [ ] Test submission sent end-to-end on a **Preview** deployment URL before promoting to
      Production
- [ ] Resend dashboard → Logs shows the test send as delivered

## Reusing this in a future project

The pattern to copy: `src/services/email/{config,service,types}.ts` (transport + validation,
provider-specific only in `service.ts`'s `sendEmail()` and `config.ts`'s `getEmailConfig()`) +
`src/services/email/templates/` (`EmailLayout.tsx` owns header/footer once, every other template
just wraps itself in it). Swapping providers again later means touching only those two files —
every template and every call site (`emailService.sendX(...)`) stays the same.

## Troubleshooting

- **"Resend API error: domain not verified"** — the DNS records aren't fully propagated/verified
  yet, or `FROM_EMAIL` doesn't match the verified domain. Run
  `node scripts/check-resend-domain.mjs`.
- **Emails only deliver to your own address** — expected before domain verification completes;
  Resend restricts unverified-domain sends to the account owner.
- **429 immediately on first submission** — check `RATE_LIMIT_MAX`/`RATE_LIMIT_WINDOW`; the limiter
  is in-memory per server instance (`src/lib/contact/rateLimiter.ts`), so it resets on redeploy but
  is shared across all visitors hitting the same running instance.
- **No admin notification but confirmation arrived (or vice versa)** — the two sends are
  independent and failures are logged separately (`contact_admin_notification` /
  `contact_user_confirmation` in server logs); one failing doesn't block the other or fail the
  request.
