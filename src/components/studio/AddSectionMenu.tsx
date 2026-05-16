'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sectionRegistry } from '@/lib/registry/sectionRegistry'
import type { SectionType } from '@/types'
import { useAppDispatch } from '@/store/hooks'
import { addSection } from '@/store/slices/draftPageSlice'

export function AddSectionMenu() {
  const dispatch = useAppDispatch()

  const sectionTypes = Object.entries(sectionRegistry) as [SectionType, (typeof sectionRegistry)[SectionType]][]

  return (
    <div className="space-y-1">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Add section
      </p>

      {sectionTypes.map(([type, entry]) => (
        <Button
          key={type}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sm"
          onClick={() => dispatch(addSection(type))}
          aria-label={`Add ${entry.label} section`}
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
          {entry.label}
        </Button>
      ))}
    </div>
  )
}
