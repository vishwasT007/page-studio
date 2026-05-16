# Page Studio

A landing page builder where editors can compose pages from a set of pre-built sections, see changes live, and publish versioned releases — all without touching code.

Built with Next.js 14, Redux Toolkit, Contentful, and Zod. Pages are validated against schemas before rendering, so bad CMS data can't crash the whole page. Publishing is immutable and versioned automatically using SemVer rules derived from what actually changed.

---

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Three routes to know about:

- `/preview/demo` — a read-only rendered landing page
- `/auth` — pick a role to sign in with
- `/studio/demo` — the editor (needs editor or publisher role)

You don't need a Contentful account to run the app. The `demo` slug is backed by local data that mirrors what a real Contentful response looks like after going through the adapter.

---

## Environment variables

```env
# Required
AUTH_SECRET=your-secret-at-least-32-chars
BLOB_READ_WRITE_TOKEN=vercel-blob-read-write-token

# Optional — app falls back to demo data if these are absent
CONTENTFUL_SPACE_ID=
CONTENTFUL_ACCESS_TOKEN=
CONTENTFUL_PREVIEW_ACCESS_TOKEN=
CONTENTFUL_ENVIRONMENT=master   # defaults to master

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate a suitable `AUTH_SECRET` with `openssl rand -base64 32`.

---

## How the editor works

When you open the studio, the page is loaded from Contentful (or demo data) and put into a Redux draft. From there everything is local — every edit dispatches a Redux action, the preview re-renders instantly from the store, and nothing hits the server until you click Publish.

The draft is saved to `localStorage` on every change, so a page reload brings your work back. This uses a `useDraftPersistence` hook rather than `redux-persist` — the reason is that redux-persist fires a rehydration action asynchronously after mount, which creates a window where the server-rendered HTML and client HTML disagree, causing React hydration errors in App Router. A plain `useEffect` reading localStorage after mount avoids that entirely.

### What you can do in the studio

- Select a section from the sidebar to edit its properties in the right panel
- Drag sections to reorder them (keyboard reordering also works — Space to pick up, arrows to move, Space to drop)
- Add new sections from the section picker
- Remove sections with the trash icon
- Click Publish when ready (publisher role required)

---

## Roles and access control

Three roles, hierarchical:

| Role | What they can do |
|---|---|
| viewer | See `/preview/*` only |
| editor | Preview + studio access + editing |
| publisher | Everything above + publish |

RBAC is enforced at the Edge in `src/middleware.ts` before any page or API handler runs. The publish API route also re-verifies the JWT independently — so even if the middleware had a bug, an under-privileged request still can't trigger a publish.

The demo users are hardcoded in `src/lib/auth/roles.ts`. In production you'd replace that with a real identity provider call; the JWT and cookie setup stays the same.

---

## How publishing works

Clicking Publish sends the current Redux draft to `POST /api/publish`. The server:

1. Checks the session (publisher role required)
2. Validates the page against the Zod `PageSchema`
3. Hashes the page to check if it's identical to the last release — if so, returns the existing release without writing anything (idempotent)
4. Diffs the new page against the last release to figure out what changed
5. Bumps the version according to the rules below
6. Writes an immutable JSON file to Vercel Blob at `releases/<slug>/<version>.json`

### Version bump rules

| What changed | Version bump |
|---|---|
| Section removed or section type changed | major |
| Section added | minor |
| Prop value or title changed | patch |
| Nothing changed | no new version |

Major always beats minor. If a single publish both adds and removes a section, the result is major, not minor.

The initial version is always `1.0.0`. There's no way to get a `0.x` version — the first publish is always `1.0.0`.

### Storage

Releases live in Vercel Blob as plain JSON files under the `releases/` prefix. On Vercel, connect a Blob store to the project so `BLOB_READ_WRITE_TOKEN` is available to serverless functions. Locally, add the same token to `.env.local` if you want publish actions to persist.

---

## How sections work

Every section type is registered in `src/lib/registry/sectionRegistry.ts`. The registry holds the Zod schema, display label, and default props for each type. It's the only place that needs to change when you add a new section type.

To add a new section:

1. Write the React component in `src/components/sections/`
2. Add the Zod schema to `src/lib/schemas/section.schema.ts`
3. Add one entry to `sectionRegistry`
4. Add the component to `SECTION_COMPONENTS` in `PageRenderer.tsx`

That's it. No switch statements, no if/else chains. TypeScript's exhaustiveness checking will catch you if you forget any of the four steps.

Unknown section types (from Contentful, for example) render an `UnsupportedSection` placeholder instead of crashing. Sections with invalid props render an accessible error state in place of that section — the rest of the page stays up.

---

## Contentful setup

If you want to connect real Contentful data, create these content types in your space:

**`landingPage`** — `pageId` (Short text), `slug` (Short text, unique), `title` (Short text), `sections` (References, many)

**`heroSection`** — `sectionId`, `heading` (required), `subheading`, `ctaLabel`, `ctaUrl`, `backgroundImageUrl`

**`featureGridSection`** — `sectionId`, `heading`, `subheading`, `features` (JSON — array of `{id, title, description, icon?}`)

**`testimonialSection`** — `sectionId`, `quote`, `author`, `role`, `company`, `avatarUrl`

**`ctaSection`** — `sectionId`, `heading`, `label`, `url`, `subtext`

After creating the types and some entries, add your credentials to `.env.local`. The adapter in `src/lib/contentful/adapters.ts` handles the conversion from Contentful's wire format to the internal `Page` type — no CMS-specific types escape into the UI layer.

---

## Accessibility

The target is WCAG 2.2 AA, with AAA practices where they don't conflict with the design. A few specifics:

- Skip link is the first focusable element on every page, visible when focused
- Keyboard navigation works for everything including section reordering
- Focus indicators use `:focus-visible` with a 3px outline — visible for keyboard users, not shown on mouse click
- `aria-live="polite"` on the unsaved changes indicator
- `prefers-reduced-motion` disables all transitions and animations
- Every form input has a `<label>` with a matching `htmlFor`/`id` pair

Automated: `@axe-core/playwright` scans four pages in every CI run. Critical or serious violations fail the build.

---

## Tests

```bash
# Unit tests (Zod schemas + SemVer logic)
npm run test

# Watch mode
npm run test:watch

# E2E (needs a running dev server or build)
npm run test:e2e

# E2E with Playwright UI
npm run test:e2e:ui
```

Unit tests cover schema validation edge cases and every combination of change type in the SemVer diff logic. E2E tests cover the preview page rendering, RBAC enforcement, editor interactions, and a full axe scan on all pages.

Axe results are written to `test-results/a11y-report.json` after every E2E run and uploaded as a CI artefact.

---

## CI

Every push to `main` and every PR runs two jobs:

- **quality** — TypeScript check, ESLint, unit tests
- **e2e** (runs after quality passes) — production build, Playwright tests, axe scan, artefact upload

If the `a11y-report.json` file isn't written by the end of the E2E job, CI fails explicitly — so a test that crashes before writing the report doesn't silently pass the accessibility gate.

Merging to `main` triggers a Vercel deploy via `.github/workflows/deploy.yml`, conditional on CI passing.

---

## Project structure

```
src/
├── app/               # Routes and API handlers
│   ├── page.tsx       # Home
│   ├── preview/[slug] # Public page renderer
│   ├── studio/[slug]  # Editor (auth required)
│   ├── auth/          # Sign in page
│   └── api/           # publish, auth/login, auth/logout, auth/me
│
├── components/
│   ├── sections/      # Hero, FeatureGrid, Testimonial, CTA
│   ├── studio/        # SectionList, SectionEditor, PublishButton, Toolbar
│   ├── ui/            # PageRenderer, ErrorBoundary, shadcn primitives
│   └── layout/        # Header, RoleBadge
│
├── lib/
│   ├── contentful/    # Client, adapter, queries, demo data
│   ├── registry/      # sectionRegistry.ts
│   ├── schemas/       # Zod schemas (Page + each section type)
│   ├── semver/        # diff.ts, version.ts, snapshot.ts
│   └── auth/          # session.ts (JWT), roles.ts
│
├── store/             # Redux store + three slices
├── hooks/             # useDraftPersistence
├── middleware.ts      # Edge RBAC
└── types/index.ts     # Domain types
```

---

## Known limitations

**Feature item editing** — The feature grid section has a `features` array but the studio only exposes the heading and subheading. Editing individual feature items would need a list editor widget; it's a UI scope decision, not an architectural one — the schema and data model fully support it.

**Publishing storage** — Release snapshots use Vercel Blob. A missing `BLOB_READ_WRITE_TOKEN` will make `/api/publish` return a storage configuration error.

**Single browser in E2E** — CI runs Playwright tests against Chromium only. Firefox and WebKit would give broader coverage.

**Demo auth** — The demo users in `roles.ts` are hardcoded. In production this connects to a real identity provider.
