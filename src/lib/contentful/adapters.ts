import type { Entry, EntrySkeletonType } from 'contentful'
import type { Page, Section, SectionType } from '@/types'

// Maps Contentful content type IDs to our internal SectionType.
// Isolated here so the mapping only needs to change in one place.
const CONTENT_TYPE_TO_SECTION_TYPE: Record<string, SectionType> = {
  heroSection: 'hero',
  featureGridSection: 'featureGrid',
  testimonialSection: 'testimonial',
  ctaSection: 'cta',
}

function adaptSection(entry: Entry<EntrySkeletonType>): Section | null {
  const contentTypeId = entry.sys.contentType.sys.id
  const sectionType = CONTENT_TYPE_TO_SECTION_TYPE[contentTypeId]

  // Unknown section types pass through as-is; UnsupportedSection renders them gracefully.
  if (!sectionType) {
    console.warn(`[contentful] Unknown content type: ${contentTypeId}`)
    return null
  }

  // Strip the sectionId field — it's a Contentful-specific identifier we don't expose.
  const { sectionId: _id, ...rest } = entry.fields as Record<string, unknown>
  const id = (_id as string | undefined) ?? entry.sys.id

  return { id, type: sectionType, props: rest }
}

export function adaptPage(entry: Entry<EntrySkeletonType>): Page {
  const fields = entry.fields as Record<string, unknown>
  const rawSections = (fields.sections as Entry<EntrySkeletonType>[] | undefined) ?? []

  const sections = rawSections
    .map(adaptSection)
    .filter((s): s is Section => s !== null)

  return {
    pageId: (fields.pageId as string | undefined) ?? entry.sys.id,
    slug: fields.slug as string,
    title: fields.title as string,
    sections,
  }
}
