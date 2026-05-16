# Redux Slice Responsibilities

## Overview

The store has three slices with distinct, non-overlapping ownership boundaries.

```
draftPageSlice   ← owns the page content being edited
uiSlice          ← owns transient editor UI state
publishSlice     ← owns the async publish lifecycle
```

None of the slices import from each other. Cross-slice reads happen through selectors at the component level.

---

## Store Configuration

```typescript
// src/store/index.ts
configureStore({
  reducer: {
    draftPage: draftPageReducer,
    ui:        uiReducer,
    publish:   publishReducer,
  }
})
```

A `makeStore` factory function is used instead of a module-level singleton. This is the recommended pattern for Next.js App Router: the `ReduxProvider` creates the store in a ref, ensuring one store instance per browser session without global state leaking between server renders.

---

## 1. `draftPageSlice`

**File:** `src/store/slices/draftPageSlice.ts`

**Owns:** The mutable working copy of the page being edited in the studio.

### State shape

```typescript
type DraftPageState = {
  page: Page | null   // null until a page is loaded
  isDirty: boolean    // true when the draft differs from the last publish
}
```

### Actions

| Action | Payload | What it does |
|---|---|---|
| `loadPage` | `Page` | Imports a page from Contentful. Resets `isDirty` to false. |
| `hydrateDraft` | `Page` | Restores a previously persisted draft from localStorage. Sets `isDirty` to true. |
| `updateTitle` | `string` | Changes the page title. |
| `addSection` | `SectionType` | Appends a new section using registry defaults. Generates a unique ID via `crypto.randomUUID`. |
| `removeSection` | `string` (id) | Removes a section by ID. |
| `reorderSections` | `{ fromIndex, toIndex }` | Moves a section from one position to another. Fed directly by dnd-kit's `onDragEnd`. |
| `updateSectionProps` | `{ sectionId, props }` | Merges new props into a section. |
| `markClean` | — | Resets `isDirty` after a successful publish. |
| `clearDraft` | — | Removes the draft entirely. |

### Mutations are via Immer

Redux Toolkit wraps all reducers in Immer, so mutations like `sections.splice(fromIndex, 1)` look like direct mutation but produce a new immutable state. No `...spread` copying required.

### Why `hydrateDraft` is separate from `loadPage`

`loadPage` represents "this is the canonical Contentful state" — it resets the dirty flag. `hydrateDraft` represents "this is a user's unfinished work" — it sets the dirty flag. Having separate actions makes the intent explicit and lets the `useDraftPersistence` hook restore work without incorrectly signalling a clean state.

---

## 2. `uiSlice`

**File:** `src/store/slices/uiSlice.ts`

**Owns:** Transient editor UI state that has no business value and is never persisted.

### State shape

```typescript
type UIState = {
  selectedSectionId: string | null  // which section's props are shown in the editor panel
  sidebarOpen: boolean              // sidebar visibility
  previewMode: boolean              // live preview vs edit mode toggle
}
```

### Actions

| Action | What it does |
|---|---|
| `selectSection(id \| null)` | Selects a section for editing; null deselects |
| `toggleSidebar()` | Flips sidebar open/closed |
| `setPreviewMode(bool)` | Sets preview mode explicitly |
| `togglePreviewMode()` | Flips preview mode |

### Design note

`uiSlice` is intentionally kept free of any page or section knowledge. It only holds IDs and booleans. The actual section data is always read from `draftPageSlice` using the selected ID as a key. This separation makes it trivial to change the editor layout without touching page data logic.

---

## 3. `publishSlice`

**File:** `src/store/slices/publishSlice.ts`

**Owns:** The async publish lifecycle and the most recently published release.

### State shape

```typescript
type PublishState = {
  status: 'idle' | 'publishing' | 'success' | 'error'
  latestRelease: Release | null
  error: string | null
}
```

### Actions

| Action | What it does |
|---|---|
| `setLatestRelease(Release)` | Manually set the known latest release (e.g. on page load) |
| `resetPublishStatus()` | Returns status to `idle` |
| `publishPage` (async thunk) | POSTs draft to `/api/publish`, stores result |

### `publishPage` thunk

```
dispatch(publishPage({ slug }))
  → reads draftPage.page from Redux state
  → POST /api/publish { slug, page }
  → pending: status = 'publishing'
  → fulfilled: status = 'success', latestRelease = Release
  → rejected: status = 'error', error = message
```

The thunk reads the current draft from `getState()` so `PublishButton` does not need to pass the page as a prop — it only passes the slug. This keeps the component lean.

---

## Draft Persistence

**File:** `src/hooks/useDraftPersistence.ts`

This hook replaces `redux-persist` for persisting the draft page across reloads.

```
On mount (slug changes):
  → read localStorage.getItem(`page-studio:draft:${slug}`)
  → if found: dispatch(hydrateDraft(parsed))

On every draft change:
  → localStorage.setItem(`page-studio:draft:${slug}`, JSON.stringify(draft))
```

**Why not `redux-persist`?**

`redux-persist` wraps reducers with a `REHYDRATE` action that fires asynchronously after mount. In Next.js App Router, this creates a window where the SSR HTML and the client-rendered HTML disagree — causing hydration warnings. The `useEffect`-based approach runs strictly after mount, eliminating the problem entirely.

---

## Typed Hooks

```typescript
// src/store/hooks.ts
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

These typed wrappers mean no component ever needs to type-cast dispatch or state. TypeScript infers the correct types for every action and selector automatically.

---

## Data Flow Diagram

```
Contentful / demoData
        │
        ▼
dispatch(loadPage(page))
        │
        ▼
┌───────────────────┐    ┌───────────────┐
│  draftPageSlice   │    │   uiSlice     │
│                   │    │               │
│  page: Page       │    │ selectedId    │
│  isDirty: bool    │    │ sidebarOpen   │
└─────────┬─────────┘    └───────┬───────┘
          │                      │
          ▼                      ▼
    useAppSelector          useAppSelector
          │                      │
          └──────────┬───────────┘
                     │
                     ▼
              StudioClient
              ├── SectionList (reads page.sections)
              ├── SectionEditor (reads selected section)
              └── PageRenderer (renders live preview)
                     │
                     ▼
         dispatch(publishPage({ slug }))
                     │
                     ▼
            ┌─────────────────┐
            │  publishSlice   │
            │                 │
            │  status         │
            │  latestRelease  │
            └─────────────────┘
```
