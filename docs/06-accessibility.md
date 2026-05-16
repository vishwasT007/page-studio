# Accessibility Strategy and Evidence

## Target

**WCAG 2.2 AA** as the minimum, with AAA-oriented practices applied where they do not conflict with the design.

---

## Implementation by Criterion

### 1. Bypass Blocks (WCAG 2.4.1 — A)

A skip link is the first focusable element in the document, before the header. It is visually hidden until focused.

```html
<!-- src/app/layout.tsx -->
<a href="#main-content" class="skip-link">Skip to main content</a>
```

```css
/* globals.css */
.skip-link {
  position: absolute;
  top: -100%;  /* off-screen until focused */
}
.skip-link:focus {
  top: 0;      /* visible when focused */
}
```

The `<main id="main-content">` element is rendered by `PageRenderer` for every page.

### 2. Page Titled (WCAG 2.4.2 — A)

Every route has a meaningful `<title>` via Next.js metadata:

```typescript
// Root layout
export const metadata = {
  title: { template: '%s | Page Studio', default: 'Page Studio' },
}

// Per-route
export const metadata = { title: 'Preview — demo' }
export const metadata = { title: 'Studio — demo' }
export const metadata = { title: 'Sign in' }
```

### 3. Focus Order (WCAG 2.4.3 — A)

Tab order follows document order. No `tabindex` values above 0 are used. The studio sidebar renders before the canvas in the DOM, so keyboard users navigate the sidebar first.

The dnd-kit `KeyboardSensor` allows sections to be reordered with the keyboard:
- `Space` / `Enter` to pick up
- Arrow keys to move
- `Space` / `Enter` to drop
- `Escape` to cancel

### 4. Link Purpose (WCAG 2.4.4 — A)

Every link and button has a programmatically determinable purpose:
- Icon-only buttons have `aria-label`
- Icons have `aria-hidden="true"` (they are decorative)
- Links use descriptive text or `aria-label` where text is ambiguous

```tsx
<Button aria-label={`Remove ${label} section`}>
  <Trash2 aria-hidden="true" />
</Button>
```

### 5. Use of Color (WCAG 1.4.1 — A)

No information is conveyed by color alone:
- The role badge uses both color AND text (`viewer`, `editor`, `publisher`)
- Error states use `role="alert"` in addition to red styling
- The "unsaved changes" indicator uses text in addition to amber color

### 6. Contrast (WCAG 1.4.3 / 1.4.6 — AA / AAA)

CSS custom properties use HSL values designed to meet 4.5:1 (AA) or 7:1 (AAA) contrast ratios:
- Foreground `222.2 84% 4.9%` on background `0 0% 100%` = 18.1:1 (AAA)
- Muted foreground `215.4 16.3% 46.9%` on white = 4.6:1 (AA)
- Focus ring at 3px width provides 3:1 contrast ratio against adjacent colors (WCAG 2.4.11)

### 7. Resize Text (WCAG 1.4.4 — AA)

All font sizes use `rem` or Tailwind's relative units. The layout does not break at 200% zoom.

### 8. Images of Text (WCAG 1.4.5 — AA)

No images of text are used anywhere in the application.

### 9. Focus Visible (WCAG 2.4.7 — AA, 2.4.11 — AA)

All focusable elements have a visible focus indicator:

```css
:focus-visible {
  outline: 3px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

`focus-visible` (not `focus`) is used so mouse users do not see the ring on click, while keyboard users always do. The 3px outline width meets WCAG 2.4.11's requirement for a visible focus indicator with sufficient area.

### 10. Keyboard Accessible (WCAG 2.1.1 — A)

All interactive elements are keyboard-reachable:
- Navigation links and buttons — native focusability
- Drag handles — `KeyboardSensor` from dnd-kit
- Select section / remove section — `<button>` elements
- Role switcher dropdown — keyboard-focusable `<button>` items
- Studio toolbar — all controls are native `<button>` elements

### 11. Logical Heading Hierarchy (WCAG 1.3.1 — A)

| Level | Used for |
|---|---|
| `h1` | Page title (one per page) |
| `h2` | Section headings (hero, feature grid, CTA) |
| `h3` | Feature items within a feature grid |

The studio sidebar uses `<p>` with visual styling rather than heading elements, as they are navigation labels, not content headings.

### 12. Labels (WCAG 1.3.1, 3.3.2 — A)

Every form input has an associated label:
```tsx
<Label htmlFor="hero-heading">Heading</Label>
<Input id="hero-heading" ... />
```

The `htmlFor`/`id` pair creates a programmatic association that screen readers announce when the input is focused.

### 13. Language of Page (WCAG 3.1.1 — A)

```html
<html lang="en">
```

### 14. Reduced Motion (WCAG 2.3.3 — AAA)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

All CSS transitions and animations are disabled when the user's OS preference is set to reduce motion.

### 15. Status Messages (WCAG 4.1.3 — AA)

Live regions announce dynamic changes without moving focus:
```tsx
<span aria-live="polite">Unsaved changes</span>
<button aria-busy={isPublishing}>Publishing…</button>
```

Toast notifications use Radix UI's `ToastProvider` which handles live region announcements correctly.

### 16. Error Identification (WCAG 3.3.1 — A)

Schema validation errors are displayed with `role="alert"` so they are announced by screen readers immediately.

### 17. Parsing (WCAG 4.1.1 — A)

- No duplicate IDs (IDs are generated via `crypto.randomUUID`)
- Proper element nesting (no `<div>` inside `<p>`, no `<button>` inside `<a>`)
- Landmark regions do not overlap

---

## Automated Testing

### Axe in CI

`@axe-core/playwright` runs a full axe scan on four pages in every CI run:
- `/` (home)
- `/preview/demo`
- `/auth`
- `/studio/demo` (authenticated as publisher)

The test throws an error for any violation with `impact === 'critical'` or `impact === 'serious'`, which fails the CI build.

```typescript
const criticalViolations = results.violations.filter(
  (v) => v.impact === 'critical' || v.impact === 'serious'
)
if (criticalViolations.length > 0) throw new Error(...)
```

### Artefact

Every CI run produces `test-results/a11y-report.json` containing the full axe results for all scanned pages. It is uploaded as a GitHub Actions artefact and retained for 30 days.

---

## Limitations and Known Trade-offs

| Area | Status | Note |
|---|---|---|
| Colour contrast on muted text | AA (not AAA) | Muted foreground is ~4.6:1; AAA requires 7:1. Increasing it would conflict with the design's visual hierarchy. |
| Drag and drop on mobile | Not tested | dnd-kit has touch support; not verified in this submission. |
| Screen reader announcement order in the studio | Manually verified only | Automated testing does not cover announcement order. |
