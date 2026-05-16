'use client'

import { useEffect } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  publishPage,
  selectPublishError,
  selectPublishStatus,
  selectLatestRelease,
} from '@/store/slices/publishSlice'
import { selectIsDirty, markClean } from '@/store/slices/draftPageSlice'

type Props = { slug: string }

export function PublishButton({ slug }: Props) {
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectPublishStatus)
  const release = useAppSelector(selectLatestRelease)
  const error = useAppSelector(selectPublishError)
  const isDirty = useAppSelector(selectIsDirty)

  useEffect(() => {
    if (status === 'success') {
      dispatch(markClean())
      toast({
        title: 'Published',
        description: release
          ? `Version ${release.version} is live.`
          : 'Page published successfully.',
      })
    }
    if (status === 'error') {
      toast({
        variant: 'destructive',
        title: 'Publish failed',
        description: error ?? 'Check the console for details.',
      })
    }
  }, [status, release, error, dispatch])

  function handlePublish() {
    dispatch(publishPage({ slug }))
  }

  const isPublishing = status === 'publishing'

  return (
    <div className="flex items-center gap-3">
      {release && (
        <Badge variant="outline" className="text-xs">
          v{release.version}
        </Badge>
      )}

      {isDirty && (
        <span className="text-xs text-amber-600" aria-live="polite">
          Unsaved changes
        </span>
      )}

      <Button
        onClick={handlePublish}
        disabled={isPublishing}
        size="sm"
        aria-label={isPublishing ? 'Publishing page…' : 'Publish page'}
        aria-busy={isPublishing}
      >
        {isPublishing ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : status === 'success' ? (
          <CheckCircle className="h-4 w-4" aria-hidden="true" />
        ) : status === 'error' ? (
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Upload className="h-4 w-4" aria-hidden="true" />
        )}
        {isPublishing ? 'Publishing…' : 'Publish'}
      </Button>
    </div>
  )
}
