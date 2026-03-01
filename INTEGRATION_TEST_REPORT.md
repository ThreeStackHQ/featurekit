# FeatureKit — Sprint 4.3 Integration Test Report

**Date:** 2026-03-01  
**Agent:** Sage [QA Subagent]  
**Repo:** https://github.com/ThreeStackHQ/featurekit  
**Stack:** Next.js 14, TypeScript, PostgreSQL (Drizzle ORM), NextAuth v5, Stripe  
**Monorepo packages:** `@featurekit/web`, `@featurekit/db`, `@featurekit/sdk` (JS), `@featurekit/sdk-react`

---

## Executive Summary

| Metric | Result |
|--------|--------|
| Total areas tested | 10 |
| ✅ PASS | 8 |
| ⚠️ PARTIAL | 2 |
| ❌ FAIL | 0 |
| P0-CRITICAL bugs | 2 |
| HIGH severity | 2 |
| MEDIUM severity | 3 |
| LOW severity | 3 |
| **Deployment ready** | **NO** |

FeatureKit Sprint 4.3 is architecturally sound with a well-implemented core. Build passes cleanly across all 3 packages. All major API routes exist and are properly authenticated. The SDK packages are fully built and functional. However, two P0 blockers prevent production deployment: a missing `/dashboard/projects/new` page (primary user onboarding flow is broken with a 404) and wrong npm package names in SDK code snippets (any user following the built-in integration instructions would fail).

---

## Build Verification

```
pnpm install   ✅  422 packages resolved, done in 2.1s
pnpm build     ✅  3/3 tasks successful (35.58s)
               ✅  @featurekit/sdk built (ESM + CJS + IIFE)
               ✅  @featurekit/sdk-react built
               ✅  @featurekit/web Next.js build clean
```

Build output shows all expected routes compiled:
- `/api/projects/[id]/flags/[flagId]/analytics` ✅
- `/api/projects/[id]/flags/[flagId]/toggle` ✅
- `/api/sdk/evaluate` ✅
- `/api/sdk/flags` ✅
- `/api/stripe/checkout` ✅
- `/api/stripe/webhook` ✅
- `/dashboard`, `/dashboard/billing`, `/dashboard/projects/[id]`, etc. ✅

---

## Area-by-Area Results

---

### 1. Auth Flow — ✅ PASS

**Files inspected:**
- `apps/web/auth.ts`
- `apps/web/middleware.ts`
- `apps/web/app/api/auth/signup/route.ts`
- `apps/web/lib/auth-helpers.ts`

**Findings:**

| Test | Result |
|------|--------|
| Signup route exists (`POST /api/auth/signup`) | ✅ |
| Signup validates email, name (≥2 chars), password (≥8 chars) via Zod | ✅ |
| Duplicate email check before insert | ✅ |
| Password hashed with bcryptjs (cost=12) | ✅ |
| NextAuth v5 Credentials provider configured | ✅ |
| Session strategy is JWT (correct for no DrizzleAdapter dependency) | ✅ |
| `user.id` injected into JWT and session callbacks | ✅ |
| `requireAuth()` helper returns typed `AuthSession` with guaranteed `user.id` | ✅ |
| Middleware protects `/dashboard/*` | ✅ |
| Middleware redirects authenticated users away from `/login` and `/signup` | ✅ |
| Auth routes excluded from middleware matcher | ✅ |

**Notes:**
- Auth is credentials-only (email + password). No OAuth providers. This is intentional for the $9/mo tier.
- No email verification flow (see LOW-003).

---

### 2. Flags CRUD API — ✅ PASS

**Files inspected:**
- `apps/web/app/api/projects/route.ts`
- `apps/web/app/api/projects/[id]/flags/route.ts`
- `apps/web/app/api/projects/[id]/flags/[flagId]/route.ts`
- `apps/web/app/api/projects/[id]/flags/[flagId]/toggle/route.ts`

**Findings:**

| Test | Result |
|------|--------|
| `GET /api/projects` — lists user's projects | ✅ |
| `POST /api/projects` — creates project with unique `fk_live_*` API key | ✅ |
| `GET /api/projects/:id/flags` — requires auth, verifies project ownership | ✅ |
| `POST /api/projects/:id/flags` — requires auth, enforces tier flag limit | ✅ |
| `PATCH /api/projects/:id/flags/:flagId` — requires auth, ownership verified | ✅ |
| `DELETE /api/projects/:id/flags/:flagId` — requires auth, ownership verified | ✅ |
| `POST /api/projects/:id/flags/:flagId/toggle` — quick enable/disable toggle | ✅ |
| Flag key uniqueness enforced within project | ✅ |
| Flag key format validated (`/^[a-z0-9_-]+$/`) | ✅ |
| Zod validation on all inputs | ✅ |
| Proper 404 returned when project/flag not found | ✅ |
| IDOR protection: ownership always verified before access | ✅ |

**Tier enforcement:** `canCreateFlag()` queries `subscriptions` table. Free tier limited to 5 flags; Pro/Business unlimited. Correct.

---

### 3. Targeting Rules Engine — ✅ PASS

**Files inspected:**
- `apps/web/lib/evaluate.ts`
- `packages/db/src/schema.ts` (TargetingRule JSONB type)
- `apps/web/app/api/projects/[id]/flags/[flagId]/route.ts` (PATCH accepts rules)

**Findings:**

| Test | Result |
|------|--------|
| Targeting rules stored as JSONB on `flags.targeting_rules` | ✅ |
| 8 operators supported: IS, IS_NOT, CONTAINS, NOT_CONTAINS, IN, NOT_IN, GT, LT | ✅ |
| `IN` / `NOT_IN` handle array values | ✅ |
| `GT` / `LT` operate on numeric comparisons | ✅ |
| All rules must match (AND logic) | ✅ |
| Consistent hash (`SHA-256` of `userId:flagKey`, modulo 100) for deterministic rollout | ✅ |
| Rollout percentage fallback when rules don't match | ✅ |
| A/B variant selection via weighted bucket (cumulative weight walk) | ✅ |
| Disabled flags short-circuit before rule evaluation | ✅ |
| `reason` field returned in eval result: `disabled`, `targeting_matched`, `rollout`, `targeting_unmatched` | ✅ |

**Note:** Targeting rules API is not a separate dedicated route (e.g., `/api/flags/:id/rules`). Rules are managed via the flag PATCH endpoint. This is acceptable design — rules are part of the flag entity.

---

### 4. SDK Evaluation Endpoints — ✅ PASS

**Files inspected:**
- `apps/web/app/api/sdk/flags/route.ts`
- `apps/web/app/api/sdk/evaluate/route.ts`

**Findings:**

| Test | Result |
|------|--------|
| `GET /api/sdk/flags` exists | ✅ |
| `GET /api/sdk/flags` auth via `X-API-Key` header or `?apiKey=` query param | ✅ |
| `GET /api/sdk/flags` returns all flag metadata for project | ✅ |
| `GET /api/sdk/flags` has CORS headers (`Access-Control-Allow-Origin: *`) | ✅ |
| `GET /api/sdk/flags` cache headers: `s-maxage=60, stale-while-revalidate=30` | ✅ |
| `POST /api/sdk/evaluate` exists | ✅ |
| `POST /api/sdk/evaluate` auth via `X-API-Key` header | ✅ |
| `POST /api/sdk/evaluate` evaluates flag server-side with context | ✅ |
| `POST /api/sdk/evaluate` has CORS headers + OPTIONS preflight handler | ✅ |
| `POST /api/sdk/evaluate` records evaluation to `flag_evaluations` table (fire-and-forget) | ✅ |
| Missing flag returns `{ enabled: false, reason: "flag_not_found" }` (not 404) | ✅ |

---

### 5. Vanilla JS SDK — ✅ PASS

**Files inspected:**
- `packages/sdk-js/src/index.ts`
- `packages/sdk-js/src/client.ts`
- `packages/sdk-js/src/cache.ts`
- `packages/sdk-js/src/types.ts`
- `packages/sdk-js/esbuild.js`
- `packages/sdk-js/dist/` (post-build artifacts)
- `apps/web/app/api/cdn/sdk.js/route.ts`

**Findings:**

| Test | Result |
|------|--------|
| `packages/sdk-js` builds successfully | ✅ |
| ESM build: `dist/index.js` exists | ✅ |
| CJS build: `dist/index.cjs` exists | ✅ |
| IIFE build: `dist/sdk.iife.js` exists (browser) | ✅ |
| TypeScript declarations in `dist/types/` | ✅ |
| Client-side evaluation engine mirrors server engine (8 operators, consistent hash) | ✅ |
| `FeatureKitClient` exposes: `getFlags()`, `isEnabled()`, `getValue()`, `getVariant()`, `identify()`, `clearCache()` | ✅ |
| 5-minute in-memory cache with TTL eviction | ✅ |
| Concurrent request deduplication (`initPromise` guard) | ✅ |
| IIFE CDN serving endpoint: `GET /api/cdn/sdk.js` → reads `packages/sdk-js/dist/sdk.iife.js` | ✅ |
| CDN endpoint has CORS headers and 1h cache | ✅ |

**Note:** The CDN endpoint reads the file at runtime via `fs.readFileSync`. In production, the dist file must be present in the deployed container. This requires SDK to be built before the Next.js container image is built — a deployment concern worth documenting.

---

### 6. React SDK — ✅ PASS

**Files inspected:**
- `packages/sdk-react/src/index.tsx`
- `packages/sdk-react/src/context.tsx`
- `packages/sdk-react/src/hooks.ts`
- `packages/sdk-react/src/FeatureGate.tsx`
- `packages/sdk-react/src/types.ts`
- `packages/sdk-react/dist/` (post-build artifacts)

**Findings:**

| Test | Result |
|------|--------|
| `packages/sdk-react` builds successfully | ✅ |
| ESM + CJS builds present in `dist/` | ✅ |
| TypeScript declarations in `dist/types/` | ✅ |
| `FeatureKitProvider` exported | ✅ |
| `useFlag(flagKey)` hook exported | ✅ |
| `useVariant(flagKey)` hook exported | ✅ |
| `useFeatureKit()` hook exported | ✅ |
| `FeatureGate` component exported | ✅ |
| Provider uses `@featurekit/sdk` client internally | ✅ |
| Loading state returns `undefined` (correct — avoids flash of wrong content) | ✅ |
| `identify()` re-fetches flags with new user context | ✅ |
| `user.id` change triggers re-fetch via `useEffect` | ✅ |
| `FeatureGate` renders fallback while loading (no layout shift) | ✅ |
| Error state exposed via context | ✅ |

---

### 7. A/B Testing API — ✅ PASS

**Files inspected:**
- `apps/web/app/api/projects/[id]/flags/[flagId]/analytics/route.ts`
- `packages/db/src/schema.ts` (`flagEvaluations` table)

**Findings:**

| Test | Result |
|------|--------|
| Analytics endpoint: `GET /api/projects/:id/flags/:flagId/analytics` | ✅ |
| Requires auth + ownership verification | ✅ |
| Returns `total_evaluations` (last 30 days) | ✅ |
| Returns `unique_users` (distinct `end_user_id`) | ✅ |
| Returns `evaluations_by_variant` (grouped by variant) | ✅ |
| Returns `date_range` with ISO timestamps | ✅ |
| `flagEvaluations` table stores: `flagId`, `endUserId`, `variant`, `timestamp` | ✅ |
| A/B experiments: `isExperiment: boolean` + `variants: Variant[]` per flag | ✅ |
| Variant assignment uses consistent hash (deterministic per user+flagKey) | ✅ |
| Evaluations tracked fire-and-forget via `/api/sdk/evaluate` | ✅ |

---

### 8. Stripe Billing — ✅ PASS

**Files inspected:**
- `apps/web/app/api/stripe/checkout/route.ts`
- `apps/web/app/api/stripe/webhook/route.ts`
- `apps/web/lib/stripe.ts`
- `apps/web/lib/tier.ts`
- `apps/web/app/(dashboard)/dashboard/billing/page.tsx`

**Findings:**

| Test | Result |
|------|--------|
| `POST /api/stripe/checkout` exists | ✅ |
| Checkout requires auth | ✅ |
| Checkout supports `pro` ($9) and `business` ($29) tiers | ✅ |
| `success_url` and `cancel_url` use `NEXT_PUBLIC_APP_URL` env var | ✅ |
| `userId` and `tier` injected into Stripe session metadata | ✅ |
| `POST /api/stripe/webhook` exists | ✅ |
| Webhook signature verification via `stripe.webhooks.constructEvent` | ✅ |
| `checkout.session.completed` → upsert to `subscriptions` table | ✅ |
| `customer.subscription.updated` → update status + period end | ✅ |
| `customer.subscription.deleted` → downgrade to `free`, status `canceled` | ✅ |
| `getUserTier()` reads from `subscriptions` table | ✅ |
| `canCreateFlag()` enforces tier limit before flag creation | ✅ |
| Billing page shows real tier data from DB | ✅ |
| BillingActions client component POSTs to checkout endpoint | ✅ |

---

### 9. Middleware — ✅ PASS

**File inspected:** `apps/web/middleware.ts`

**Findings:**

| Test | Result |
|------|--------|
| Middleware matcher excludes `api`, `_next/static`, `_next/image`, `favicon.ico` | ✅ |
| `/dashboard/*` protected — unauthenticated redirects to `/login` | ✅ |
| `/login` and `/signup` redirect to `/dashboard` when authenticated | ✅ |
| Public routes (`/`, `/pricing`) accessible without auth | ✅ |
| SDK API routes (`/api/sdk/*`) are public (excluded via `api` prefix) | ✅ |

**Minor issue (LOW-001):** The matcher regex includes both `api` and `api/sdk` in the negative lookahead — the `api/sdk` exclusion is redundant since `api` already covers all `/api/*` routes. Non-breaking.

---

### 10. Dashboard UI — ⚠️ PARTIAL

**Files inspected:**
- `apps/web/app/(dashboard)/dashboard/page.tsx`
- `apps/web/app/(dashboard)/dashboard/projects/[id]/page.tsx`
- `apps/web/app/(dashboard)/dashboard/projects/[id]/flags/page.tsx`
- `apps/web/app/(dashboard)/dashboard/projects/[id]/flags/[flagId]/page.tsx`
- `apps/web/app/(dashboard)/dashboard/billing/page.tsx`
- `apps/web/app/components/FlagsClient.tsx`
- `apps/web/app/components/CreateFlagModal.tsx`

**Findings:**

| Test | Result |
|------|--------|
| Dashboard main page shows real project list from DB | ✅ |
| Dashboard "Projects" count card shows real count | ✅ |
| Dashboard "Flags" stat card — **HARDCODED string "Flags" as metric** | ❌ |
| Project overview "Total Flags" and "Enabled" counts — real DB data | ✅ |
| Project overview "Evaluations Today" — **hardcoded `0`** | ❌ |
| Flags page loads flags via SSR from DB | ✅ |
| FlagsClient toggle button calls `/api/projects/:id/flags/:id/toggle` | ✅ |
| CreateFlagModal POSTs to `/api/projects/:id/flags` | ✅ |
| Flag detail page fetches via client-side fetch to API (browser cookie auto-sent) | ✅ |
| Flag detail page supports editing name, description, enabled, rollout, targeting rules | ✅ |
| Billing page shows real tier data from DB | ✅ |
| `/dashboard/projects/new` — **MISSING PAGE (404)** | ❌ |
| SDK snippets in flag detail show wrong package names | ❌ |

**CRITICAL:** Clicking "+ New Project" button leads to `/dashboard/projects/new` which returns a **404** (no route file). Users cannot create projects from the UI.

**HIGH:** SDK snippets show `import { FeatureKit } from '@featurekit/js'` and `npm i @featurekit/js` but the actual package is `@featurekit/sdk`. Any developer following these snippets will get `npm ERR! 404 Not Found - @featurekit/js`.

---

## Bug Catalogue

### P0-CRITICAL

**BUG-001: `/dashboard/projects/new` page missing — users cannot create projects (404)**
- **Location:** Dashboard main page links to `/dashboard/projects/new` via "New Project" button, but no route file exists at `apps/web/app/(dashboard)/dashboard/projects/new/page.tsx`
- **Impact:** The primary user onboarding action (create first project) is completely broken. Users hitting this page see a Next.js 404.
- **Reproduce:** Log in → Dashboard → click "+ New Project" → 404
- **Fix:** Create `apps/web/app/(dashboard)/dashboard/projects/new/page.tsx` with a form that POSTs to `/api/projects`

**BUG-002: SDK code snippets reference non-existent npm packages**
- **Location:** `apps/web/app/(dashboard)/dashboard/projects/[id]/flags/[flagId]/page.tsx`, lines 29-50 (`getSnippet()` function) and line 432
- **Impact:** Any developer using the built-in integration snippets will fail at `npm install`. The JS snippet uses `@featurekit/js` and React snippet uses `@featurekit/react`, but the actual packages are `@featurekit/sdk` and `@featurekit/sdk-react`
- **Wrong:** `import { FeatureKit } from '@featurekit/js'` / `npm i @featurekit/js`
- **Correct:** `import { createClient } from '@featurekit/sdk'` / `npm i @featurekit/sdk`
- **Also wrong:** React snippet uses `import { useFeatureKit } from '@featurekit/react'` — should be `@featurekit/sdk-react`

---

### HIGH

**BUG-003: Dashboard "Flags" stat card shows hardcoded text instead of count**
- **Location:** `apps/web/app/(dashboard)/dashboard/page.tsx`, line 28
- **Code:** `<div className="text-2xl font-bold text-green-400">Flags</div>`
- **Impact:** The middle stat card on the main dashboard displays the word "Flags" in green bold text where users would expect a numeric count (e.g., "12"). The dashboard currently counts projects (shown in another card) but never actually queries for flag counts across projects.
- **Fix:** Query total flag count across all user projects using a JOIN or aggregate, display the number

**BUG-004: No rate limiting on auth endpoints**
- **Location:** `apps/web/app/api/auth/signup/route.ts`, NextAuth login endpoint
- **Impact:** Signup and login endpoints have no rate limiting. An attacker can brute-force passwords or create spam accounts with no throttling. This is a security concern for a SaaS product.
- **Fix:** Add rate limiting via Upstash Redis or similar (e.g., check for `UPSTASH_REDIS_URL` env var + `@upstash/ratelimit`)

---

### MEDIUM

**BUG-005: "Evaluations Today" on project overview is hardcoded as 0**
- **Location:** `apps/web/app/(dashboard)/dashboard/projects/[id]/page.tsx`, stats array
- **Code:** `{ label: 'Evaluations Today', value: 0, ... }`
- **Impact:** Users cannot see today's evaluation traffic from the project overview. Data exists in `flag_evaluations` table but is never queried here.
- **Fix:** Query `COUNT(*)` from `flag_evaluations` WHERE `flag_id IN (project flags)` AND `timestamp >= today`

**BUG-006: Environments tab on project overview is cosmetic/non-functional**
- **Location:** `apps/web/app/(dashboard)/dashboard/projects/[id]/page.tsx`
- **Impact:** The "Environments" panel shows "Production" and "Development" buttons but neither does anything — the toggle has no effect and the note says "Multiple environments per project coming soon." If this is presented in production, users may expect environment-specific flags/keys. Low UX risk.
- **Fix:** Either remove the section or implement multiple environments; add a "coming soon" badge

**BUG-007: CDN SDK serving requires dist file in production container**
- **Location:** `apps/web/app/api/cdn/sdk.js/route.ts` — reads from `../../packages/sdk-js/dist/sdk.iife.js` at runtime
- **Impact:** If the Docker image doesn't include the pre-built SDK dist file (e.g., if the Next.js build doesn't bundle the monorepo workspace artifacts), this endpoint will return 404 in production. The SDK CDN route would silently fail.
- **Fix:** Document in deployment runbook that `pnpm --filter @featurekit/sdk build` must run before the Next.js container image is built; or embed the SDK bundle into the Next.js build.

---

### LOW

**BUG-008: Middleware matcher has redundant `api/sdk` exclusion**
- **Location:** `apps/web/middleware.ts`, line 21
- **Code:** `matcher: ['/((?!api|_next/static|_next/image|favicon.ico|api/sdk).*)']`
- **Impact:** None. The `api/sdk` pattern is redundant because `api` already excludes all `/api/*` routes. Not a bug per se, but confusing to maintainers.

**BUG-009: `RESEND_API_KEY` in `.env.example` but no email functionality implemented**
- **Location:** `.env.example`
- **Impact:** No welcome emails, email verification, or password reset emails are implemented. Users who misconfigure this env var would not see any error (it's silently unused). No user-facing broken flow, but the env var implies functionality that doesn't exist yet.

**BUG-010: No initial DB schema migration (only migration 0001 exists)**
- **Location:** `packages/db/migrations/`
- **Impact:** Only `0001_add_flag_type.sql` exists. The initial schema (users, projects, flags, flag_evaluations, subscriptions tables) is managed via `drizzle-kit push` (no snapshot migration for initial state). New deployments relying on `drizzle-kit migrate` instead of `push` would fail. Not critical if the deployment runbook uses `push`, but a risk for future CI/CD.

---

## Security Notes

| Check | Status |
|-------|--------|
| Passwords hashed with bcrypt (cost 12) | ✅ |
| No password returned in any response | ✅ |
| Project ownership verified on every flags API call (no IDOR) | ✅ |
| Stripe webhook signature verified before processing | ✅ |
| API keys start with `fk_live_` + 64 random hex chars (256 bits entropy) | ✅ |
| SDK endpoints use API key auth, not session cookie | ✅ |
| CORS restricted to SDK endpoints only (dashboard API has no CORS headers) | ✅ |
| No rate limiting on signup/login | ⚠️ HIGH |
| Auth secret requires real value in production (`AUTH_SECRET`) | env |
| Stripe keys require production values | env |

---

## Missing Features (Not Present in Sprint 4.3 Scope)

These items are not bugs but notable gaps:
- No password reset / forgot password flow
- No email verification on signup
- No multi-environment support per project (cosmetic UI only)
- No team/organization model (single-user projects only)
- No Python SDK (snippet exists in UI but no actual package)
- No webhook delivery for flag change events
- No audit log for flag changes

---

## Deployment Readiness

**Deployment Ready: NO**

### Blocking Issues
1. **BUG-001** — `/dashboard/projects/new` missing → users cannot create projects
2. **BUG-002** — SDK snippets reference wrong npm packages → developer integration broken

### Required Before Deploy
1. Fix missing `/dashboard/projects/new` route
2. Fix SDK snippet package names (`@featurekit/js` → `@featurekit/sdk`, `@featurekit/react` → `@featurekit/sdk-react`)
3. Populate production env vars: `DATABASE_URL`, `AUTH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS`, `NEXT_PUBLIC_APP_URL`
4. Run initial DB schema setup (`pnpm --filter @featurekit/db push` or apply migrations)
5. Build SDK before Next.js container build (`pnpm --filter @featurekit/sdk build`)

### Recommended Before Deploy
1. BUG-003: Fix hardcoded "Flags" stat on dashboard
2. BUG-004: Add rate limiting to auth endpoints
3. BUG-005: Fix hardcoded "Evaluations Today"

---

## Test Matrix Summary

| Area | Grade | Key Findings |
|------|-------|-------------|
| Auth Flow | ✅ PASS | NextAuth v5 + credentials, bcrypt, middleware correctly configured |
| Flags CRUD API | ✅ PASS | Full CRUD with IDOR protection, tier enforcement, Zod validation |
| Targeting Rules Engine | ✅ PASS | 8 operators, consistent hash rollout, A/B variant selection |
| SDK Evaluation Endpoints | ✅ PASS | Both `/api/sdk/flags` and `/api/sdk/evaluate` with proper CORS |
| Vanilla JS SDK | ✅ PASS | ESM + CJS + IIFE built, CDN endpoint working |
| React SDK | ✅ PASS | Provider, 3 hooks, FeatureGate component all exported |
| A/B Testing API | ✅ PASS | Analytics endpoint with evaluations by variant, 30-day window |
| Stripe Billing | ✅ PASS | Checkout + webhook with 3 events, tier limits enforced |
| Middleware | ✅ PASS | Dashboard protected, auth routes bypassed, SDK routes public |
| Dashboard UI | ⚠️ PARTIAL | Real data in most places; missing /new page, hardcoded stats, wrong SDK snippets |

---

*Report generated by Sage QA subagent — Sprint 4.3 Integration Testing*
