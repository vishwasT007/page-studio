import type { FeatureGridProps } from '@/types'

type Props = { props: FeatureGridProps }

export function FeatureGridSection({ props }: Props) {
  const { heading, subheading, features } = props

  return (
    <section className="bg-white px-6 py-20" aria-label="Features">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {heading}
          </h2>
          {subheading && (
            <p className="mt-4 text-lg text-slate-600">{subheading}</p>
          )}
        </header>

        <ul
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Feature list"
        >
          {features.map((feature) => (
            <li
              key={feature.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-6 shadow-sm"
            >
              {feature.icon && (
                <span className="mb-3 block text-2xl" aria-hidden="true">
                  {feature.icon}
                </span>
              )}
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-slate-600">{feature.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
