'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Eye, PanelLeft } from 'lucide-react'
import type { AuthUser, Page } from '@/types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loadPage, selectDraftPage } from '@/store/slices/draftPageSlice'
import { toggleSidebar, selectSidebarOpen, selectPreviewMode, setPreviewMode } from '@/store/slices/uiSlice'
import { useDraftPersistence } from '@/hooks/useDraftPersistence'
import { SectionList } from '@/components/studio/SectionList'
import { SectionEditor } from '@/components/studio/SectionEditor'
import { AddSectionMenu } from '@/components/studio/AddSectionMenu'
import { PublishButton } from '@/components/studio/PublishButton'
import { PageRenderer } from '@/components/ui/PageRenderer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { hasRole } from '@/lib/auth/roles'
import { cn } from '@/lib/utils/cn'

type Props = { initialPage: Page; user: AuthUser }

export function StudioClient({ initialPage, user }: Props) {
  const dispatch = useAppDispatch()
  const draft = useAppSelector(selectDraftPage)
  const sidebarOpen = useAppSelector(selectSidebarOpen)
  const previewMode = useAppSelector(selectPreviewMode)

  // Load the initial page from Contentful into the draft slot on first render
  useEffect(() => {
    dispatch(loadPage(initialPage))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPage.pageId])

  // Persist draft across reloads
  useDraftPersistence(initialPage.slug)

  const canEdit = hasRole(user.role, 'editor')
  const canPublish = hasRole(user.role, 'publisher')
  const page = draft ?? initialPage

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside
          className="flex w-72 shrink-0 flex-col border-r bg-card"
          aria-label="Studio sidebar"
        >
          {/* Page meta */}
          <div className="border-b px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Page
            </p>
            <p className="mt-1 truncate font-medium">{page.title}</p>
            <p className="text-xs text-muted-foreground">/{page.slug}</p>
          </div>

          {/* Section list */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sections
            </p>
            <SectionList sections={page.sections} />
          </div>

          {canEdit && (
            <>
              <Separator />
              <div className="px-4 py-4">
                <AddSectionMenu />
              </div>
            </>
          )}
        </aside>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div
          className="flex shrink-0 items-center justify-between border-b bg-card px-4 py-2"
          role="toolbar"
          aria-label="Studio toolbar"
        >
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(toggleSidebar())}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              aria-expanded={sidebarOpen}
            >
              <PanelLeft className="h-4 w-4" aria-hidden="true" />
            </Button>

            <Button
              variant={previewMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => dispatch(setPreviewMode(!previewMode))}
              aria-pressed={previewMode}
            >
              <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
              {previewMode ? 'Editing' : 'Preview'}
            </Button>

            <Link
              href={`/preview/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Open preview ↗
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground" aria-live="polite">
              Logged in as{' '}
              <strong className="capitalize">{user.role}</strong>
            </span>
            {canPublish && <PublishButton slug={page.slug} />}
          </div>
        </div>

        {/* Editor / Preview pane */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas */}
          <div
            className={cn(
              'flex-1 overflow-y-auto bg-slate-100',
              !previewMode && 'p-4'
            )}
            aria-label="Page preview canvas"
          >
            <div
              className={cn(
                'mx-auto bg-white shadow-sm',
                !previewMode && 'rounded-lg overflow-hidden max-w-4xl'
              )}
            >
              <PageRenderer page={page} />
            </div>
          </div>

          {/* Props editor — hidden in preview mode */}
          {!previewMode && canEdit && (
            <aside
              className="w-72 shrink-0 overflow-y-auto border-l bg-card px-4 py-4"
              aria-label="Section properties editor"
            >
              <SectionEditor />
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
