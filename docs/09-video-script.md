# Video Script — Page Studio Walkthrough

**Target length:** 7–8 minutes  
**Format:** Screen recording with voiceover  
**Suggested order:** Browser demo first, then code walkthrough

---

## [0:00 – 0:30] Opening — What We're Looking At

> "This is Page Studio — a schema-driven landing page builder built with Next.js, Redux Toolkit, and Contentful. In the next seven minutes I'll walk through the working application, explain the key architectural decisions, and show the code that makes it all work."

**Show:** Browser at `http://localhost:3000`

> "The home page gives us two entry points — a public preview of the demo page, and the studio where editors build pages. Let me start with the preview so you can see what gets built."

---

## [0:30 – 1:30] Preview Page

**Navigate to:** `/preview/demo`

> "This is the rendered landing page. It's assembled from three section types — a hero, a feature grid, and a call to action. The content comes from Contentful, or if Contentful isn't configured, from a local demo data file. Either way the page renders identically."

**Scroll through the page slowly.**

> "Every section here was validated against a Zod schema before rendering. If a section arrives with bad data — missing a required field, wrong type — it renders in an error state rather than crashing the page. The rest of the content is unaffected."

**Open DevTools → Accessibility tab or run tab order check.**

> "The page starts with a skip link — the first focusable element — which keyboard users can use to jump past the navigation. Focus indicators are visible on all interactive elements. I'll show the axe test results shortly."

---

## [1:30 – 2:30] Auth and RBAC

**Navigate to:** `/auth`

> "The studio requires authentication. We have three demo accounts: viewer, editor, and publisher. Role is stored in a signed JWT cookie using the `jose` library — which runs on the Edge runtime, so it works in Next.js middleware without Node.js dependencies."

**Click "Sign in as Editor."**

> "Signing in does a hard navigation — `window.location.href` — rather than a router push. This ensures the new cookie is reliably picked up before the next request goes out, which avoids a race condition in App Router's client-side navigation."

**Navigate to:** `/studio/demo`

> "We're now in the studio as an editor. Notice the 'Publish' button is absent — that's RBAC enforced on the client using the role from the JWT. But the enforcement isn't only cosmetic."

**Open a new tab, go to:** `/api/publish` directly or show the middleware config.

> "The middleware intercepts every request to `/studio/*` and `/api/publish` on the Edge, before the route handler runs. It decodes the JWT and checks the role. For page navigations it redirects to login. For API requests it returns a JSON 403. The publish API route also re-verifies the JWT independently — defence in depth."

---

## [2:30 – 4:00] Studio — Editing and Live Preview

**Back in studio as editor.**

> "The studio layout has three panels: the sidebar with the section list on the left, the live preview canvas in the centre, and the properties editor on the right when a section is selected."

**Click a section in the sidebar.**

> "Selecting a section from the list opens its properties editor. Let me edit the hero heading."

**Type a new heading in the input field.**

> "The preview updates in real time. There's no save step — every keystroke dispatches a Redux action that updates the draft, and the preview component re-renders from that draft."

**Drag a section to reorder it.**

> "Sections can be reordered by dragging. The drag handles use dnd-kit, which provides both pointer and keyboard sensors. A keyboard user can press Space to pick up a section, use arrow keys to move it, and Space again to drop — no mouse required."

**Add a new section using the 'Add Section' button.**

> "Adding a section pulls defaults from the section registry — a central object that stores the Zod schema, display label, and default props for every known section type. There's no switch statement anywhere — the registry is the only place that needs updating when a new section type is added."

**Show the unsaved changes indicator.**

> "The amber 'Unsaved changes' indicator is announced to screen readers via `aria-live='polite'`. It's driven by the `isDirty` flag in the Redux draft slice."

---

## [4:00 – 4:45] Draft Persistence

**Reload the browser.**

> "I just reloaded the page. The unsaved changes are still here — the draft was persisted to localStorage on every change by the `useDraftPersistence` hook."

> "I chose a plain `useEffect` hook over `redux-persist` for this. Redux-persist fires a REHYDRATE action asynchronously after mount, which creates a window where the server-rendered HTML and the client HTML disagree — producing React hydration warnings in App Router. The useEffect approach runs strictly after mount, so there's no SSR/client mismatch."

---

## [4:45 – 6:00] Publish Flow and SemVer

**Sign out and sign back in as publisher.**

> "Now as a publisher the 'Publish' button is visible. Let me click it."

**Click Publish.**

> "The publish button dispatches a Redux thunk that reads the current draft from the store and POSTs it to `/api/publish`. The API route validates the page against the Zod PageSchema, then hands it to `publishSnapshot`."

**Open `src/lib/semver/` in the editor.**

> "The snapshot function first hashes the draft using a djb2 hash over a canonically sorted JSON representation. If the hash matches the last release, it returns the existing release without writing any file — idempotent publish."

> "If the hash is different, `comparePages` diffs the previous and new page sections. It builds two Maps — one for the previous sections, one for the new sections — and runs three O(n) passes: removed sections are major, type changes are major, added sections are minor, prop changes are patch. Severity escalates but never downgrades — if a page both adds and removes a section, the result is major."

**Show `src/lib/semver/diff.ts` briefly.**

> "`bumpVersion` then takes the previous version string and the change type and returns the new version. Bumping major resets minor and patch. The initial version is always 1.0.0."

**Show the toast notification and the new version displayed.**

> "The result is written to `releases/demo/1.0.1.json` — an immutable JSON file containing the version, changelog, checksum, and the full page snapshot."

---

## [6:00 – 6:45] Tests and CI

**Switch to terminal.**

```bash
npm run test
```

> "The unit test suite covers the Zod schemas and the SemVer logic. Schema tests verify that valid pages pass and that invalid ones fail with the expected errors. SemVer tests cover every change type and edge case — including simultaneous adds and removes, which should produce major, not minor."

```bash
npm run test:e2e
```

> "The E2E suite runs in Playwright against a Chromium browser. It covers the preview page rendering, keyboard focusability, RBAC enforcement in the studio, the editor flow, and four pages scanned with axe-core for accessibility violations. The CI pipeline fails if any critical or serious axe violation is found, or if the `a11y-report.json` artefact is not written."

**Show `.github/workflows/ci.yml` briefly.**

> "CI has two jobs: `quality` runs TypeScript, ESLint, and Vitest; `e2e` depends on quality passing, then builds the app and runs Playwright. Only one pipeline per branch runs at a time — new pushes cancel in-flight runs."

---

## [6:45 – 7:30] Code Structure Summary

**Show the `src/` folder structure in the editor.**

> "To close out, the folder structure reflects the architectural boundaries. `src/lib/` is pure logic — no React, no Next.js. `src/store/` is Redux only — no UI. `src/components/` is UI only — reads from the store, dispatches actions. `src/app/` is Next.js routing — server components fetch data, client components receive it as props."

> "The Contentful adapter is the only file in the codebase that knows about Contentful's wire format. Everything above it receives a plain `Page` object. The section registry is the only file that knows about the full set of section types. Everything else discovers them through the registry interface."

> "The result is a system where you can add a section type by touching two files — the registry and the component map — and where you can swap the CMS by touching one file — the adapter."

---

## [7:30 – 8:00] Closing

> "The application is deployed to Vercel via a GitHub Actions workflow that runs after CI passes. The deploy workflow uses `amondnet/vercel-action` with project credentials stored as repository secrets."

> "The main production caveat is snapshot storage — the filesystem approach works for a single instance. For Vercel's ephemeral filesystem you'd replace the two I/O functions in `snapshot.ts` with Vercel KV or Blob storage. The `publishSnapshot` interface stays identical."

> "Thanks for watching. The docs folder has detailed write-ups on every subsystem if you want to go deeper on any particular area."

---

## Suggested Screen Regions to Record

| Timestamp | Primary Window |
|---|---|
| 0:00 – 0:30 | Browser — home page |
| 0:30 – 1:30 | Browser — `/preview/demo`, DevTools |
| 1:30 – 2:30 | Browser — `/auth`, middleware code |
| 2:30 – 4:00 | Browser — `/studio/demo` as editor |
| 4:00 – 4:45 | Browser — reload, localStorage in DevTools |
| 4:45 – 6:00 | Browser — publish flow, `src/lib/semver/` in editor |
| 6:00 – 6:45 | Terminal — test runs, `ci.yml` in editor |
| 6:45 – 7:30 | Editor — `src/` folder tree |
| 7:30 – 8:00 | Editor — `snapshot.ts`, Vercel dashboard |
