import type { HeroProps } from '@/types'

type Props = { props: HeroProps }

export function HeroSection({ props }: Props) {
  const { heading, subheading, ctaLabel, ctaUrl, backgroundImageUrl } = props

  return (
    <section
      className="relative flex min-h-[480px] items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 px-6 py-24 text-white"
      aria-label="Hero"
      style={
        backgroundImageUrl
          ? { backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover' }
          : undefined
      }
    >
      {backgroundImageUrl && (
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      )}

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          {heading}
        </h1>

        {subheading && (
          <p className="mt-6 text-lg leading-relaxed text-slate-200 sm:text-xl">
            {subheading}
          </p>
        )}

        {ctaLabel && ctaUrl && (
          <div className="mt-10">
            <a
              href={ctaUrl}
              className="inline-flex items-center rounded-lg bg-white px-8 py-3 text-base font-semibold text-slate-900 ring-2 ring-transparent transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              {ctaLabel}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
