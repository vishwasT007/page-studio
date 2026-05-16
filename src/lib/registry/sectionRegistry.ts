import type { ComponentType } from 'react'
import type { ZodSchema } from 'zod'
import type { SectionType, SectionPropsMap } from '@/types'
import {
  HeroPropsSchema,
  FeatureGridPropsSchema,
  TestimonialPropsSchema,
  CTAPropsSchema,
} from '@/lib/schemas/section.schema'

// Each registry entry owns its schema, human label, and defaults.
// The React component map lives in PageRenderer to keep this file server-safe.
// Adding a new section type = one entry here + one schema + one component. Nothing else changes.
type RegistryEntry<T> = {
  schema: ZodSchema<T>
  label: string
  defaultProps: T
}

type SectionRegistry = {
  [K in SectionType]: RegistryEntry<SectionPropsMap[K]>
}

export const sectionRegistry: SectionRegistry = {
  hero: {
    schema: HeroPropsSchema,
    label: 'Hero',
    defaultProps: {
      heading: 'Welcome to our product',
      subheading: 'The fastest way to build something great.',
      ctaLabel: 'Get started',
      ctaUrl: '#',
    },
  },
  featureGrid: {
    schema: FeatureGridPropsSchema,
    label: 'Feature Grid',
    defaultProps: {
      heading: 'Why choose us',
      features: [
        { id: 'f1', title: 'Fast', description: 'Built for speed from the ground up.' },
        { id: 'f2', title: 'Reliable', description: '99.9% uptime, no excuses.' },
      ],
    },
  },
  testimonial: {
    schema: TestimonialPropsSchema,
    label: 'Testimonial',
    defaultProps: {
      quote: 'This product changed how our team works.',
      author: 'Jane Doe',
      role: 'CTO',
      company: 'Acme Inc.',
    },
  },
  cta: {
    schema: CTAPropsSchema,
    label: 'Call to Action',
    defaultProps: {
      heading: 'Ready to get started?',
      label: 'Sign up free',
      url: '#',
    },
  },
}

export type KnownSectionType = keyof typeof sectionRegistry

export function isKnownSectionType(type: string): type is KnownSectionType {
  return type in sectionRegistry
}

// Validate a section's props against its schema. Returns parsed data or null.
export function validateSectionProps<K extends SectionType>(
  type: K,
  props: Record<string, unknown>
): SectionPropsMap[K] | null {
  const entry = sectionRegistry[type]
  const result = entry.schema.safeParse(props)
  return result.success ? (result.data as SectionPropsMap[K]) : null
}

// Dynamic component map — imported separately to keep server-side registry clean
export type SectionComponentMap = {
  [K in SectionType]: ComponentType<{ props: SectionPropsMap[K] }>
}
