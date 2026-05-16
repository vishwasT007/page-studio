# Testing Strategy + CI

## Testing Pyramid

```
            ┌──────────────┐
            │  Playwright  │  ← E2E + accessibility (slow, high confidence)
            │   + axe      │
           ─┴──────────────┴─
          ┌──────────────────┐
          │   Vitest unit    │  ← Pure logic (fast, deterministic)
         ─┴──────────────────┴─
        ┌────────────────────────┐
        │  TypeScript type check │  ← Compile-time correctness (zero runtime cost)
       ─┴────────────────────────┴─
```

The strategy prioritises testing at the layer where mistakes are most costly:
- **Types** catch shape mismatches at compile time — no runtime cost
- **Unit tests** cover pure logic (schemas, SemVer) where edge cases are well-defined
- **E2E tests** cover user flows and accessibility where the full stack matters

---

## Unit Tests

**Framework:** Vitest  
**File:** `src/tests/unit/`

### `schema.test.ts` — Zod schema validation

Tests the Zod schemas directly, independent of Contentful or any UI.

```
PageSchema
  ✓ accepts a valid page
  ✓ rejects a page missing required fields
  ✓ accepts unknown section types (registry handles them, not PageSchema)
  ✓ rejects an empty slug

HeroPropsSchema
  ✓ accepts valid hero props
  ✓ accepts props with only a heading (all optional fields absent)
  ✓ rejects missing heading
  ✓ rejects empty string heading

CTAPropsSchema
  ✓ accepts valid CTA props
  ✓ rejects missing url

FeatureGridPropsSchema
  ✓ accepts valid feature grid
  ✓ rejects empty features array (min 1)

TestimonialPropsSchema
  ✓ accepts valid testimonial
  ✓ rejects missing author
```

### `semver.test.ts` — diff and version logic

Tests `comparePages` and `bumpVersion` with a fixed base page, verifying every change type and edge case.

```
comparePages
  ✓ returns "none" for identical pages
  ✓ returns "patch" for a text/prop change
  ✓ returns "patch" for a title change
  ✓ returns "minor" when a section is added
  ✓ returns "major" when a section is removed
  ✓ returns "major" when a section type changes
  ✓ major beats minor — simultaneous add and remove

bumpVersion
  ✓ initial version is 1.0.0
  ✓ bumps patch: 1.2.3 → 1.2.4
  ✓ bumps minor and resets patch: 1.2.3 → 1.3.0
  ✓ bumps major and resets minor+patch: 1.2.3 → 2.0.0
  ✓ handles 0.x correctly
```

### Running unit tests

```bash
npm run test          # run once
npm run test:watch    # watch mode
```

---

## E2E Tests

**Framework:** Playwright  
**Directory:** `src/tests/e2e/`  
**Browser:** Chromium (single browser; add Firefox/WebKit for fuller coverage)

### `preview.spec.ts`

Verifies that the public preview page renders correctly and is accessible to keyboard users.

```
Preview page
  ✓ renders the demo page
  ✓ renders the hero section with correct heading
  ✓ renders the feature grid
  ✓ CTA button is focusable and has accessible label
  ✓ CTA link navigates to correct href
  ✓ returns 404 for unknown slug
  ✓ skip link is present in the DOM
  ✓ has at least one h1
  ✓ is keyboard navigable (Tab produces a visible focused element)
```

### `studio.spec.ts`

Verifies RBAC enforcement and editor interactions.

```
Studio — RBAC
  ✓ viewer is redirected away from studio
  ✓ editor can access studio

Studio — editor flow (as publisher)
  ✓ shows the sidebar with sections list
  ✓ can add a new section
  ✓ can select a section and see the properties editor
  ✓ editing hero heading updates the live preview
  ✓ publish button is visible for publisher
  ✓ publish button is absent for editor
  ✓ studio toolbar is keyboard accessible
```

### `accessibility.spec.ts`

Runs axe on every page and writes the combined report.

```
Accessibility — home
  ✓ has no critical axe violations

Accessibility — preview/demo
  ✓ has no critical axe violations

Accessibility — auth
  ✓ has no critical axe violations

Accessibility — studio/demo (as publisher)
  ✓ has no critical axe violations
```

**Artefact:** `test-results/a11y-report.json` — written in `afterAll`. CI fails if this file does not exist.

### Running E2E tests

```bash
# Requires the dev server running OR a production build
npm run test:e2e

# UI mode for debugging
npm run test:e2e:ui
```

---

## CI Pipeline

**File:** `.github/workflows/ci.yml`

### Trigger

```yaml
on:
  push:    { branches: [main] }
  pull_request: { branches: [main] }
```

### Jobs

```
quality (Ubuntu, Node 20)
  ├── npm ci
  ├── tsc --noEmit       ← TypeScript check
  ├── next lint          ← ESLint
  └── vitest run         ← Unit tests

e2e (Ubuntu, Node 20) — depends on quality
  ├── npm ci
  ├── playwright install --with-deps chromium
  ├── next build
  ├── playwright test
  ├── upload playwright-report artefact
  ├── upload a11y-report.json artefact
  └── test -f test-results/a11y-report.json    ← fails if report missing
```

### Failure conditions

| Failure | Cause |
|---|---|
| TypeScript errors | `tsc --noEmit` exits non-zero |
| Lint errors | ESLint finds violations |
| Failing unit test | Vitest exits non-zero |
| Failing E2E test | Playwright exits non-zero |
| Critical axe violations | Test throws an error from the axe check |
| Missing a11y report | `test -f` fails if report was not written |

### Environment variables in CI

```yaml
env:
  AUTH_SECRET: ci-test-secret-32-chars-minimum-ok
  # Contentful vars are optional — app falls back to demo data
  CONTENTFUL_SPACE_ID: ${{ secrets.CONTENTFUL_SPACE_ID || '' }}
```

The pipeline works without Contentful credentials by falling back to demo data. Adding Contentful secrets to the repository enables the E2E tests to run against real CMS data.

### Concurrency

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

Only one pipeline per branch runs at a time. New pushes cancel in-flight runs.

---

## Deployment Pipeline

**File:** `.github/workflows/deploy.yml`

Triggers on merge to `main`, after CI passes (GitHub's required status checks).

Uses `amondnet/vercel-action` with:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

All stored as GitHub repository secrets.

---

## What Is Not Tested

| Area | Reason |
|---|---|
| Contentful adapter with real API | Would require live credentials in CI; mocking the SDK adds noise without confidence |
| Publish flow via E2E | Filesystem writes in CI would be cleaned up; not meaningful to assert |
| Cross-browser compatibility | Single browser (Chromium) in CI; extend to Firefox/WebKit for production |
| Mobile responsiveness | Not tested in Playwright; manual verification recommended |
