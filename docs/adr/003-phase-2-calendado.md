Perfect. Here’s a clean, Cursor-ready task plan you can paste step-by-step. Each task includes a **Prompt for Cursor**, **Files to touch**, and **Acceptance Criteria (AC)**.

---

# Task 1 — Firestore data models & indexes

**Prompt for Cursor**

> Act as a senior Firebase architect. Create/confirm Firestore collections and composite indexes for: `/waitlist`, `/invites`, `/auditLogs`, `/orgs`, `/orgs/{orgId}/stores`, `/orgs/{orgId}/professionals`, `/publicLinks`, `/users`. Provide TS interfaces and seed helpers.
> Add indexes for:
>
> * `waitlist (status ASC, createdAt DESC)`
> * `invites (email ASC, used ASC, expiresAt DESC)`
> * `publicLinks (slug ASC, type ASC, status ASC)`
> * `professionals (orgId ASC, slug ASC)`
> * `stores (orgId ASC, slug ASC)`
>   Output: `functions/src/models.ts`, `firestore.indexes.json`, seed script `functions/scripts/seed.ts`.

**Files**: `functions/src/models.ts`, `firestore.indexes.json`, `functions/scripts/seed.ts`
**AC**: Types compile; indexes lint; seed inserts 2 brands, 2 stores, 3 pros, 3 waitlist entries.

---

# Task 2 — Security rules (roles & scopes)

**Prompt for Cursor**

> Write `firestore.rules` enforcing:
>
> * Platform superadmin via custom claim `platformAdmin=true`.
> * Org roles via `roles[orgId] in {'owner','org_admin','store_manager','professional','viewer'}`.
> * Public read for `/publicLinks`.
> * Write permissions: owner/org_admin at org level; store_manager for `/stores` and their professionals; professionals can update own profile only.
> * Read: org members; brand public where flagged.
>   Provide a `rules.test.ts` with unit tests using Firebase Emulator.

**Files**: `firestore.rules`, `functions/test/rules.test.ts`
**AC**: All tests green in emulator.

---

# Task 3 — Cloud Functions: waitlist invite/reject

**Prompt for Cursor**

> Implement callable HTTPS functions in `functions/src/waitlist.ts`:
>
> * `inviteFromWaitlist(entryId, role?, orgId?)` → validates admin; idempotent; creates `/invites` with `expiresAt`; updates `/waitlist.status='invited'`; writes `/auditLogs`.
> * `rejectWaitlist(entryId, reason?)` → soft-rejects; logs audit.
>   Shared helpers in `functions/src/lib/authz.ts` and `functions/src/lib/audit.ts`.
>   Return typed results & errors.

**Files**: `functions/src/waitlist.ts`, `functions/src/lib/authz.ts`, `functions/src/lib/audit.ts`
**AC**: Unit tests stubbed; emulator manual test succeeds.

---

# Task 4 — Resend integration + magic link

**Prompt for Cursor**

> Add Resend email sender. Create `functions/src/email.ts` with `sendInviteEmail({email, token, brandName?})`.
> ENV: `RESEND_API_KEY`, `PUBLIC_APP_URL`.
> Create function `issueMagicLink(inviteId)` → signed token (JWT) with 24–72h expiry; URL: `${PUBLIC_APP_URL}/invite/{token}`.
> Email template minimal HTML with CTA.

**Files**: `functions/src/email.ts`, `functions/src/tokens.ts`, `.env.example`
**AC**: Test email sent via emulator “functions:shell” (mock), token decodes & validates expiry.

---

# Task 5 — Invite consumption endpoint

**Prompt for Cursor**

> Create HTTPS endpoint `POST /api/invite/consume` (Next/React API route or Cloud Function HTTP) that:
>
> * Validates token, loads `/invites`, checks not used & not expired.
> * If first login, creates `/users/{uid}`, assigns custom claims (role + orgId).
> * Marks invite `used=true`, updates `/waitlist.status='accepted'` when matched by email.
> * Returns session cookie or Firebase auth handoff.

**Files**: `web/src/pages/api/invite/consume.ts` (or `functions/src/invite.ts`)
**AC**: Happy path & 4xx error paths covered; E2E via Postman succeeds.

---

# Task 6 — Admin /waitlist page (table + actions)

**Prompt for Cursor**

> Build `/admin/waitlist`:
>
> * Data grid: Email | Source | Status | Created | Notes | Actions.
> * Row actions: **Invite**, **Reject**, **Delete** (hard delete behind confirm modal).
> * Bulk actions (multi-select): invite/reject.
> * Right drawer: history (reads `/auditLogs`), add note.
>   Use server-side pagination with Firestore cursors; debounce search by email/domain; filter by status chips.

**Files**: `web/src/pages/admin/waitlist.tsx`, `web/src/components/admin/WaitlistTable.tsx`
**AC**: Admin can invite/reject; toast feedback; optimistic UI with rollback on error.

---

# Task 7 — Public link resolver & routes

**Prompt for Cursor**

> Implement route patterns:
>
> * `/:brandSlug` (Brand)
> * `/:brandSlug/:storeSlug` (Store)
> * `/:brandSlug/:storeSlug/:proSlug` (Pro under brand)
> * `/u/:proSlug` (Solo pro canonical)
>   Create `resolvePublicContext(slugs)` that queries `/publicLinks` and loads target data. Precedence:
>
> 1. pro, 2) store, 3) brand; handle mismatch by banner “This professional serves Store X; switching…”.
>    Add 301 redirect helpers for legacy slugs.

**Files**: `web/src/router.tsx`, `web/src/lib/publicResolver.ts`, pages/components for Brand/Store/Pro
**AC**: All four routes render with mock data; deep-links work.

---

# Task 8 — Brand/Store/Pro pages (MVP UI)

**Prompt for Cursor**

> Build minimal UIs:
>
> * Brand page: brand info, store selector grid, featured services.
> * Store page: details, professionals grid, filters.
> * Pro page: avatar, bio, services, calendar widget (placeholder), booking button.
>   Keep them theme-able (brand logo/colors).
>   Accept `?service=slug&date=YYYY-MM-DD`.

**Files**: `web/src/pages/brand/*.tsx`, `web/src/pages/store/*.tsx`, `web/src/pages/pro/*.tsx`
**AC**: Screens render with props; URL params pre-select service/date.

---

# Task 9 — Booking flow skeleton

**Prompt for Cursor**

> Implement booking wizard shell (no payments yet):
>
> 1. Context (brand/store/pro) + service select.
> 2. Availability (mock provider) → slots.
> 3. Customer form (name, email, phone).
> 4. Confirm → writes `/bookings/{id}` (draft), sends confirmation email (stub).
>    Add ICS file generator and success page. Keep provider interface so we can swap the availability source later.

**Files**: `web/src/features/booking/*`, `functions/src/ics.ts`
**AC**: Full happy path with mocked availability; booking stored in Firestore.

---

# Task 10 — Roles & claims wiring in UI

**Prompt for Cursor**

> On auth state, fetch custom claims and hydrate a `session` store with `{platformAdmin, orgRoles: Record<orgId, Role>}`.
> Gate admin pages (`/admin/*`) to `platformAdmin=true`.
> Add “Switch Org” control for users with multiple org roles.

**Files**: `web/src/lib/session.ts`, route guards
**AC**: Unauthorized users are redirected; admins see admin nav.

---

# Task 11 — Solo → Org migration (no-break redirects)

**Prompt for Cursor**

> Implement a migration action on Pro settings:
>
> * “Create/Attach to Brand” → creates `/orgs`, links pro to org + store, issues new slugs.
> * Maintains `/u/{proSlug}`; create `/publicLinks` under brand path for store/pro.
> * Add redirect map table (`/redirects`) and middleware to 301 old → new.

**Files**: `web/src/pages/settings/pro/*`, `web/src/middleware/redirects.ts`, `functions/src/redirects.ts`
**AC**: After migration, old solo link still works; brand/store/pro links resolve.

---

# Task 12 — QA checklist & seeds

**Prompt for Cursor**

> Create `docs/qa-checklist.md` with:
>
> * Invite happy/sad paths, token expiry, reused token.
> * Reject → hidden from default view.
> * Public resolver precedence tests.
> * Booking wizard happy path.
>   Add `functions/scripts/seed.ts` for demo data + `docs/demo.md` with URLs to click through.

**Files**: `docs/qa-checklist.md`, `functions/scripts/seed.ts`, `docs/demo.md`
**AC**: One command seeds demo; QA doc covers all flows.

---

## Environment & config (once)

* `.env.local` (web): `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_APP_URL`
* `.env` (functions): `FIREBASE_*`, `RESEND_API_KEY`, `PUBLIC_APP_URL`, `JWT_SECRET`
* Add “Admin” role seeding for your user via emulator script or one-off callable function.

---

## Optional quick prompts you can paste verbatim

**Create models & indexes**

> Generate Firestore TS interfaces for Waitlist, Invite, AuditLog, Org, Store, Professional, PublicLink, User. Then produce `firestore.indexes.json` with the composite indexes listed here: … (paste from Task 1). Include a seed script inserting two brands, two stores, three professionals.

**Build waitlist page**

> Make `/admin/waitlist` with server-side paginated table, search, status filters, row actions (Invite/Reject/Delete), bulk actions, and a side drawer showing audit history. Wire to callable functions `inviteFromWaitlist` and `rejectWaitlist`.

**Public routes & resolver**

> Add routes for brand/store/pro and `/u/:proSlug`. Implement `resolvePublicContext` that looks up `/publicLinks` and loads target data; apply pro → store → brand precedence; banner on mismatch.

---

If you want, I can also output the **exact folder scaffold** or drop in **starter components** (table, drawer, banner, wizard) to speed up Cursor’s generation.
