/**
 * Resend Smoke Test
 *
 * Sends a single test email directly through the Resend API to confirm
 * RESEND_API_KEY / FROM_EMAIL / FROM_NAME are configured correctly,
 * independent of the Next.js app.
 *
 * Usage: node scripts/test-resend-email.mjs
 */

import { config } from "dotenv";
import { Resend } from "resend";

config({ path: ".env.local" });

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL;
const fromName = process.env.FROM_NAME;
const to = process.env.ADMIN_EMAIL || fromEmail;

console.log("Resend smoke test");
console.log("- API key:", apiKey ? `${apiKey.slice(0, 8)}...` : "NOT SET");
console.log("- From:", fromEmail ? `"${fromName}" <${fromEmail}>` : "NOT SET");
console.log("- To:", to || "NOT SET");

if (!apiKey || !fromEmail || !to) {
  console.error("Missing RESEND_API_KEY, FROM_EMAIL, or ADMIN_EMAIL/FROM_EMAIL. Check .env.local.");
  process.exit(1);
}

const resend = new Resend(apiKey);

const { data, error } = await resend.emails.send({
  from: `"${fromName}" <${fromEmail}>`,
  to,
  subject: "Resend smoke test from portfolio app",
  html: "<p>This is a test email confirming Resend is configured correctly.</p>",
  text: "This is a test email confirming Resend is configured correctly.",
});

if (error) {
  console.error("Send failed:", error.message);
  process.exit(1);
}

console.log("Sent. Message ID:", data?.id);
console.log("Check the Resend dashboard -> Logs for delivery status.");
