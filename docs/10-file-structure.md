# Complete File and Folder Structure

Every file in the project — what it does, what it imports, what imports it, and why it exists where it does.

---

## Visual Map

```
Assignment/
│
├── src/
│   ├── app/                        ← Next.js App Router pages + API routes
│   │   ├── layout.tsx              ← Root HTML shell (skip link, toaster, Redux provider)
│   │   ├── page.tsx                ← Home page "/"
│   │   ├── globals.css             ← Global styles, CSS variables, skip link, focus ring
│   │   │
│   │   ├── auth/
│   │   │   ├── page.tsx            ← Sign-in page (server shell)
│   │   │   └── AuthForm.tsx        ← Sign-in buttons (client component)
│   │   │
│   │   ├── preview/[slug]/
│   │   │   └── page.tsx            ← Public read-only page renderer
│   │   │
│   │   ├── studio/[slug]/
│   │   │   ├── page.tsx            ← Studio server shell (auth check, data fetch)
│   │   │   └── StudioClient.tsx    ← Full studio UI (client component)
│   │   │
│   │   └── api/
│   │       ├── publish/route.ts    ← POST /api/publish — versioned snapshot
│   │       └── auth/
│   │           ├── login/route.ts  ← POST /api/auth/login — issues JWT cookie
│   │           ├── logout/route.ts ← POST /api/auth/logout — clears cookie
│   │           └── me/route.ts     ← GET /api/auth/me — returns current user
│   │
│   ├── components/
│   │   ├── sections/               ← One component per section type
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeatureGridSection.tsx
│   │   │   ├── TestimonialSection.tsx
│   │   │   ├── CTASection.tsx
│   │   │   └── UnsupportedSection.tsx  ← Fallback for unknown types
│   │   │
│   │   ├── studio/                 ← Editor-specific UI
│   │   │   ├── SectionList.tsx     ← Drag-and-drop sidebar list
│   │   │   ├── SectionEditor.tsx   ← Property editor panel
│   │   │   ├── AddSectionMenu.tsx  ← Dropdown to add a section
│   │   │   └── PublishButton.tsx   ← Publish trigger + status feedback
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx          ← Top navigation bar
│   │   │   └── RoleSwitcher.tsx    ← Role badge / quick role display
│   │   │
│   │   └── ui/
│   │       ├── PageRenderer.tsx    ← Renders a Page from domain types
│   │       ├── ErrorBoundary.tsx   ← Per-section crash containment
│   │       ├── button.tsx          ← shadcn Button primitive
│   │       ├── input.tsx           ← shadcn Input primitive
│   │       ├── label.tsx           ← shadcn Label primitive
│   │       ├── textarea.tsx        ← shadcn Textarea primitive
│   │       ├── badge.tsx           ← shadcn Badge primitive
│   │       ├── separator.tsx       ← shadcn Separator
│   │       ├── toast.tsx           ← shadcn Toast component
│   │       ├── toaster.tsx         ← Toast container (renders toasts)
│   │       └── use-toast.ts        ← Toast hook (show/dismiss)
│   │
│   ├── lib/                        ← Pure logic — no React, no Next.js
│   │   ├── contentful/
│   │   │   ├── contentfulClient.ts ← Creates the SDK client (published/preview)
│   │   │   ├── adapters.ts         ← Converts Contentful entries → domain Page
│   │   │   ├── queries.ts          ← fetchPageBySlug — the only public query
│   │   │   └── demoData.ts         ← Hard-coded DEMO_PAGE fallback
│   │   │
│   │   ├── registry/
│   │   │   └── sectionRegistry.ts  ← Central registry: schema + label + defaults
│   │   │
│   │   ├── schemas/
│   │   │   ├── page.schema.ts      ← Zod schema for the full Page type
│   │   │   └── section.schema.ts   ← Zod schemas for each section's props
│   │   │
│   │   ├── semver/
│   │   │   ├── diff.ts             ← comparePages() — determines change type
│   │   │   ├── version.ts          ← bumpVersion() — computes next SemVer
│   │   │   └── snapshot.ts         ← publishSnapshot() — writes release file
│   │   │
│   │   ├── auth/
│   │   │   ├── session.ts          ← JWT sign + verify (jose, Edge-safe)
│   │   │   └── roles.ts            ← hasRole(), DEMO_USERS, PROTECTED_ROUTES
│   │   │
│   │   └── utils/
│   │       ├── cn.ts               ← clsx + tailwind-merge utility
│   │       └── hash.ts             ← djb2 page hash for idempotency
│   │
│   ├── store/
│   │   ├── index.ts                ← makeStore() factory + RootState / AppDispatch types
│   │   ├── hooks.ts                ← useAppSelector, useAppDispatch (typed wrappers)
│   │   ├── provider.tsx            ← ReduxProvider — wraps the app in a store
│   │   └── slices/
│   │       ├── draftPageSlice.ts   ← Page content being edited
│   │       ├── uiSlice.ts          ← Editor UI state (selected section, sidebar, preview mode)
│   │       └── publishSlice.ts     ← Publish status + latest release
│   │
│   ├── hooks/
│   │   └── useDraftPersistence.ts  ← localStorage read/write for the draft
│   │
│   ├── middleware.ts               ← Edge RBAC — runs before every matched route
│   │
│   ├── types/
│   │   └── index.ts                ← All domain types (Page, Section, Role, Release, …)
│   │
│   └── tests/
│       ├── setup.ts                ← Vitest global setup
│       ├── unit/
│       │   ├── schema.test.ts      ← Zod schema unit tests
│       │   └── semver.test.ts      ← comparePages + bumpVersion unit tests
│       └── e2e/
│           ├── preview.spec.ts     ← Preview page E2E
│           ├── studio.spec.ts      ← Studio RBAC + editor E2E
│           └── accessibility.spec.ts ← axe-core scan on all pages
│
├── releases/                       ← Immutable published snapshots (gitignored in prod)
│   └── demo/
│       ├── 1.0.0.json
│       └── 1.0.1.json
│
├── docs/                           ← Project documentation
├── .github/workflows/
│   ├── ci.yml                      ← Typecheck, lint, unit tests, Playwright, axe
│   └── deploy.yml                  ← Vercel deploy on merge to main
│
├── next.config.ts                  ← Next.js config (Contentful image domains)
├── tailwind.config.ts              ← Tailwind + shadcn CSS variable theme
├── tsconfig.json                   ← TypeScript config (@/* path alias)
├── vitest.config.ts                ← Vitest (jsdom, path alias)
├── playwright.config.ts            ← Playwright (Chromium, webServer)
├── components.json                 ← shadcn/ui config
├── .env.example                    ← Environment variable template
└── package.json                    ← Scripts + dependencies
```

---

## Root Configuration Files

### `package.json`

Defines npm scripts and dependencies. Key scripts:

| Script | What it runs |
|---|---|
| `dev` | `next dev` — local development server |
| `build` | `next build` — production build |
| `typecheck` | `tsc --noEmit` — type-check without emitting |
| `lint` | `next lint` — ESLint |
| `test` | `vitest run` — unit tests once |
| `test:watch` | `vitest` — unit tests in watch mode |
| `test:e2e` | `playwright test` — E2E suite |
| `test:e2e:ui` | `playwright test --ui` — Playwright UI mode |

---

### `tsconfig.json`

Standard Next.js TypeScript config. The important line is the path alias:

```json
"paths": { "@/*": ["./src/*"] }
```

Every import in the project uses `@/` instead of relative paths. `@/types` always means `src/types/index.ts`. This makes refactoring and moving files much safer.

---

### `next.config.ts`

Minimal config. The only non-default setting is `remotePatterns` for `images.contentful.com`, which allows Next.js's `<Image>` component to serve optimised versions of images hosted on Contentful.

---

### `tailwind.config.ts`

Extends Tailwind with shadcn's CSS variable-based colour system. All colours are defined as CSS custom properties (`--background`, `--foreground`, `--ring`, etc.) in `globals.css`. Tailwind classes like `bg-card` or `text-muted-foreground` resolve to those variables, which makes theme switching straightforward.

---

### `vitest.config.ts`

Configures Vitest with:
- `environment: 'jsdom'` — simulates a browser DOM for component-related tests
- `@/*` path alias mirroring `tsconfig.json` so imports resolve the same way in tests

---

### `playwright.config.ts`

Configures Playwright to:
- Run only Chromium (sufficient for CI; add Firefox/WebKit for production coverage)
- Start a `next dev` server before the test run via `webServer`
- Write reports to `playwright-report/` and test results to `test-results/`

---

### `components.json`

shadcn/ui configuration. Tells the `shadcn` CLI where to put new components, which path alias to use, and which CSS variable prefix to apply. Not read at runtime — only used by the CLI when adding or updating shadcn components.

---

### `.env.example`

Template showing every environment variable the app reads. The actual values go in `.env.local` (gitignored). The file is committed so new developers know what to fill in.

---

## `src/types/index.ts`

**The single source of truth for all domain types.**

Everything in the application — components, API routes, Redux slices, Zod schemas, test fixtures — imports from here. There is deliberately no other place where `Page`, `Section`, `Role`, or `Release` are defined.

Key types:

```typescript
SectionType   — 'hero' | 'featureGrid' | 'testimonial' | 'cta'
Section       — { id, type: SectionType, props: Record<string, unknown> }
Page          — { pageId, slug, title, sections: Section[] }
Role          — 'viewer' | 'editor' | 'publisher'
AuthUser      — { id, name, email, role: Role }
ChangeType    — 'none' | 'patch' | 'minor' | 'major'
DiffResult    — { changeType: ChangeType, changes: string[] }
Release       — { version, slug, pageId, publishedAt, changelog, checksum, snapshot: Page }
SectionPropsMap — maps each SectionType to its specific props interface
```

`SectionPropsMap` is a mapped type that makes the section registry and component map generically type-safe. If you add a new `SectionType` to the union, TypeScript will force you to add a corresponding entry to `SectionPropsMap`, the registry, the Zod schemas, and the component map — no forgetting.

**Imported by:** virtually every file in the project.  
**Imports:** nothing (no dependencies).

---

## `src/middleware.ts`

**Edge RBAC gate — runs before any matched route reaches a handler.**

Next.js runs this file at the Edge (Cloudflare Workers runtime) before the request hits any page or API route. It runs on every request matching the `config.matcher`:

```typescript
export const config = {
  matcher: ['/studio/:path*', '/api/publish'],
}
```

What it does for each matched request:

1. Looks up the required role from `PROTECTED_ROUTES` in `roles.ts`
2. Reads the `ps_session` cookie
3. Verifies the JWT with `verifySessionToken`
4. Checks `hasRole(user.role, requiredRole)`
5. If the check fails:
   - API routes (`/api/*`) → JSON 403
   - Page routes → redirect to `/auth?callbackUrl=<original path>`
6. If the check passes → forwards `x-user-id` and `x-user-role` headers so server components don't need to re-verify the JWT

**Imports:** `session.ts`, `roles.ts`  
**Imported by:** nothing (Next.js picks it up by filename convention)

---

## `src/app/` — Routes

### `layout.tsx`

Root HTML shell. Every page in the application renders inside this. It:
- Sets `<html lang="en">` for WCAG 3.1.1
- Renders the skip link (`<a href="#main-content">`) as the very first focusable element
- Wraps everything in `ReduxProvider` so client components can access the store
- Renders `<Toaster>` once at the root so toast notifications work everywhere
- Sets the base `<title>` template: `%s | Page Studio`

**Imports:** `ReduxProvider`, `Header`, `Toaster`, `globals.css`

---

### `page.tsx` (Home)

The `/` route. A pure server component that renders two links: "Open preview" → `/preview/demo` and "Sign in" → `/auth`. Uses `buttonVariants()` directly on `<Link>` rather than `<Button asChild>` to avoid the `asChild` prop warning (Radix Slot requires a forwardRef-compatible child).

---

### `globals.css`

Global stylesheet with three responsibilities:

1. **CSS custom properties** — all the colour tokens (`--background`, `--foreground`, `--ring`, etc.) that Tailwind classes resolve to
2. **Skip link** — `.skip-link` is `position: absolute; top: -100%` until focused, at which point it becomes visible at the top of the page
3. **Focus ring** — `:focus-visible { outline: 3px solid hsl(var(--ring)); outline-offset: 2px }` — the 3px width and contrast ratio meet WCAG 2.4.11
4. **Reduced motion** — `@media (prefers-reduced-motion: reduce)` forces all animation durations to `0.01ms`

---

### `auth/page.tsx` + `auth/AuthForm.tsx`

`page.tsx` is a server component that reads the `callbackUrl` query param and passes it to `AuthForm`.

`AuthForm.tsx` is the client component with the sign-in buttons. Clicking a role button:

1. POSTs to `/api/auth/login` with `{ role }`
2. On success, sets `window.location.href = callbackUrl`

The hard navigation (`window.location.href`) rather than `router.push` is intentional — `router.push` in App Router can race with cookie propagation, causing the next page load to see no session. A full browser navigation picks up the new cookie reliably.

---

### `preview/[slug]/page.tsx`

Server component. Fetches the page by slug, falls back to `DEMO_PAGE` if Contentful isn't configured or the slug doesn't exist, returns a 404 for unknown non-demo slugs. Renders `<PageRenderer page={page} />`.

Load priority:
1. Try Contentful if credentials are present
2. Fall back to `DEMO_PAGE` if the slug is `demo`
3. Return `notFound()` otherwise

---

### `studio/[slug]/page.tsx`

Server component. Reads the `x-user-role` header injected by middleware (no JWT re-verification needed here — middleware already did it). Fetches the page from Contentful or demo data using the same load-priority logic as the preview page. Passes `{ initialPage, user }` to `StudioClient`.

---

### `studio/[slug]/StudioClient.tsx`

**The main studio component.** Client component (`'use client'`). This is the largest component in the codebase and orchestrates the entire editor experience.

What it does:

- On mount, dispatches `loadPage(initialPage)` to put the Contentful page into the Redux draft
- Calls `useDraftPersistence(slug)` to keep draft synced with localStorage
- Reads `sidebarOpen` and `previewMode` from `uiSlice`
- Reads the current draft from `draftPageSlice`
- Renders three panels:
  - **Sidebar** (left) — section list + add section button
  - **Toolbar** (top of main area) — sidebar toggle, preview mode toggle, open preview link, role display, publish button
  - **Canvas** (centre) — `<PageRenderer>` showing the live draft
  - **Properties editor** (right, hidden in preview mode) — `<SectionEditor>` for the selected section

**Imports:** `draftPageSlice`, `uiSlice`, `useDraftPersistence`, all studio components, `PageRenderer`, `hasRole`

---

### `api/auth/login/route.ts`

`POST /api/auth/login`

Receives `{ role }` in the request body, looks up the matching demo user from `DEMO_USERS`, creates a JWT with `createSessionToken`, and sets it as an HttpOnly cookie named `ps_session`. Returns the user object.

---

### `api/auth/logout/route.ts`

`POST /api/auth/logout`

Clears the `ps_session` cookie by setting it with `maxAge: 0`.

---

### `api/auth/me/route.ts`

`GET /api/auth/me`

Reads and verifies the session cookie. Returns the current `AuthUser` or a 401. Used by the `Header` component to show the logged-in user's name and role.

---

### `api/publish/route.ts`

`POST /api/publish`

The most security-sensitive route. Even though middleware already guards it, this route re-verifies the JWT independently (defence in depth). Steps:

1. Re-verify JWT → require `publisher` role → return 403 if not
2. Parse request body against `PublishRequestSchema` (tight: just `slug` + `page: unknown`)
3. Validate `page` against `PageSchema` (full Zod validation) → return 422 if invalid
4. Call `publishSnapshot(page)` → returns a `Release`
5. Return the `Release` as JSON

**Imports:** `session.ts`, `roles.ts`, `page.schema.ts`, `snapshot.ts`

---

## `src/components/`

### `sections/HeroSection.tsx`

Renders the hero section. Receives `{ props: HeroProps }`. Uses semantic HTML: `<section>` with `aria-labelledby` pointing to the `<h2>`. Optional fields (`subheading`, CTA) are rendered only when present.

### `sections/FeatureGridSection.tsx`

Renders the feature grid. Each feature item uses `<article>` with `<h3>`. The icon field, if present, is treated as a Lucide icon name and rendered via a dynamic lookup — if the icon isn't found, renders nothing rather than crashing.

### `sections/TestimonialSection.tsx`

Renders a testimonial using `<figure>` + `<blockquote>` + `<figcaption>` — semantically correct and screen-reader friendly. Avatar uses `<img>` with a descriptive `alt` attribute.

### `sections/CTASection.tsx`

Renders a call-to-action banner. The CTA link uses a native `<a>` with the URL from props. No `<button>` wrapping a link — correct semantic nesting.

### `sections/UnsupportedSection.tsx`

Fallback rendered when a section has an unrecognised `type`. In development, shows the type string so engineers know what's missing. In production, renders nothing (preserves the page without crashing). Decision: an unknown section type is not a user-visible error — it just means the frontend doesn't know how to render it yet.

---

### `ui/PageRenderer.tsx`

**The rendering engine.** Takes a `Page` and renders each section in order. For each section:

1. `isKnownSectionType(section.type)` — if unknown, renders `<UnsupportedSection>`
2. `validateSectionProps(type, section.props)` — if invalid, renders an accessible error div with `role="alert"`
3. Looks up the component from `SECTION_COMPONENTS` map
4. Wraps it in `<ErrorBoundary>` so a runtime crash in one section doesn't take down the page

The `SECTION_COMPONENTS` map lives here rather than in the registry because the registry is server-safe (no React). PageRenderer is always a client-facing component, so importing React components here is fine.

**Imports:** all four section components, `UnsupportedSection`, `ErrorBoundary`, `sectionRegistry`

---

### `ui/ErrorBoundary.tsx`

React class component (error boundaries must be class components as of React 18). Wraps each section. If the component throws during render, `componentDidCatch` captures the error and renders a fallback `<div role="alert">` with a user-readable message. The rest of the page continues rendering normally.

---

### `studio/SectionList.tsx`

Renders the sidebar list of sections with drag-and-drop powered by dnd-kit. Key details:

- `<DndContext id="section-list" ...>` — the stable `id` prop makes dnd-kit's generated `aria-describedby` IDs deterministic across server and client renders, eliminating hydration mismatches
- `<SortableContext>` wraps the list; each item is a `<SortableSectionRow>`
- `onDragEnd` dispatches `reorderSections({ fromIndex, toIndex })` to the Redux store
- Clicking a row dispatches `selectSection(id)` to `uiSlice`
- The remove button dispatches `removeSection(id)` to `draftPageSlice`

**Imports:** `draftPageSlice`, `uiSlice`, dnd-kit

---

### `studio/SectionEditor.tsx`

The right-hand properties panel. Reads the `selectedSectionId` from `uiSlice`, finds the corresponding section in `draftPageSlice`, and renders appropriate inputs for that section's props. On every input change, dispatches `updateSectionProps`. Every input has a `<Label htmlFor=...>` pairing for WCAG 1.3.1.

**Imports:** `draftPageSlice`, `uiSlice`, shadcn `Input`, `Textarea`, `Label`

---

### `studio/AddSectionMenu.tsx`

A dropdown that lists all registered section types from `sectionRegistry`. Selecting one dispatches `addSection(type)`. Because the list is driven by the registry, adding a new section type automatically makes it appear here without any changes to this component.

**Imports:** `sectionRegistry`, `draftPageSlice`

---

### `studio/PublishButton.tsx`

Dispatches `publishPage({ slug })` thunk on click. Reads `publish.status` to show appropriate state: idle → "Publish", publishing → "Publishing…" with `aria-busy`, success → triggers a toast and resets. Only rendered for publishers (gated in `StudioClient`).

**Imports:** `publishSlice`

---

### `layout/Header.tsx`

Top navigation bar present on every page. Fetches the current user via `GET /api/auth/me` (server component data fetch). Shows the app name, a link to the preview, and the `<RoleSwitcher>`.

### `layout/RoleSwitcher.tsx`

Displays the current user's role as a `<Badge>`. Contains the logout button which POSTs to `/api/auth/logout`.

---

## `src/lib/` — Pure Logic

### `contentful/contentfulClient.ts`

Creates and returns a Contentful SDK client. Takes a `mode` argument:

- `'published'` → Delivery API (`cdn.contentful.com`, delivery token)
- `'preview'` → Preview API (`preview.contentful.com`, preview token)

This is the only file in the codebase that initialises a Contentful client. Everything else calls `getContentfulClient(mode)`.

---

### `contentful/adapters.ts`

**The CMS boundary layer.** Converts raw Contentful `Entry` objects into the application's `Page` and `Section` types.

Two functions:

- `adaptSection(entry)` — maps `entry.sys.contentType.sys.id` to a `SectionType`, strips the Contentful-specific `sectionId` field, returns `{ id, type, props }` or `null` for unknown types
- `adaptPage(entry)` — maps `fields.sections` through `adaptSection`, filters out nulls, returns `{ pageId, slug, title, sections }`

After this file runs, no other code in the project sees `entry.sys.*`, `entry.fields.*`, or any Contentful SDK type. The type system enforces this — all public exports return `Page | null`.

**Imports:** Contentful SDK types, `@/types`  
**Imported by:** `queries.ts` only

---

### `contentful/queries.ts`

`fetchPageBySlug({ slug, preview? })` — the only public query function. Creates the appropriate client, queries Contentful for a `landingPage` entry with the matching slug, passes the result through `adaptPage`, and returns `Page | null`. All error handling is here; callers never need to catch Contentful errors.

**Imports:** `contentfulClient.ts`, `adapters.ts`  
**Imported by:** `preview/[slug]/page.tsx`, `studio/[slug]/page.tsx`

---

### `contentful/demoData.ts`

Exports `DEMO_PAGE` — a hardcoded `Page` object that mirrors what a real Contentful response would look like after going through the adapter. Used when:

- Contentful credentials are absent from `.env.local`
- Contentful returns no result for the `demo` slug

This makes the app fully usable for code review without a Contentful account.

**Imports:** `@/types`  
**Imported by:** `preview/[slug]/page.tsx`, `studio/[slug]/page.tsx`

---

### `registry/sectionRegistry.ts`

**The architectural centrepiece.** A single object keyed by `SectionType` where each entry holds:

- `schema` — the Zod schema for that section's props
- `label` — the human-readable name shown in the UI
- `defaultProps` — what a new section of this type starts with

The type `SectionRegistry = { [K in SectionType]: RegistryEntry<SectionPropsMap[K]> }` is exhaustive — TypeScript will error if any `SectionType` is missing from the object.

Three exported functions:

- `isKnownSectionType(type)` — type guard
- `validateSectionProps(type, props)` — runs `safeParse` and returns typed props or `null`
- `SectionComponentMap` type — used in `PageRenderer` for the component map

This file deliberately has no React imports so it can be safely imported by server components and API routes.

**Imports:** `section.schema.ts`, `@/types`  
**Imported by:** `PageRenderer.tsx`, `SectionEditor.tsx`, `AddSectionMenu.tsx`, `draftPageSlice.ts`, test files

---

### `schemas/section.schema.ts`

Zod schemas for each section type's props:

- `HeroPropsSchema` — heading required, all others optional
- `FeatureGridPropsSchema` — heading required, features array min 1
- `TestimonialPropsSchema` — quote and author required
- `CTAPropsSchema` — heading, label, url all required

**Imports:** `zod`  
**Imported by:** `sectionRegistry.ts`, unit tests

---

### `schemas/page.schema.ts`

`PageSchema` — the full Zod schema for a `Page`. Validates `pageId`, `slug`, `title`, and `sections` (each must have `id`, `type`, and `props`). Used at the API boundary in `api/publish/route.ts` to validate the incoming page before touching the filesystem.

**Imports:** `zod`, `section.schema.ts`  
**Imported by:** `api/publish/route.ts`, unit tests

---

### `semver/diff.ts`

`comparePages(previous, next)` — pure function, no side effects.

Algorithm:

1. Build `prevMap` and `nextMap` from both sections arrays (O(n) Map construction)
2. Pass 1 — IDs in `prevMap` not in `nextMap` → removed → MAJOR
3. Pass 2 — IDs in both with different `type` → type changed → MAJOR
4. Pass 3 — IDs in `nextMap` not in `prevMap` → added → MINOR (unless already MAJOR)
5. Pass 4 — IDs in both, same type, different `props` (JSON.stringify comparison) → PATCH (unless already higher)
6. Title comparison → PATCH if different (unless already higher)

Severity only ever escalates — once `changeType` is set to `'major'`, nothing can lower it back.

**Imports:** `@/types`  
**Imported by:** `snapshot.ts`, unit tests

---

### `semver/version.ts`

`bumpVersion(current, changeType)` — splits the SemVer string, increments the appropriate part, resets lower parts.

```
'1.2.3', 'major' → '2.0.0'
'1.2.3', 'minor' → '1.3.0'
'1.2.3', 'patch' → '1.2.4'
```

`INITIAL_VERSION = '1.0.0'` — used when there is no previous release.

**Imports:** `@/types`  
**Imported by:** `snapshot.ts`, unit tests

---

### `semver/snapshot.ts`

`publishSnapshot(draft)` — the write path for a publish operation.

Steps:

1. `hashPageSync(draft)` — djb2 hash of the page's canonical JSON
2. `getLatestRelease(slug)` — read the most recent release file from `releases/<slug>/`
3. If `latest.checksum === checksum` → return `latest` (idempotent, no write)
4. If no prior release → use `INITIAL_VERSION`, changelog `["Initial release"]`
5. Else `comparePages(latest.snapshot, draft)` and `bumpVersion(latest.version, diff.changeType)`
6. Write `releases/<slug>/<version>.json`
7. Return the new `Release`

`getLatestRelease` sorts filenames numerically as SemVer (`10.0.0` correctly sorts after `9.0.0`).

**Imports:** `diff.ts`, `version.ts`, `hash.ts`, Node.js `fs/promises`  
**Imported by:** `api/publish/route.ts`

---

### `auth/session.ts`

JWT creation and verification using `jose` (Edge-runtime compatible — no Node.js crypto).

- `createSessionToken(user)` — signs a JWT with HS256, 7-day expiry
- `verifySessionToken(token)` — verifies and returns `AuthUser` or `null`
- Exports `SESSION_COOKIE = 'ps_session'`

The secret comes from `process.env.AUTH_SECRET`. Throws at startup if the variable is missing.

**Imports:** `jose`, `@/types`  
**Imported by:** `middleware.ts`, `api/auth/login/route.ts`, `api/publish/route.ts`, `api/auth/me/route.ts`

---

### `auth/roles.ts`

Three exports:

- `hasRole(userRole, required)` — numeric rank comparison (`viewer=0`, `editor=1`, `publisher=2`). A publisher passes any role check because `2 >= 0, 1, 2`.
- `DEMO_USERS` — three hardcoded users, one per role. Replace with identity provider lookup in production.
- `PROTECTED_ROUTES` — maps route prefixes to required roles. Currently `{ '/studio': 'editor' }`. The publish API route is handled separately in the route handler itself.

**Imports:** `@/types`  
**Imported by:** `middleware.ts`, `api/auth/login/route.ts`, `api/publish/route.ts`, `StudioClient.tsx`

---

### `utils/cn.ts`

```typescript
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs) { return twMerge(clsx(inputs)) }
```

Merges Tailwind classes correctly — `twMerge` resolves conflicts (e.g. `p-2 p-4` → `p-4`) while `clsx` handles conditionals. Used throughout every component.

---

### `utils/hash.ts`

`hashPageSync(page)` — produces a short hex string for a page by running djb2 over the JSON-serialised page with sorted keys. Sorted keys ensure `{ a: 1, b: 2 }` and `{ b: 2, a: 1 }` produce the same hash.

Used exclusively in `snapshot.ts` for the idempotency check.

---

## `src/store/`

### `index.ts`

Exports `makeStore()` — a factory function rather than a module-level singleton. This is the recommended pattern for Next.js App Router: each browser session gets its own store instance without global state leaking between server renders.

Also exports the derived types `AppStore`, `RootState`, and `AppDispatch` — used throughout the codebase for type inference.

---

### `provider.tsx`

`ReduxProvider` — a client component that creates the store in a `useRef`, wraps children in `<Provider>`, and optionally accepts a `preloadedState`. Rendered once in `app/layout.tsx`.

---

### `hooks.ts`

```typescript
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

Typed wrappers so no component ever needs to type-cast. `useAppSelector(selectDraftPage)` returns `Page | null` automatically — no `as Page` assertions.

---

### `slices/draftPageSlice.ts`

Owns the mutable working copy of the page being edited.

State: `{ page: Page | null, isDirty: boolean }`

Actions and what they do:

| Action | Effect |
|---|---|
| `loadPage(Page)` | Sets `page`, resets `isDirty = false` — signals "clean Contentful state" |
| `hydrateDraft(Page)` | Sets `page`, sets `isDirty = true` — signals "user's unfinished work" |
| `updateTitle(string)` | Updates `page.title`, marks dirty |
| `addSection(SectionType)` | Appends a new section using registry defaults + `crypto.randomUUID()` |
| `removeSection(id)` | Filters out the section, marks dirty |
| `reorderSections({ fromIndex, toIndex })` | `splice` + `splice` in Immer, marks dirty |
| `updateSectionProps({ sectionId, props })` | Merges props into the section, marks dirty |
| `markClean()` | Resets `isDirty = false` — called after a successful publish |
| `clearDraft()` | Nulls out `page` and resets dirty |

All mutations use Immer (bundled in Redux Toolkit) — writes look like direct mutation but produce immutable state.

Selectors: `selectDraftPage`, `selectIsDirty`

**Imports:** `@/types`, `sectionRegistry`  
**Imported by:** `StudioClient`, `SectionList`, `SectionEditor`, `PublishButton`, `useDraftPersistence`, `publishSlice`

---

### `slices/uiSlice.ts`

Owns transient editor state that has no business value and is never persisted.

State: `{ selectedSectionId: string | null, sidebarOpen: boolean, previewMode: boolean }`

Actions: `selectSection(id | null)`, `toggleSidebar()`, `setPreviewMode(bool)`, `togglePreviewMode()`

This slice knows nothing about page content. It only holds IDs and booleans. The actual section data is always looked up from `draftPageSlice` using the selected ID as a key. This separation means changing the editor layout never touches page data logic.

---

### `slices/publishSlice.ts`

Owns the async publish lifecycle and the latest release.

State: `{ status: 'idle' | 'publishing' | 'success' | 'error', latestRelease: Release | null, error: string | null }`

The `publishPage` async thunk:

1. Reads `draftPage.page` from `getState()` — the component only passes `slug`
2. POSTs to `/api/publish`
3. On pending → `status = 'publishing'`
4. On fulfilled → `status = 'success'`, `latestRelease = Release`, dispatches `markClean()`
5. On rejected → `status = 'error'`, `error = message`

---

## `src/hooks/useDraftPersistence.ts`

Custom hook. Used in `StudioClient`. Two `useEffect` blocks:

1. **On mount** (runs once per slug): reads `localStorage.getItem('page-studio:draft:<slug>')` and dispatches `hydrateDraft` if a stored draft exists. A `useRef` guard (`isHydrated`) ensures this runs exactly once.
2. **On every draft change**: writes the current draft back to localStorage. Does not run until the first effect has completed (guarded by `isHydrated.current`).

Why not `redux-persist`: it fires `REHYDRATE` asynchronously after mount, creating a window where the server HTML and client HTML disagree — hydration warnings in Next.js App Router. This hook runs strictly after mount via `useEffect`, eliminating the mismatch.

**Imports:** `draftPageSlice`  
**Imported by:** `StudioClient`

---

## `src/tests/`

### `tests/setup.ts`

Vitest global setup file. Runs before all tests. Sets up any global mocks needed (e.g. `localStorage` via jsdom).

### `tests/unit/schema.test.ts`

Tests every Zod schema in `section.schema.ts` and `page.schema.ts`. Each test group covers: valid input passes, required field missing fails, edge cases (empty string, empty array). Tests are isolated pure function calls — no DOM, no fetch.

### `tests/unit/semver.test.ts`

Tests `comparePages` (from `diff.ts`) and `bumpVersion` (from `version.ts`). Uses a fixed `BASE_PAGE` object and derives modified versions from it. Covers: identical (none), prop change (patch), title change (patch), add section (minor), remove section (major), type change (major), and simultaneous add+remove (major beats minor).

### `tests/e2e/preview.spec.ts`

Playwright spec. Navigates to `/preview/demo`, asserts: page renders, hero heading is visible, feature grid is present, CTA button is focusable with an accessible label, CTA href is correct, `/preview/unknown-slug` returns 404, skip link is in the DOM, at least one `h1` exists, Tab key produces a visible focused element.

### `tests/e2e/studio.spec.ts`

Playwright spec. Two groups:

- **RBAC** — viewer gets redirected away from studio, editor can access
- **Editor flow** — signs in as publisher: sidebar visible, can add a section, select it and see the editor panel, editing hero heading updates the preview, publish button visible for publisher, absent for editor, toolbar keyboard accessible

### `tests/e2e/accessibility.spec.ts`

Runs `@axe-core/playwright` on four pages: `/`, `/preview/demo`, `/auth`, `/studio/demo`. For each page, filters violations to `critical` or `serious` impact and throws an error if any are found. Writes combined results to `test-results/a11y-report.json` in `afterAll`.

---

## `releases/` Directory

```
releases/
  demo/
    1.0.0.json
    1.0.1.json
```

Each file is an immutable `Release` object:

```json
{
  "version": "1.0.1",
  "slug": "demo",
  "pageId": "demo-page-1",
  "publishedAt": "2025-05-16T10:00:00.000Z",
  "changelog": ["Updated props in hero section (hero-1)"],
  "checksum": "3f8a2b9c",
  "snapshot": { ... full Page object ... }
}
```

Files are never modified after writing. A new publish always writes a new file. The latest release is determined at runtime by reading directory contents and sorting filenames as SemVer.

On Vercel or any ephemeral filesystem deployment, this directory needs replacing with object storage or a database. Only `publishSnapshot` and `getLatestRelease` in `snapshot.ts` need to change.

---

## `.github/workflows/`

### `ci.yml`

Two jobs triggered on every push to `main` and every PR:

**`quality`** (Ubuntu, Node 20):
- `npm ci`
- `tsc --noEmit` — type check
- `next lint` — ESLint
- `vitest run` — unit tests

**`e2e`** (depends on `quality`):
- `npm ci`
- `playwright install --with-deps chromium`
- `next build`
- `playwright test`
- Upload `playwright-report` artefact
- Upload `test-results/a11y-report.json` artefact
- `test -f test-results/a11y-report.json` — explicit failure if the file wasn't written

Concurrency group `ci-${{ github.ref }}` cancels in-flight runs when a new push arrives.

### `deploy.yml`

Triggered on merge to `main` (after required status checks pass). Uses `amondnet/vercel-action` with `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` stored as repository secrets.

---

## How the Files Connect — Data Flow

```
User opens /preview/demo
        │
        ▼
preview/[slug]/page.tsx          (server component)
        │ calls
        ▼
queries.ts → contentfulClient.ts → Contentful API
        │ or falls back to
        ▼
demoData.ts
        │ result passed through
        ▼
adapters.ts                      (strips CMS shape)
        │ returns Page
        ▼
<PageRenderer page={page} />
        │ for each section
        ▼
sectionRegistry.ts               (validate props)
        │ if valid
        ▼
HeroSection / FeatureGridSection / ...
        │ wrapped in
        ▼
<ErrorBoundary>                  (catch runtime crashes)
```

```
User edits in studio
        │
        ▼
StudioClient dispatch(updateSectionProps)
        │
        ▼
draftPageSlice                   (Immer mutation → new state)
        │ selector re-runs
        ▼
<PageRenderer page={draft} />    (live preview updates)
        │ also
        ▼
useDraftPersistence              (localStorage.setItem)
```

```
User clicks Publish
        │
        ▼
PublishButton dispatch(publishPage({ slug }))
        │
        ▼
publishSlice thunk → POST /api/publish
        │
        ▼
middleware.ts                    (Edge JWT check)
        │ passes
        ▼
api/publish/route.ts             (re-verifies JWT, validates PageSchema)
        │ calls
        ▼
snapshot.ts → diff.ts → version.ts
        │ writes
        ▼
releases/demo/1.0.1.json
        │ returns Release
        ▼
publishSlice status = 'success'
        │ dispatches
        ▼
draftPageSlice markClean()       (isDirty = false)
        │ shows
        ▼
Toast: "Version 1.0.1 is live"
```
