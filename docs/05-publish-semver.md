1# Publish Flow + SemVer Logic

## Overview

Publishing freezes the current Redux draft into an immutable, versioned JSON snapshot. The version number is calculated deterministically by diffing the new draft against the previous release. The same draft published twice always produces the same version — no duplicates.

---

## End-to-End Publish Flow

```
1. User clicks "Publish" in the studio
   ↓
2. dispatch(publishPage({ slug }))           [publishSlice.ts]
   ↓
3. Redux thunk reads draftPage.page from store
   ↓
4. POST /api/publish { slug, page }
   ↓
5. Middleware has already verified the session (publisher role)
   ↓
6. API route re-verifies JWT independently (defence-in-depth)
   ↓
7. PageSchema.safeParse(page) — validate before touching the filesystem
   ↓
8. publishSnapshot(draft)                     [snapshot.ts]
   ↓
9. Hash draft → compare with latest release hash
   If match → return existing release (idempotent, no file written)
   ↓
10. comparePages(latest.snapshot, draft) → DiffResult
    ↓
11. bumpVersion(latest.version, changeType) → new version string
    ↓
12. Write releases/{slug}/{version}.json
    ↓
13. Return Release { version, changelog, snapshot, … }
    ↓
14. Redux: status = 'success', latestRelease = Release
    ↓
15. dispatch(markClean()) — reset isDirty flag
    ↓
16. Toast notification: "Version X.Y.Z is live"
```

---

## SemVer Diff Logic

**File:** `src/lib/semver/diff.ts`

```typescript
comparePages(previous: Page, next: Page): DiffResult
```

The function returns `{ changeType: 'none' | 'patch' | 'minor' | 'major', changes: string[] }`.

### Rules (applied in descending severity order)

| Condition | Bump | Example change string |
|---|---|---|
| Section removed | **major** | `"Removed hero section (hero-1)"` |
| Section type changed | **major** | `"Changed section type hero → cta (hero-1)"` |
| Section added | **minor** | `"Added testimonial section (s-abc123)"` |
| Props changed on existing section | **patch** | `"Updated props in hero section (hero-1)"` |
| Title changed | **patch** | `"Updated page title: 'Old' → 'New'"` |
| Nothing changed | **none** | (no new version created) |

### Severity always escalates, never downgrades

If a page both adds a section (minor) and removes a section (major), the result is **major**. The logic checks for major conditions first, then minor, then patch. A `changeType` variable starts at `'none'` and only ever moves up the severity chain.

### Implementation detail

```typescript
const prevMap = new Map(previous.sections.map((s) => [s.id, s]))
const nextMap = new Map(next.sections.map((s) => [s.id, s]))

// O(n) lookups for all three checks:
// 1. ID in prevMap but not nextMap → removed → MAJOR
// 2. ID in both, different type → MAJOR
// 3. ID in nextMap but not prevMap → added → MINOR
// 4. ID in both, same type, different props → PATCH
```

Using Maps makes this O(n) rather than O(n²) and avoids nested loops.

---

## Version Bumping

**File:** `src/lib/semver/version.ts`

```typescript
bumpVersion('1.2.3', 'major')  → '2.0.0'
bumpVersion('1.2.3', 'minor')  → '1.3.0'
bumpVersion('1.2.3', 'patch')  → '1.2.4'
```

Bumping major resets minor and patch. Bumping minor resets patch only. This matches the SemVer specification.

The initial version when no prior release exists is `'1.0.0'`.

---

## Idempotency

**File:** `src/lib/semver/snapshot.ts`

```typescript
const checksum = hashPageSync(draft)
const latest = await getLatestRelease(slug)

if (latest?.checksum === checksum) return latest  // ← idempotent guard
```

`hashPageSync` uses a djb2 hash over the page's canonical JSON representation. The canonical representation sorts keys consistently to prevent reordering from producing a different hash.

The idempotency check runs before any file I/O. If the draft matches the last release byte-for-byte, no file is written and the existing release is returned. Publishing the same page twice always returns version `1.0.0`, not `1.0.0` and `1.0.1`.

---

## Snapshot Storage

Each published release is stored as an immutable JSON file:

```
releases/
  demo/
    1.0.0.json
    1.0.1.json
    1.1.0.json
    2.0.0.json
```

### Snapshot structure

```json
{
  "version": "1.1.0",
  "slug": "demo",
  "pageId": "demo-page-1",
  "publishedAt": "2025-05-16T09:30:00.000Z",
  "changelog": [
    "Added testimonial section (s-abc123)",
    "Updated props in hero section (hero-1)"
  ],
  "checksum": "3f8a2b9c",
  "snapshot": {
    "pageId": "demo-page-1",
    "slug": "demo",
    "title": "Demo Landing Page",
    "sections": [...]
  }
}
```

### Finding the latest release

The `getLatestRelease` function reads the directory, parses all `X.Y.Z.json` filenames as version numbers, and sorts them numerically (not lexicographically — `10.0.0` correctly sorts after `9.0.0`).

### Production note

The filesystem approach works for local development and single-instance deployments. On Vercel (ephemeral filesystem) or any horizontally-scaled deployment, replace `snapshot.ts`'s I/O with:
- **Vercel KV** (Redis-compatible, good for small JSON blobs)
- **Vercel Blob** (object storage, good for larger payloads)
- **PostgreSQL/PlanetScale** (if you want queryable release history)

The interface `publishSnapshot(draft: Page): Promise<Release>` stays identical. Only the two functions that read and write files need replacing.

---

## Example: Three Sequential Publishes

Starting from no releases:

**Publish 1** — Initial state of the demo page
- No prior release → version `1.0.0`
- changelog: `["Initial release"]`

**Publish 2** — User edits the hero heading
- `comparePages` finds props changed on `hero-1` → `patch`
- `bumpVersion('1.0.0', 'patch')` → `1.0.1`
- changelog: `["Updated props in hero section (hero-1)"]`

**Publish 3** — Same state as publish 2, no changes
- Checksum matches `1.0.1.json` → idempotent, returns `1.0.1`
- No new file written

**Publish 4** — User adds a testimonial section
- `comparePages` finds new section → `minor`
- `bumpVersion('1.0.1', 'minor')` → `1.1.0`
- changelog: `["Added testimonial section (s-xyz)"]`
