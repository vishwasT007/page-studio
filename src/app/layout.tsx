import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ReduxProvider } from '@/store/provider'
import { Header } from '@/components/layout/Header'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Page Studio',
    default: 'Page Studio',
  },
  description: 'Schema-driven landing page builder with versioned publishing.',
  icons: {
    icon: '/icon.svg',
  },
}

type Props = { children: React.ReactNode }

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        {/* WCAG 2.4.1 — bypass blocks */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <ReduxProvider>
          <Header />
          {children}
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  )
}
