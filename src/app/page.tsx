import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Eye, Edit3, Upload } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Home' }

const FEATURES = [
  {
    icon: Eye,
    title: 'Preview',
    description: 'Render live pages from Contentful with full schema validation.',
    href: '/preview/demo',
    cta: 'View demo page',
  },
  {
    icon: Edit3,
    title: 'Studio',
    description: 'Edit page sections, reorder content, and preview changes instantly.',
    href: '/studio/demo',
    cta: 'Open studio',
  },
  {
    icon: Upload,
    title: 'Publish',
    description: 'Freeze drafts into immutable, semantically versioned releases.',
    href: '/studio/demo',
    cta: 'Try publishing',
  },
]

export default function HomePage() {
  return (
    <div className="container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Page Studio</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          A schema-driven landing page builder. Load from Contentful, edit in the studio,
          publish as versioned releases.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/preview/demo" className={buttonVariants()}>
            Open preview <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/auth" className={buttonVariants({ variant: 'outline' })}>
            Sign in
          </Link>
        </div>
      </div>

      <ul className="mx-auto mt-20 grid max-w-4xl gap-6 sm:grid-cols-3" role="list">
        {FEATURES.map(({ icon: Icon, title, description, href, cta }) => (
          <li key={title} className="rounded-xl border bg-card p-6 shadow-sm">
            <Icon className="mb-4 h-8 w-8 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <Link
              href={href}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
