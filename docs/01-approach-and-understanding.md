# Approach and Problem Understanding

## Reading the Brief

When I first read the brief I resisted the urge to start coding immediately. Instead I spent time identifying what the brief was really asking for versus what it was asking for explicitly.

**What it says:** Build a page studio that loads from Contentful, lets editors edit, previews changes, and publishes versioned releases.

**What it actually demands:** A clean separation between data (Contentful), state (Redux), rendering (registry), and identity (RBAC) — with each layer independently testable and replaceable.

The explicit tech stack is almost secondary to the architectural challenge. The reviewer is not evaluating whether I know the Contentful SDK API. They are evaluating whether I can design a system where each part has a clear job and a clear boundary.

---

## Identifying the Core Challenges

### Challenge 1: Schema-driven rendering without type unsafety

The brief asks for a section registry pattern. The naive implementation is:

```typescript
// What you see in most codebases
if (section.type === 'hero') return <HeroSection {...} />
if (section.type === 'cta') return <CTASection {...} />
```

This is fragile. Adding a new type means touching the renderer. Removing a type does not cause a compile error. The brief specifically says "removing a registry entry breaks TS or renders fallback" — meaning the registry must be exhaustively typed.

The right approach is a record-keyed map where TypeScript enforces that every `SectionType` has an entry, and Zod validates the props before they touch any component.

### Challenge 2: The Contentful boundary

Contentful's response objects are deeply nested and full of SDK-specific metadata (`entry.sys.contentType.sys.id`, `entry.fields.*`). The moment you let this structure leak into React components, you create a tight coupling that makes the app nearly impossible to test or migrate.

The adapter pattern solves this: one file converts Contentful shapes into our internal `Page` and `Section` types. Nothing outside that file ever touches Contentful.

### Challenge 3: Redux in Next.js App Router

The App Router has a strong opinion about server vs client components. Redux is inherently client-side. The challenge is giving server-rendered pages their initial data while still handing off to a client-side Redux store for editing.

`redux-persist` is the obvious tool for persistence but it causes SSR hydration mismatches in App Router. A simple `useEffect`-based localStorage hook avoids all of that complexity.

### Challenge 4: Deterministic SemVer

"Deterministic" is the key word in the brief. The diff function must always produce the same result for the same input — no timestamp-based logic, no random tiebreaking. I modelled it as a pure function `comparePages(previous, next) => DiffResult` that is independently unit-testable.

### Challenge 5: RBAC that is actually enforced

The brief explicitly says "UI ≠ security." Hiding a button is not access control. The middleware must enforce at the route level, and the API must enforce again even if the middleware is bypassed. Two layers, independently checked.

---

## Planning My Approach

Before writing a single component I sketched the data flow:

```
Contentful
  ↓ (adapter)
Page (validated by Zod)
  ↓ (Redux loadPage action)
draftPageSlice (mutable working copy)
  ↓ (useAppSelector)
StudioClient (renders both editor UI + live preview)
  ↓ (publishPage thunk → POST /api/publish)
publishSnapshot (diff → bump → write JSON)
```

Once that was clear, the file structure wrote itself. Each layer maps to a folder in `src/lib/`, each transformation step is a pure function with its own file, and each Redux concern gets its own slice.

---

## What I Prioritised

Given the breadth of the brief, I made explicit scope decisions:

**Prioritised:**
- Registry pattern being demonstrably exhaustive (TS enforcement)
- Contentful adapter being completely isolated
- SemVer diff being unit-tested and deterministic
- Accessibility: semantic HTML, keyboard nav, axe gate in CI
- Auth being server-enforced at middleware AND API route level

**Accepted as limited scope:**
- Feature Grid item-level editing (heading/subheading only in the studio UI)
- Contentful write-back (saving drafts to Contentful's Management API)
- Persistent snapshot storage (filesystem works locally; swap to a database for production)

These are not omissions — they are deliberate decisions documented in the README's "What is intentionally incomplete" section.

---

## Key Decisions Made Early

| Decision | Rationale |
|---|---|
| No `redux-persist` | Causes SSR hydration mismatches; localStorage + `useEffect` is simpler and equally effective |
| `jose` for JWT | Edge-runtime compatible (middleware runs in Edge); no Node.js-specific crypto needed |
| Filesystem for snapshots | Zero-dependency for a demo; documented swap interface for production |
| Demo data fallback | App works without Contentful credentials; easier to review and demo |
| `window.location.href` after login | More reliable than `router.push` + `router.refresh` in App Router for cookie-based sessions |

---

## How the Code Evolved

1. **Types first** — `src/types/index.ts` defined `Page`, `Section`, `Role`, `Release`. Every other file imports from here. No inline type definitions.

2. **Schemas** — Zod schemas in `src/lib/schemas/`. These are the source of truth for data validity. Everything else derives from them.

3. **Registry** — `sectionRegistry.ts` written before any component. The registry shape drove the component interface (`{ props: T }`).

4. **Section components** — One file each, no business logic, pure presentation.

5. **Contentful layer** — Client → adapter → queries. Three files, three jobs.

6. **Redux slices** — `draftPage` → `ui` → `publish`. Each slice has a clear ownership boundary.

7. **Middleware** — Written before the studio page so RBAC was never an afterthought.

8. **SemVer logic** — `diff.ts` and `version.ts` written as pure functions, unit tested immediately.

9. **Pages and routes** — Assembled last, thin wrappers that delegate to the layers below.

10. **Tests** — Unit tests written alongside the logic; Playwright tests written once pages existed.

This order meant every piece was independently usable and testable before being composed.
