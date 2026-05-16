import { describe, it, expect } from 'vitest'
import { PageSchema } from '@/lib/schemas/page.schema'
import {
  HeroPropsSchema,
  CTAPropsSchema,
  FeatureGridPropsSchema,
  TestimonialPropsSchema,
} from '@/lib/schemas/section.schema'

describe('PageSchema', () => {
  it('accepts a valid page', () => {
    const result = PageSchema.safeParse({
      pageId: 'p1',
      slug: 'home',
      title: 'Home',
      sections: [{ id: 's1', type: 'hero', props: { heading: 'Hello' } }],
    })
    expect(result.success).toBe(true)
  })

  it('rejects a page missing required fields', () => {
    const result = PageSchema.safeParse({ slug: 'home' })
    expect(result.success).toBe(false)
  })

  it('accepts a page with an unknown section type (validated separately)', () => {
    const result = PageSchema.safeParse({
      pageId: 'p1',
      slug: 'home',
      title: 'Home',
      sections: [{ id: 's1', type: 'unknownType', props: {} }],
    })
    // PageSchema accepts any string type — registry handles unknown types
    expect(result.success).toBe(true)
  })

  it('rejects a page with an empty slug', () => {
    const result = PageSchema.safeParse({
      pageId: 'p1',
      slug: '',
      title: 'Home',
      sections: [],
    })
    expect(result.success).toBe(false)
  })
})

describe('HeroPropsSchema', () => {
  it('accepts valid hero props', () => {
    const result = HeroPropsSchema.safeParse({
      heading: 'Hello World',
      ctaLabel: 'Get started',
      ctaUrl: 'https://example.com',
    })
    expect(result.success).toBe(true)
  })

  it('accepts hero props with only a heading', () => {
    const result = HeroPropsSchema.safeParse({ heading: 'Minimal hero' })
    expect(result.success).toBe(true)
  })

  it('rejects hero props missing the required heading', () => {
    const result = HeroPropsSchema.safeParse({ ctaLabel: 'Click me' })
    expect(result.success).toBe(false)
  })

  it('rejects a heading that is an empty string', () => {
    const result = HeroPropsSchema.safeParse({ heading: '' })
    expect(result.success).toBe(false)
  })
})

describe('CTAPropsSchema', () => {
  it('accepts valid CTA props', () => {
    const result = CTAPropsSchema.safeParse({
      heading: 'Start today',
      label: 'Sign up',
      url: 'https://example.com',
    })
    expect(result.success).toBe(true)
  })

  it('rejects CTA props missing url', () => {
    const result = CTAPropsSchema.safeParse({ heading: 'Start', label: 'Go' })
    expect(result.success).toBe(false)
  })
})

describe('FeatureGridPropsSchema', () => {
  it('accepts valid feature grid props', () => {
    const result = FeatureGridPropsSchema.safeParse({
      heading: 'Features',
      features: [{ id: 'f1', title: 'Fast', description: 'Very fast.' }],
    })
    expect(result.success).toBe(true)
  })

  it('rejects a feature grid with an empty features array', () => {
    const result = FeatureGridPropsSchema.safeParse({ heading: 'Features', features: [] })
    expect(result.success).toBe(false)
  })
})

describe('TestimonialPropsSchema', () => {
  it('accepts valid testimonial props', () => {
    const result = TestimonialPropsSchema.safeParse({
      quote: 'Amazing product.',
      author: 'Alice',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a testimonial without an author', () => {
    const result = TestimonialPropsSchema.safeParse({ quote: 'Great!' })
    expect(result.success).toBe(false)
  })
})
