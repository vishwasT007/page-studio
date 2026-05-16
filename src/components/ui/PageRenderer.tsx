import type { Page, SectionType } from '@/types'
import { isKnownSectionType, validateSectionProps } from '@/lib/registry/sectionRegistry'
import { HeroSection } from '@/components/sections/HeroSection'
import { FeatureGridSection } from '@/components/sections/FeatureGridSection'
import { TestimonialSection } from '@/components/sections/TestimonialSection'
import { CTASection } from '@/components/sections/CTASection'
import { UnsupportedSection } from '@/components/sections/UnsupportedSection'
import { ErrorBoundary } from './ErrorBoundary'

// Component map lives here (client-facing) rather than the registry (server-safe).
// This lets sectionRegistry.ts be imported in server components without pulling in React components.
const SECTION_COMPONENTS = {
  hero: HeroSection,
  featureGrid: FeatureGridSection,
  testimonial: TestimonialSection,
  cta: CTASection,
} as const

type Props = { page: Page }

export function PageRenderer({ page }: Props) {
  return (
    <main id="main-content" aria-label={page.title}>
      {page.sections.map((section) => {
        if (!isKnownSectionType(section.type)) {
          return <UnsupportedSection key={section.id} type={section.type} />
        }

        const type = section.type as SectionType
        const validatedProps = validateSectionProps(type, section.props)

        if (!validatedProps) {
          return (
            <div
              key={section.id}
              role="alert"
              className="border border-dashed border-red-300 bg-red-50 px-6 py-6 text-center text-sm text-red-700"
            >
              Section <code className="font-mono">{section.id}</code> has invalid props and cannot
              be rendered.
            </div>
          )
        }

        const Component = SECTION_COMPONENTS[type]

        return (
          <ErrorBoundary key={section.id}>
            {/* Props are cast here because TypeScript can't narrow the generic through the map */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Component props={validatedProps as any} />
          </ErrorBoundary>
        )
      })}
    </main>
  )
}
