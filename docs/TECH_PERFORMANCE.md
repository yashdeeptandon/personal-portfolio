# Tech Performance

A public, data-driven developer dashboard at `/tech-performance` — the engineering-activity
counterpart to the existing Apple Health dashboard at `/performance`. It aggregates real
coding activity from GitHub and WakaTime (LeetCode planned, see [Known limitations](#known-limitations))
into one page: coding hours, contribution streaks, engineering output, skill signals, an
activity timeline, an auto-generated impact narrative, and configurable goals.

This document covers architecture and setup. For the section-by-section feature list, see the
original product spec; this doc is about how it's built and how to run it.

---

## Setup guide

### 1. GitHub

1. Create a token at <https://github.com/settings/tokens> (classic PAT is simplest).
   - Scopes: `read:user` always; add `repo` only if you want private-repo contributions
     counted (public-repo-only access works with no extra scope beyond the default).
2. Set in `.env.local` (or your deploy environment):
   ```env
   GITHUB_TOKEN=ghp_xxxxxxxxxxxx
   GITHUB_USERNAME=your-github-username
   ```
3. That's it — no app registration, no OAuth flow. This is a server-side PAT used to call
   the GitHub REST and GraphQL APIs; it is never sent to the browser.

### 2. WakaTime

1. Get your API key from <https://wakatime.com/settings/api-key>.
2. Set in `.env.local`:
   ```env
   WAKATIME_API_KEY=waka_xxxxxxxxxxxx
   ```
3. Note: WakaTime's raw API data retention depends on your plan. The activity/streak
   calculation requests up to 365 days of daily summaries; on a free plan you may see a
   shorter effective history. This is a WakaTime account-plan limitation, not a bug here —
   the page degrades gracefully to whatever range the API actually returns.

### 3. LeetCode — not active yet

Deferred to a follow-up (see [Known limitations](#known-limitations)). `LEETCODE_USERNAME`
is reserved in `.env.example` for when it ships; leaving it unset keeps the feature
invisible with no error.

### Verifying it's working

- Visit `/tech-performance`. With no providers configured you'll see an explicit
  "No providers connected yet" state, not a broken page.
- As an authenticated admin, the page header shows a **Refresh now** button — click it to
  force an immediate sync rather than waiting for the next stale read.
- `GET /api/tech-performance/status` (public) reports each provider's configured/connected
  state and last-synced time — useful for confirming credentials took effect after a deploy.

---

## Architecture

### Data flow

```
Upstream API (GitHub / WakaTime)
        │  fetch, on-demand or scheduled
        ▼
Provider.fetchSnapshot()  (src/services/tech-performance/providers/*)
        │  normalizes into {type, data} snapshots + NormalizedActivityEvent[]
        ▼
syncProvider()  (src/services/tech-performance/sync.ts)
        │  upserts…
        ├──▶ TechSnapshot   (one doc per {type}, e.g. "github:contributions")
        └──▶ ActivityEvent  (idempotent upsert on {provider,type,externalId})
        ▼
Section handler  (src/lib/tech-performance/sections/*.ts)
        │  reads TechSnapshot/ActivityEvent, shapes the UI response,
        │  and — as a side effect — triggers a re-sync if stale
        ▼
GET /api/tech-performance/[section]   (public, cached)
        ▼
useTechPerformanceData()  →  React components
```

The public API never calls an upstream provider directly or synchronously. It always reads
already-cached Mongo data and returns immediately; staleness is handled asynchronously (see
below). This means the page's latency and uptime are fully decoupled from GitHub/WakaTime's
uptime — if an upstream API is down, the page keeps serving the last-known-good data with a
"Sync error — showing last known data" badge instead of breaking.

### Provider abstraction

Every data source (GitHub, WakaTime, and the local `blog`/`projects` providers that surface
existing site content in the same timeline) implements one interface:

```ts
interface TechProvider {
  readonly id: string;
  isConfigured(): boolean;           // pure env-var check, no I/O
  fetchSnapshot(): Promise<ProviderSnapshotResult>;  // never throws
}
```

`fetchSnapshot()` returns `{ success, snapshots: [{type, data}], events?, error? }` — it
always resolves to a result object, even on failure, so the sync engine never needs a
try/catch around calling it.

**File layout:**
```
src/services/tech-performance/
  types.ts, registry.ts, sync.ts, staleness.ts, refreshLock.ts, scheduler.ts
  providers/
    github/    {config,rest,graphql,service,types,index}.ts
    wakatime/  {config,api,service,types,index}.ts
  local/
    blog/      {service,index}.ts
    projects/  {service,index}.ts
```

**Adding a new provider** (e.g. Codeforces, or LeetCode when it's built):
1. New folder `providers/<id>/` implementing `TechProvider`.
2. One line in `registry.ts`'s `PROVIDERS` map.
3. One env var, added to `.env.example`/`.env.production.example` and
   `src/lib/utils/env-validation.ts`'s `OPTIONAL_VARS`.
4. A normalizer mapping the provider's raw response to `TechSnapshot` types and
   `NormalizedActivityEvent[]`.

Nothing else changes — the sync engine, staleness logic, rate limiter, and public routes are
all provider-agnostic.

### Authentication / token handling

- `GITHUB_TOKEN` and `WAKATIME_API_KEY` are read server-side only (`process.env`, inside
  `config.ts` files under each provider), never passed to a client component or included in
  any API response. Public routes return only the *normalized* `TechSnapshot.data`, never a
  raw upstream response.
- The admin-only mutation routes (`/api/admin/tech-performance/*`) reuse the existing
  `withAdminAuth` middleware (NextAuth session + `role === "admin"` check) — the same guard
  used by every other admin route in this app. No new auth mechanism was introduced.

### Caching strategy

Two layers:

1. **Application-layer stale-while-revalidate.** Each `TechSnapshot` doc has `fetchedAt` and
   `staleAt` (TTL varies by data type — see `SNAPSHOT_TTL` in
   `src/lib/tech-performance/constants.ts`, 5 min to 24 h). A `GET` always returns whatever's
   cached; if `staleAt` has passed, it fires an async re-sync (`maybeTriggerRefresh`) without
   blocking the response. An in-memory lock (`refreshLock.ts`) ensures concurrent requests
   don't trigger duplicate upstream calls — this is safe because the app runs as a single
   long-running Node process (self-hosted Docker, not serverless).
2. **HTTP `Cache-Control` headers** on top (`public, s-maxage=…, stale-while-revalidate=…`)
   — a coarser layer protecting the Node process/DB from public traffic bursts, independent
   of the Mongo-layer logic that protects the *upstream providers*.

A background ticker (`src/instrumentation.ts` → `scheduler.ts`, `setInterval` every ~15 min)
also proactively re-syncs stale providers even with zero page traffic — a recruiter's visit
is often one-shot, so the page shouldn't depend on someone else's visit to trigger the
refresh that makes the data fresh for them.

### Rate-limit handling

- The SWR design already bounds upstream call volume to roughly one call per TTL window,
  globally (not per-visitor).
- `rate-limiter-flexible` (`RateLimiterMemory`) additionally guards the admin manual-refresh
  endpoint (5 requests/60s per provider) — the one path that deliberately bypasses the
  staleness check by design.
- GitHub and WakaTime both have generous, documented, token-authenticated rate limits, so no
  additional outbound limiter was needed for them. (When LeetCode ships, its unofficial
  endpoint will get a dedicated, stricter outbound limiter — see Known limitations.)
- All upstream fetches go through `fetchWithTimeout()` (`src/lib/tech-performance/fetchWithTimeout.ts`)
  so a slow or hung upstream call can't wedge the in-memory refresh lock indefinitely.

### Data model

- **`TechSnapshot`** — generic `{type, provider, data, source, status, fetchedAt, staleAt}`
  cache, one document per data shape (e.g. `github:repos`, `wakatime:summary`). Mirrors the
  `HealthData` model's blob-store idiom used by `/performance`.
- **`ActivityEvent`** — normalized cross-provider timeline entry
  `{provider, type, timestamp, title, url?, externalId, metadata}`, idempotently upserted on
  `{provider, type, externalId}`. This single collection backs the Activity Timeline, the
  Coding Consistency heatmap, per-language skill trends, and the Engineering Impact metrics —
  it's the source of history, not just a display list.
- **`TechGoal`** — admin-configured target `{key, label, metric, period, target, unit}`.
  Progress is computed at request time from `TechSnapshot`/`ActivityEvent` (see
  `src/lib/tech-performance/goalProgress.ts`) rather than stored, since a cached progress
  value would just be a second staleness clock to keep in sync with the first.

---

## Known limitations

- **LeetCode is not implemented yet.** LeetCode has no official public API. When this ships,
  it will use the same unofficial GraphQL endpoint `leetcode.com/graphql` uses client-side —
  undocumented, unauthenticated, and can change or rate-limit without notice. The plan is to
  clearly label it "Unofficial source" in the UI (the `DataSourceBadge` component already
  supports this) and fall back to an admin-entered manual override if the live scrape fails.
- **GitHub's public events feed (`/users/{u}/events/public`) only retains ~90 days** and
  frequently omits the `commits` array on `PushEvent` (GitHub trims large payloads) — when
  that happens, the timeline shows one generic "Pushed to `<repo>`" entry instead of the
  individual commit messages. This also means the "commit composition" (feat/fix/docs/chore)
  breakdown on the Impact tab can legitimately show mostly "other" if GitHub isn't returning
  commit messages for your account's recent activity — that's an honest reflection of what
  the API returned, not a broken classifier.
- **"PRs merged" and similar counts are period-accurate for `today`/`7d`/`30d` only.** For
  `year`/`all-time` windows, the 90-day event-feed limitation above means the figure falls
  back to GitHub's Search-API-derived all-time total instead of an undercounted tally — the
  API response marks this via `prsMergedIsAllTime` so the UI never mislabels a partial number
  as period-accurate.
- **WakaTime history depth depends on your account plan** (see Setup guide above).
- **No admin UI page for creating "manual achievement" timeline entries yet** — the CRUD API
  (`/api/admin/tech-performance/achievements`) is fully functional and validated, but there's
  no form on `/tech-performance` for it (unlike Goals, which has an inline admin form). Use
  the API directly, or ask for the form to be added as a follow-up.
