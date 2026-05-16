import Image from 'next/image'
import type { TestimonialProps } from '@/types'

type Props = { props: TestimonialProps }

export function TestimonialSection({ props }: Props) {
  const { quote, author, role, company, avatarUrl } = props

  const attribution = [role, company].filter(Boolean).join(', ')

  return (
    <section className="bg-slate-50 px-6 py-20" aria-label="Testimonial">
      <div className="mx-auto max-w-2xl text-center">
        <figure>
          <blockquote className="text-xl font-medium italic leading-relaxed text-slate-800 sm:text-2xl">
            <p>&ldquo;{quote}&rdquo;</p>
          </blockquote>

          <figcaption className="mt-8 flex items-center justify-center gap-4">
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt={`Photo of ${author}`}
                width={48}
                height={48}
                className="rounded-full object-cover ring-2 ring-slate-200"
              />
            )}
            <div className="text-left">
              <p className="font-semibold text-slate-900">{author}</p>
              {attribution && (
                <p className="text-sm text-slate-500">{attribution}</p>
              )}
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
