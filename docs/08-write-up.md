# Submission Write-Up

## Problem Framing

The brief asked for a schema-driven landing page studio — a tool that lets editors compose, preview, and publish landing pages without touching code. The core challenge was holding three concerns in tension: a CMS integration that the UI never directly touches, a client-side editor with real-time preview and drag-and-drop reordering, and a publish pipeline that versions content deterministically. Each concern could have leaked into the others; keeping them cleanly separated was the central design decision.

---

## Key Decisions and Trade-offs

### 1. Section Registry as the Single Source of Truth

Every section type (hero, featureGrid, testimonial, cta) is registered in a single `sectionRegistry` object keyed by a discriminated union type. The registry stores the Zod schema, display label, and default props. When a new section type is needed, you add one entry and nothing else changes — no switch statements, no if/else chains, no forgotten cases.

The trade-off: the registry is server-safe (no React imports), so component resolution happens in a separate map in `PageRenderer.tsx`. Two files instead of one, but the registry can be imported by API routes, test files, and server components without bundler issues.

### 2. Contentful Adapter Pattern — Zero CMS Leakage

The adapter in `src/lib/contentful/adapters.ts` is the only code that knows about Contentful's `entry.sys` and `entry.fields` shape. Everything upstream receives a plain `Page` type. This means the entire studio, preview renderer, and publish pipeline have no Contentful dependency — they can be tested with plain objects, and swapping CMS vendors requires changes to exactly one file.

The cost: the adapter must be kept in sync with the Contentful content model. A field rename in Contentful that isn't reflected in the adapter produces a Zod validation failure at runtime, not a compile error. A more elaborate solution would generate types from Contentful's export, but that adds tooling complexity not warranted at this stage.

### 3. Redux with Three Non-Overlapping Slices

State is split along ownership lines: `draftPage` owns the page being edited, `ui` owns transient editor state (selected section, sidebar visibility), and `publish` owns the async publish lifecycle. No slice imports from another. Cross-slice reads happen through selectors at the component boundary.

The alternative — a single fat reducer — would have been simpler to write initially but harder to reason about as the editor grows. The slice boundaries also make it straightforward to replace any one piece independently.

### 4. `useDraftPersistence` Instead of `redux-persist`

Draft pages are persisted to `localStorage` so editors don't lose work on reload. `redux-persist` was the obvious choice, but it fires a `REHYDRATE` action asynchronously after mount, which creates a window where the SSR HTML and client-rendered HTML disagree — causing React hydration warnings in Next.js App Router.

The `useDraftPersistence` hook uses a plain `useEffect` that reads localStorage strictly after mount. No SSR/client mismatch, no special middleware, and the logic is easy to follow and test.

### 5. SemVer Diff via Map Lookups — O(n), Not O(n²)

`comparePages` converts both the previous and next sections arrays into `Map<id, section>` objects before comparing. Every check — removed, type changed, added, props changed — is a constant-time Map lookup. For pages with a small number of sections this is academic, but it establishes a pattern that does not degrade as page complexity grows.

Severity escalates but never downgrades: a major change absorbs all lesser changes. The implementation checks for the most severe condition first and allows early exit, which makes the logic readable in one pass.

### 6. Middleware + API Route Defence-in-Depth for RBAC

Route protection runs at two layers. The Next.js middleware (`src/middleware.ts`) runs on the Edge and checks the JWT before the request reaches the page or API handler. The publish API route (`src/app/api/publish/route.ts`) re-verifies the JWT independently. This means a bug in the middleware — or a request that bypasses it — cannot result in an unauthorised write. The two checks are implemented in `jose`, which runs in the Edge runtime without Node.js dependencies.

---

## Assumptions

- **Filesystem for snapshot storage**: Releases are written to `releases/<slug>/<version>.json`. This works for local development and single-instance deployments. On Vercel's ephemeral filesystem or a horizontally scaled deployment, the two I/O functions in `snapshot.ts` would need replacing with Vercel KV, Vercel Blob, or a database. The `publishSnapshot(draft: Page): Promise<Release>` interface is stable — nothing else needs changing.

- **Demo data as a reliable fallback**: The application must run during code review without a configured Contentful account. `DEMO_PAGE` in `demoData.ts` mirrors exactly what the adapter would produce for a real page, so the studio, preview, and publish flows are all exercisable without CMS credentials.

- **Single-browser E2E coverage**: Playwright tests run against Chromium only. Firefox and WebKit would provide broader coverage but add significant CI time. The accessibility tests (axe-core) cover the cases where browser differences matter most.

- **No cross-browser drag-and-drop testing**: dnd-kit's `KeyboardSensor` enables keyboard reordering, which is tested. Touch/pointer drag-and-drop is not tested in Playwright; manual verification is recommended.

---

## What Is Not Included and Why

| Omission | Reason |
|---|---|
| Real Contentful publishing | Out of scope — the brief covers the studio publish pipeline to the local snapshot store, not Contentful's own publish workflow |
| Cross-browser Playwright tests | Would triple CI time with marginal additional confidence given the axe coverage |
| Mobile responsiveness testing | Not in scope for the brief; layout uses responsive Tailwind classes but is not verified in Playwright |
| Contentful API mocking in tests | Mocking the SDK adds noise without confidence; the adapter pattern and Zod schemas are tested directly against plain objects |
| Multi-page support in the studio | The architecture supports it (all routes are parameterised by slug) but only `demo` is wired end-to-end |

---

## Architecture in One Paragraph

The application is a Next.js 14 App Router project. Server Components fetch Contentful data and pass plain typed objects to Client Components. The editor (StudioClient) runs entirely on the client with Redux Toolkit managing state across three slices. The section registry provides the schema, defaults, and display metadata for every section type. The Contentful adapter is the only file that knows about Contentful's wire format. Publishing posts the Redux draft to an API route that validates it with Zod, diffs it against the last release using `comparePages`, bumps the version with `bumpVersion`, and writes an immutable JSON snapshot. Accessibility is implemented at the component level (semantic HTML, aria attributes, focus management) and verified at CI time with axe-core running against a live Chromium instance.
