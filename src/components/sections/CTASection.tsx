import type { CTAProps } from '@/types'

type Props = { props: CTAProps }

export function CTASection({ props }: Props) {
  const { heading, label, url, subtext } = props

  return (
    <section
      className="bg-slate-900 px-6 py-20 text-center text-white"
      aria-label="Call to action"
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h2>

        {subtext && (
          <p className="mt-4 text-lg text-slate-300">{subtext}</p>
        )}

        <div className="mt-10">
          <a
            href={url}
            className="inline-flex items-center rounded-lg bg-white px-8 py-3 text-base font-semibold text-slate-900 ring-2 ring-transparent transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            data-testid="cta-button"
          >
            {label}
          </a>
        </div>
      </div>
    </section>
  )
}
