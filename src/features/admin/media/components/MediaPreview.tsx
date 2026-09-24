import { useEffect, useState } from 'react'
import { cn } from '@/utils/utils'
import { getIcon } from './media-utils'
import type { MediaItem } from './types'

export function MediaPreview({
  item,
  className,
}: {
  item: MediaItem
  className?: string
}) {
  const [src, setSrc] = useState(() => encodeURI(item.url ?? ''))
  const [retried, setRetried] = useState(false)
  useEffect(() => {
    setSrc(encodeURI(item.url ?? ''))
    setRetried(false)
  }, [item.url])
  if (item.type !== 'file' || !item.url) {
    const Icon = getIcon(item)
    return (
      <Icon
        className={cn('text-primary/80', className)}
        size={52}
        strokeWidth={1.5}
      />
    )
  }
  return (
    <img
      src={src}
      alt={item.name}
      className={cn('h-full w-full object-contain', className)}
      onError={() => {
        if (retried) return
        setRetried(true)
        window.setTimeout(
          () =>
            setSrc(
              `${src}${src.includes('?') ? '&' : '?'}media_retry=${Date.now()}`,
            ),
          300,
        )
      }}
    />
  )
}
