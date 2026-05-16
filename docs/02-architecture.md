# Architecture Overview

## Design Philosophy

The architecture follows a single principle: **each layer has one job and one direction of dependency.**

```
External world (Contentful, browser, user)
        ↓
Adapters / session verification
        ↓
Domain types (Page, Section, Release)
        ↓
Business logic (registry, diff, snapshot)
        ↓
State management (Redux slices)
        ↓
UI (components, pages)
```

Nothing in the UI layer imports from Contentful. Nothing in the business logic layer imports from React. The dependency graph is acyclic and unambiguous.

---

## Folder Structure

```
src/
│
├── types/
│   └── index.ts                  ← canonical domain types (Page, Section, Role, Release)
│
├── lib/
│   ├── schemas/
│   │   ├── section.schema.ts     ← per-section Zod schemas (HeroProps, CTAProps, …)
│   │   └── page.schema.ts        ← Page-level schema (validates structure before render)
│   │
│   ├── registry/
│   │   └── sectionRegistry.ts    ← maps SectionType → { schema, label, defaultProps }
│   │
│   ├── contentful/
│   │   ├── contentfulClient.ts   ← factory: published vs preview client
│   │   ├── adapters.ts           ← Contentful entry → internal Page/Section
│   │   └── queries.ts            ← fetchPageBySlug, fetchAllPageSlugs
│   │
│   ├── semver/
│   │   ├── diff.ts               ← comparePages(prev, next) → DiffResult
│   │   ├── version.ts            ← bumpVersion(current, changeType)
│   │   └── snapshot.ts           ← publishSnapshot, getLatestRelease
│   │
│   ├── auth/
│   │   ├── roles.ts              ← ROLE_RANK, hasRole, DEMO_USERS, PROTECTED_ROUTES
│   │   └── session.ts            ← createSessionToken, verifySessionToken (jose JWT)
│   │
│   └── utils/
│       ├── cn.ts                 ← tailwind-merge + clsx
│       └── hash.ts               ← deterministic page checksum (idempotent publish)
│
├── store/
│   ├── index.ts                  ← makeStore, AppStore, RootState, AppDispatch
│   ├── hooks.ts                  ← useAppDispatch, useAppSelector (typed)
│   ├── provider.tsx              ← ReduxProvider (ref-stable store for App Router)
│   └── slices/
│       ├── draftPageSlice.ts     ← loadPage, addSection, reorderSections, …
│       ├── uiSlice.ts            ← selectedSectionId, sidebarOpen, previewMode
│       └── publishSlice.ts       ← publishPage thunk, status, latestRelease
│
├── hooks/
│   └── useDraftPersistence.ts    ← localStorage read/write without redux-persist
│
├── components/
│   ├── sections/                 ← one file per section type (pure presentation)
│   │   ├── HeroSection.tsx
│   │   ├── FeatureGridSection.tsx
│   │   ├── TestimonialSection.tsx
│   │   ├── CTASection.tsx
│   │   └── UnsupportedSection.tsx
│   │
│   ├── studio/                   ← editor-only components
│   │   ├── SectionList.tsx       ← dnd-kit sortable list
│   │   ├── SectionEditor.tsx     ← props editor panel
│   │   ├── AddSectionMenu.tsx    ← add new section by type
│   │   └── PublishButton.tsx     ← triggers publishPage thunk
│   │
│   ├── layout/
│   │   ├── Header.tsx            ← server component (reads session cookie)
│   │   └── RoleSwitcher.tsx      ← client component (demo role switcher)
│   │
│   └── ui/
│       ├── PageRenderer.tsx      ← resolves registry → validates → renders sections
│       ├── ErrorBoundary.tsx     ← catches render errors per-section
│       ├── button.tsx            ← shadcn
│       ├── input.tsx             ← shadcn
│       └── …                    ← other shadcn primitives
│
├── app/
│   ├── layout.tsx                ← root layout (skip link, ReduxProvider, Toaster)
│   ├── page.tsx                  ← home / landing
│   ├── auth/
│   │   ├── page.tsx              ← Suspense wrapper for searchParams
│   │   └── AuthForm.tsx          ← client component (role picker)
│   ├── preview/[slug]/
│   │   └── page.tsx              ← server: fetch → validate → PageRenderer
│   ├── studio/[slug]/
│   │   ├── page.tsx              ← server: fetch + auth → StudioClient
│   │   └── StudioClient.tsx      ← client: Redux editor + live preview
│   └── api/
│       ├── publish/route.ts      ← POST: auth check → validate → publishSnapshot
│       └── auth/
│           ├── login/route.ts
│           ├── logout/route.ts
│           └── me/route.ts
│
├── middleware.ts                 ← Edge RBAC: /studio → editor, /api/publish → publisher
│
└── tests/
    ├── setup.ts
    ├── unit/
    │   ├── schema.test.ts        ← Zod schema edge cases
    │   └── semver.test.ts        ← diff + bumpVersion
    └── e2e/
        ├── preview.spec.ts
        ├── studio.spec.ts
        └── accessibility.spec.ts ← axe + a11y-report.json
```

---

## Key Architectural Boundaries

### 1. Section Registry

`sectionRegistry.ts` is the single source of truth for what section types exist. It is **server-safe** — it only imports Zod schemas and type definitions. React components live in a separate map in `PageRenderer.tsx`.

```
sectionRegistry.ts
  schema: ZodSchema<HeroProps>      ← validates before render
  label: "Hero"                     ← shown in studio sidebar
  defaultProps: HeroProps           ← used when editor adds a new section
```

Adding a new section type:
1. Add Zod schema to `section.schema.ts`
2. Add component to `components/sections/`
3. Add one entry to `sectionRegistry`
4. Add one entry to `SECTION_COMPONENTS` in `PageRenderer.tsx`

TypeScript will error at compile time if any of these are missing or mismatched.

### 2. PageRenderer

`PageRenderer.tsx` owns the resolution chain:

```
section.type → registry lookup → props validation → component render
     ↓ unknown type                  ↓ invalid props
UnsupportedSection               per-section error state (no crash)
```

Each section is wrapped in an `ErrorBoundary` so a runtime error in one component cannot crash the entire page.

### 3. Server / Client Split

| File | Type | Why |
|---|---|---|
| `app/preview/[slug]/page.tsx` | Server Component | Fetches Contentful data server-side |
| `app/studio/[slug]/page.tsx` | Server Component | Fetches page + verifies session server-side |
| `app/studio/[slug]/StudioClient.tsx` | Client Component | Redux state, dnd-kit, live preview |
| `components/layout/Header.tsx` | Server Component | Reads session cookie on every request |
| `components/layout/RoleSwitcher.tsx` | Client Component | Handles click events for role switching |
| `middleware.ts` | Edge Runtime | Runs before every matched request |

Server components pass data down to client components as props. Client components never re-fetch data that was already fetched server-side.

### 4. RBAC Layers

```
Request → middleware (Edge) → verifyJWT → hasRole → redirect or pass through
                                                          ↓
                                              server component reads cookie again
                                              (independent verification)
                                                          ↓
                                              POST /api/publish → verifyJWT again
                                              (defence-in-depth for the API)
```

Three layers, each independently enforced. The UI (hiding buttons) is UX, not security.

---

## Data Flow: Studio Editing

```
1. Server: fetchPageBySlug (Contentful)
2. Server: pass initialPage to StudioClient
3. Client: dispatch(loadPage(initialPage))           ← draftPageSlice
4. Client: useDraftPersistence reads localStorage
5. Client: dispatch(hydrateDraft(stored)) if found   ← overrides Contentful data with persisted draft
6. User edits: dispatch(updateSectionProps(...))      ← Immer mutation via RTK
7. useDraftPersistence writes to localStorage        ← on every change
8. PageRenderer re-renders from Redux state          ← live preview
9. User publishes: dispatch(publishPage({ slug }))   ← publishSlice thunk
10. POST /api/publish → publishSnapshot              ← diff → bump → write JSON
11. dispatch(markClean())                             ← clears dirty flag
```

---

## What Makes This Maintainable

- **One type definition, used everywhere.** `src/types/index.ts` is the single source of truth. Changing `Section` propagates through Zod, the registry, Redux, and components through TypeScript.
- **No magic strings.** Section types are a TypeScript union. An unknown string literal fails at compile time.
- **Pure functions for logic.** `comparePages`, `bumpVersion`, and `hashPageSync` are pure — zero side effects, trivially testable.
- **Thin pages.** Route components do one thing: fetch data and pass it down. All logic lives in the layers below.
