// Core domain model — kept deliberately narrow. Add fields here when the schema evolves.

export type SectionType = 'hero' | 'featureGrid' | 'testimonial' | 'cta'

export type HeroProps = {
  heading: string
  subheading?: string
  ctaLabel?: string
  ctaUrl?: string
  backgroundImageUrl?: string
}

export type Feature = {
  id: string
  title: string
  description: string
  icon?: string
}

export type FeatureGridProps = {
  heading: string
  subheading?: string
  features: Feature[]
}

export type TestimonialProps = {
  quote: string
  author: string
  role?: string
  company?: string
  avatarUrl?: string
}

export type CTAProps = {
  heading: string
  label: string
  url: string
  subtext?: string
}

// Section props mapped by type — used to keep the registry type-safe
export type SectionPropsMap = {
  hero: HeroProps
  featureGrid: FeatureGridProps
  testimonial: TestimonialProps
  cta: CTAProps
}

export type Section = {
  id: string
  // External CMS data may include section types this build does not know yet.
  type: string
  props: Record<string, unknown>
}

export type Page = {
  pageId: string
  slug: string
  title: string
  sections: Section[]
}

// RBAC

export type Role = 'viewer' | 'editor' | 'publisher'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: Role
}

// Publish / versioning

export type ChangeType = 'none' | 'patch' | 'minor' | 'major'

export type DiffResult = {
  changeType: ChangeType
  changes: string[]
}

export type Release = {
  version: string
  slug: string
  pageId: string
  publishedAt: string
  changelog: string[]
  checksum: string
  snapshot: Page
}
