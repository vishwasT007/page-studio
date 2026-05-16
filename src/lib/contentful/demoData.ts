import type { Page } from '@/types'

// Used when Contentful credentials are absent (local dev, CI, demo).
// Mirrors a realistic page structure so the full rendering pipeline can be exercised.
export const DEMO_PAGE: Page = {
  pageId: 'demo-page-1',
  slug: 'demo',
  title: 'Demo Landing Page',
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      props: {
        heading: 'Build pages at the speed of thought',
        subheading:
          'Page Studio gives your team a schema-driven editor backed by Contentful, Redux, and versioned publishing.',
        ctaLabel: 'Get started',
        ctaUrl: '#cta',
      },
    },
    {
      id: 'features-1',
      type: 'featureGrid',
      props: {
        heading: 'Everything you need',
        subheading: 'Purpose-built for editorial teams and engineering alike.',
        features: [
          {
            id: 'f1',
            title: 'Schema-driven',
            description: 'Every section is validated with Zod before it touches the DOM.',
            icon: '🧩',
          },
          {
            id: 'f2',
            title: 'Versioned releases',
            description: 'Publish produces an immutable, SemVer-tagged snapshot of your page.',
            icon: '📦',
          },
          {
            id: 'f3',
            title: 'Accessible by default',
            description: 'WCAG 2.2 AAA-oriented: semantic HTML, keyboard nav, visible focus.',
            icon: '♿',
          },
        ],
      },
    },
    {
      id: 'testimonial-1',
      type: 'testimonial',
      props: {
        quote:
          'Page Studio cut our release cycle in half. The versioned publishing gives us total confidence.',
        author: 'Jane Doe',
        role: 'Head of Product',
        company: 'Acme Corp',
      },
    },
    {
      id: 'cta-1',
      type: 'cta',
      props: {
        heading: 'Ready to ship your first page?',
        label: 'Open the studio',
        url: '/studio/demo',
        subtext: 'No credit card required.',
      },
    },
  ],
}
