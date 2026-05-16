import { z } from 'zod'

export const HeroPropsSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  subheading: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  backgroundImageUrl: z.string().url().optional(),
})

export const FeatureSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().optional(),
})

export const FeatureGridPropsSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  subheading: z.string().optional(),
  features: z.array(FeatureSchema).min(1),
})

export const TestimonialPropsSchema = z.object({
  quote: z.string().min(1, 'Quote is required'),
  author: z.string().min(1, 'Author is required'),
  role: z.string().optional(),
  company: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

export const CTAPropsSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  label: z.string().min(1, 'Button label is required'),
  url: z.string().min(1, 'URL is required'),
  subtext: z.string().optional(),
})

// Inferred types from schemas — single source of truth
export type HeroPropsInput = z.input<typeof HeroPropsSchema>
export type FeatureGridPropsInput = z.input<typeof FeatureGridPropsSchema>
export type TestimonialPropsInput = z.input<typeof TestimonialPropsSchema>
export type CTAPropsInput = z.input<typeof CTAPropsSchema>
