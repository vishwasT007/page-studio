type Props = { type: string }

// Rendered when the registry has no entry for a section type.
// Visible only in development to aid debugging; gracefully silent in production.
export function UnsupportedSection({ type }: Props) {
  if (process.env.NODE_ENV === 'production') return null

  return (
    <section
      role="region"
      aria-label={`Unsupported section: ${type}`}
      className="border border-dashed border-amber-400 bg-amber-50 px-6 py-8 text-center"
    >
      <p className="text-sm font-medium text-amber-700">
        Unknown section type:{' '}
        <code className="rounded bg-amber-100 px-1 font-mono">{type}</code>
      </p>
      <p className="mt-1 text-xs text-amber-600">
        Register this type in{' '}
        <code className="font-mono">src/lib/registry/sectionRegistry.ts</code> to render it.
      </p>
    </section>
  )
}
