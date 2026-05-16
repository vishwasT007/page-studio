'use client'

import type { ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectDraftPage, updateSectionProps } from '@/store/slices/draftPageSlice'
import { selectSelectedSectionId } from '@/store/slices/uiSlice'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Section } from '@/types'

// Renders a minimal prop editor for the currently selected section.
// Only fields that are directly editable by editors are surfaced here.
export function SectionEditor() {
  const dispatch = useAppDispatch()
  const page = useAppSelector(selectDraftPage)
  const selectedId = useAppSelector(selectSelectedSectionId)

  if (!selectedId || !page) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Select a section to edit its properties.
      </p>
    )
  }

  const section = page.sections.find((s) => s.id === selectedId)
  if (!section) return null

  function updateProp(key: string, value: unknown) {
    if (!section) return
    dispatch(
      updateSectionProps({
        sectionId: section.id,
        props: { ...section.props, [key]: value },
      })
    )
  }

  return (
    <div className="space-y-6" aria-label={`Editing ${section.type} section`}>
      <h2 className="text-sm font-semibold capitalize text-foreground">
        {section.type} — Properties
      </h2>

      {section.type === 'hero' && <HeroEditor section={section} onUpdate={updateProp} />}
      {section.type === 'cta' && <CTAEditor section={section} onUpdate={updateProp} />}
      {section.type === 'featureGrid' && <FeatureGridEditor section={section} onUpdate={updateProp} />}
      {section.type === 'testimonial' && <TestimonialEditor section={section} onUpdate={updateProp} />}
    </div>
  )
}

type EditorProps = {
  section: Section
  onUpdate: (key: string, value: unknown) => void
}

function Field({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

function HeroEditor({ section, onUpdate }: EditorProps) {
  const props = section.props as Record<string, string>
  return (
    <>
      <Field id="hero-heading" label="Heading">
        <Input
          id="hero-heading"
          value={props.heading ?? ''}
          onChange={(e) => onUpdate('heading', e.target.value)}
          placeholder="Enter heading"
        />
      </Field>
      <Field id="hero-subheading" label="Subheading">
        <Textarea
          id="hero-subheading"
          value={props.subheading ?? ''}
          onChange={(e) => onUpdate('subheading', e.target.value)}
          placeholder="Enter subheading"
          rows={2}
        />
      </Field>
      <Field id="hero-cta-label" label="CTA Label">
        <Input
          id="hero-cta-label"
          value={props.ctaLabel ?? ''}
          onChange={(e) => onUpdate('ctaLabel', e.target.value)}
          placeholder="e.g. Get started"
        />
      </Field>
      <Field id="hero-cta-url" label="CTA URL">
        <Input
          id="hero-cta-url"
          type="url"
          value={props.ctaUrl ?? ''}
          onChange={(e) => onUpdate('ctaUrl', e.target.value)}
          placeholder="https://..."
        />
      </Field>
    </>
  )
}

function CTAEditor({ section, onUpdate }: EditorProps) {
  const props = section.props as Record<string, string>
  return (
    <>
      <Field id="cta-heading" label="Heading">
        <Input
          id="cta-heading"
          value={props.heading ?? ''}
          onChange={(e) => onUpdate('heading', e.target.value)}
          placeholder="Enter heading"
        />
      </Field>
      <Field id="cta-label" label="Button Label">
        <Input
          id="cta-label"
          value={props.label ?? ''}
          onChange={(e) => onUpdate('label', e.target.value)}
          placeholder="e.g. Sign up free"
        />
      </Field>
      <Field id="cta-url" label="Button URL">
        <Input
          id="cta-url"
          type="url"
          value={props.url ?? ''}
          onChange={(e) => onUpdate('url', e.target.value)}
          placeholder="https://..."
        />
      </Field>
      <Field id="cta-subtext" label="Subtext">
        <Input
          id="cta-subtext"
          value={props.subtext ?? ''}
          onChange={(e) => onUpdate('subtext', e.target.value)}
          placeholder="Optional supporting text"
        />
      </Field>
    </>
  )
}

function FeatureGridEditor({ section, onUpdate }: EditorProps) {
  const props = section.props as Record<string, string>
  return (
    <>
      <Field id="fg-heading" label="Heading">
        <Input
          id="fg-heading"
          value={props.heading ?? ''}
          onChange={(e) => onUpdate('heading', e.target.value)}
          placeholder="Enter heading"
        />
      </Field>
      <Field id="fg-subheading" label="Subheading">
        <Input
          id="fg-subheading"
          value={props.subheading ?? ''}
          onChange={(e) => onUpdate('subheading', e.target.value)}
          placeholder="Optional subheading"
        />
      </Field>
    </>
  )
}

function TestimonialEditor({ section, onUpdate }: EditorProps) {
  const props = section.props as Record<string, string>
  return (
    <>
      <Field id="t-quote" label="Quote">
        <Textarea
          id="t-quote"
          value={props.quote ?? ''}
          onChange={(e) => onUpdate('quote', e.target.value)}
          placeholder="Enter quote"
          rows={3}
        />
      </Field>
      <Field id="t-author" label="Author">
        <Input
          id="t-author"
          value={props.author ?? ''}
          onChange={(e) => onUpdate('author', e.target.value)}
          placeholder="Author name"
        />
      </Field>
      <Field id="t-role" label="Role">
        <Input
          id="t-role"
          value={props.role ?? ''}
          onChange={(e) => onUpdate('role', e.target.value)}
          placeholder="e.g. CTO"
        />
      </Field>
      <Field id="t-company" label="Company">
        <Input
          id="t-company"
          value={props.company ?? ''}
          onChange={(e) => onUpdate('company', e.target.value)}
          placeholder="Company name"
        />
      </Field>
    </>
  )
}
