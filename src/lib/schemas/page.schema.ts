import { z } from 'zod'

// Raw section — used when we don't yet know the type.
// The registry resolves the component and validates props separately.
export const RawSectionSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  props: z.record(z.unknown()),
})

export const PageSchema = z.object({
  pageId: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  sections: z.array(RawSectionSchema),
})

export type RawSection = z.infer<typeof RawSectionSchema>
export type ValidatedPage = z.infer<typeof PageSchema>
