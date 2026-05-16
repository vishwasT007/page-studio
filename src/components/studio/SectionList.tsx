'use client'

import { GripVertical, Trash2 } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Section } from '@/types'
import { sectionRegistry, isKnownSectionType } from '@/lib/registry/sectionRegistry'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { removeSection, reorderSections } from '@/store/slices/draftPageSlice'
import { selectSection, selectSelectedSectionId } from '@/store/slices/uiSlice'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

type SortableSectionRowProps = {
  section: Section
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
}

function SortableSectionRow({ section, isSelected, onSelect, onRemove }: SortableSectionRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })

  const label = isKnownSectionType(section.type)
    ? sectionRegistry[section.type].label
    : section.type

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 rounded-md border bg-card p-2 text-sm transition-shadow',
        isDragging && 'opacity-50 shadow-lg',
        isSelected && 'border-primary bg-primary/5'
      )}
    >
      {/* Drag handle */}
      <button
        className="cursor-grab touch-none text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 active:cursor-grabbing"
        aria-label={`Drag to reorder ${label} section`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Section label — clicking selects for editing */}
      <button
        className="flex-1 text-left font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        onClick={onSelect}
        aria-pressed={isSelected}
        aria-label={`Edit ${label} section`}
      >
        {label}
      </button>

      {/* Remove */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
        aria-label={`Remove ${label} section`}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
    </div>
  )
}

type Props = { sections: Section[] }

export function SectionList({ sections }: Props) {
  const dispatch = useAppDispatch()
  const selectedId = useAppSelector(selectSelectedSectionId)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const fromIndex = sections.findIndex((s) => s.id === active.id)
    const toIndex = sections.findIndex((s) => s.id === over.id)
    if (fromIndex !== -1 && toIndex !== -1) {
      dispatch(reorderSections({ fromIndex, toIndex }))
    }
  }

  if (sections.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No sections yet. Add one below.
      </p>
    )
  }

  return (
    <DndContext id="section-list" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <ol className="space-y-1.5" aria-label="Page sections">
          {sections.map((section) => (
            <li key={section.id}>
              <SortableSectionRow
                section={section}
                isSelected={section.id === selectedId}
                onSelect={() =>
                  dispatch(selectSection(section.id === selectedId ? null : section.id))
                }
                onRemove={() => {
                  if (selectedId === section.id) dispatch(selectSection(null))
                  dispatch(removeSection(section.id))
                }}
              />
            </li>
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  )
}
