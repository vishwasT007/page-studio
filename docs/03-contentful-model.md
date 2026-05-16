# Contentful Model + Adapter

## Content Model

The Contentful space contains one top-level content type and four section content types.

### `landingPage`

| Field | Type | Required | Notes |
|---|---|---|---|
| `pageId` | Short text | Yes | Stable identifier (does not change when slug changes) |
| `slug` | Short text | Yes | URL-safe, unique — used to look up pages |
| `title` | Short text | Yes | Display name, shown in the studio header |
| `sections` | References (many) | Yes | Ordered array of section entries |

### `heroSection`

| Field | Type | Required |
|---|---|---|
| `sectionId` | Short text | Yes |
| `heading` | Short text | Yes |
| `subheading` | Short text | No |
| `ctaLabel` | Short text | No |
| `ctaUrl` | Short text | No |
| `backgroundImageUrl` | Short text | No |

### `featureGridSection`

| Field | Type | Required |
|---|---|---|
| `sectionId` | Short text | Yes |
| `heading` | Short text | Yes |
| `subheading` | Short text | No |
| `features` | JSON object | Yes | Array of `{ id, title, description, icon? }` |

### `testimonialSection`

| Field | Type | Required |
|---|---|---|
| `sectionId` | Short text | Yes |
| `quote` | Long text | Yes |
| `author` | Short text | Yes |
| `role` | Short text | No |
| `company` | Short text | No |
| `avatarUrl` | Short text | No |

### `ctaSection`

| Field | Type | Required |
|---|---|---|
| `sectionId` | Short text | Yes |
| `heading` | Short text | Yes |
| `label` | Short text | Yes |
| `url` | Short text | Yes |
| `subtext` | Short text | No |

---

## Setting Up the Content Model

In your Contentful space:

1. Go to **Content model → Add content type**
2. Create each type above with the exact field IDs shown (case-sensitive)
3. On `landingPage`, make `sections` a **reference field** (many entries), with **validation** accepting only the four section content types
4. Publish the content types
5. Create a sample `landingPage` entry with slug `home` and attach a few section entries

---

## The Adapter Pattern

### Why an adapter?

Contentful's raw response looks like this:

```typescript
// What Contentful returns
{
  sys: { id: 'abc123', contentType: { sys: { id: 'heroSection' } } },
  fields: {
    sectionId: 'hero-1',
    heading: 'Hello World',
    ctaLabel: 'Get started',
  }
}
```

If React components consumed this directly, they would:
- Know about Contentful's `sys` structure
- Be impossible to test without a real Contentful connection
- Break if Contentful changes their response format

The adapter converts this into our internal `Section` type:

```typescript
// What our components receive
{
  id: 'hero-1',
  type: 'hero',
  props: {
    heading: 'Hello World',
    ctaLabel: 'Get started',
  }
}
```

### How the adapter works

**File:** `src/lib/contentful/adapters.ts`

```
Content type ID mapping:
  'heroSection'        → 'hero'
  'featureGridSection' → 'featureGrid'
  'testimonialSection' → 'testimonial'
  'ctaSection'         → 'cta'
```

Steps for each section entry:
1. Read `entry.sys.contentType.sys.id` to determine the section type
2. Look it up in `CONTENT_TYPE_TO_SECTION_TYPE` map
3. If unknown → return `null` (filtered out, logged as warning)
4. Strip `sectionId` from `entry.fields` (Contentful-specific, not domain data)
5. Use `entry.sys.id` as fallback ID if `sectionId` is absent
6. Return `{ id, type, props: remaining fields }`

For the page:
1. Map each reference in `fields.sections` through `adaptSection`
2. Filter out any `null` results (unknown content types)
3. Return `{ pageId, slug, title, sections }`

### No leakage guarantee

After the adapter runs, no code path outside `src/lib/contentful/` ever sees:
- `entry.sys.*`
- `entry.fields.*`
- `EntrySkeletonType` or any Contentful SDK type

The type system enforces this — all public functions in `queries.ts` return `Page | null`, not Contentful types.

---

## Preview vs Published Mode

The only thing that changes between preview and published mode is which Contentful client is instantiated:

```typescript
// contentfulClient.ts
export function getContentfulClient(mode: 'published' | 'preview') {
  if (mode === 'preview') {
    return createClient({
      host: 'preview.contentful.com',    // ← different host
      accessToken: CONTENTFUL_PREVIEW_ACCESS_TOKEN,
    })
  }
  return createClient({
    accessToken: CONTENTFUL_ACCESS_TOKEN, // delivery API
  })
}
```

- **Published mode:** only returns content that has been explicitly published in Contentful
- **Preview mode:** returns the latest saved draft, even if unpublished

The caller switches modes by passing an argument to `fetchPageBySlug({ slug, preview: true })`. Nothing else in the codebase knows about this distinction.

In the studio, pages are always loaded in preview mode so editors see their latest Contentful drafts. The public `/preview/[slug]` route can be toggled via `?preview=true` query param.

---

## Error Handling

| Scenario | What happens |
|---|---|
| Contentful is not configured | Falls back to built-in demo data for `demo` slug |
| Contentful fetch throws | Caught, error logged, falls back to demo data |
| Unknown content type returned | Filtered out, logged as warning, page renders without that section |
| Invalid field values | Zod catches at validation time; section renders error state, page does not crash |
| Missing required field | Zod `safeParse` fails; per-section error state shown |

The app never shows a blank screen or an unhandled exception because of bad Contentful data.

---

## Demo Data

`src/lib/contentful/demoData.ts` exports a `DEMO_PAGE` that mirrors what a real Contentful response would look like after being adapted. It is used when:

- Contentful credentials are absent from `.env.local`
- Contentful is configured but the `demo` slug does not exist in the space

This ensures the application is fully usable for code review and demos without requiring a configured Contentful account.
