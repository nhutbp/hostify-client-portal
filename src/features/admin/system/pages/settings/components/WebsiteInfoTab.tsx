import { useEffect, useMemo, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ImagePlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MediaPicker } from '@/features/admin/media/components/MediaPicker'
import { mediaRecordsToItems } from '@/features/admin/media/components/media-utils'
import type { MediaLabels } from '@/features/admin/media/components/types'
import {
  useCreateMedia,
  useCreateMediaFolder,
  useDeleteMedia,
  useMediaList,
  useMediaSettings,
  useUpdateMedia,
} from '@/features/admin/media/hooks/useMediaSettings'
import { toast } from '@/utils/toast'
import {
  getPublicWebsiteSettings,
  saveWebsiteSettings,
} from '../../../../../../../server/modules/system/system'

export function WebsiteInfoTab() {
  const { t } = useTranslation('system')
  const { t: tMedia } = useTranslation('media')
  const router = useRouter()
  const [siteName, setSiteName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [pickerTarget, setPickerTarget] = useState<'logo' | 'favicon' | null>(
    null,
  )
  const mediaQuery = useMediaList()
  const mediaSettings = useMediaSettings()
  const createMedia = useCreateMedia()
  const createFolder = useCreateMediaFolder()
  const updateMedia = useUpdateMedia()
  const deleteMedia = useDeleteMedia()
  const mediaLabels = useMemo<MediaLabels>(
    () => ({
      allFiles: tMedia('manager.allFiles'),
      unclassified: tMedia('manager.unclassified'),

      banner: tMedia('manager.banner'),
      logo: tMedia('manager.logo'),
      documents: tMedia('manager.documents'),
      other: tMedia('manager.other'),
      trash: tMedia('manager.trash'),
      allFilesBreadcrumb: tMedia('manager.allFilesBreadcrumb'),
      search: tMedia('manager.search'),
      newFolder: tMedia('manager.newFolder'),
      upload: tMedia('manager.upload'),
      allTypes: tMedia('manager.allTypes'),
      allSizes: tMedia('manager.allSizes'),
      uploadedAt: tMedia('manager.uploadedAt'),
      filter: tMedia('manager.filter'),
      list: tMedia('manager.list'),
      grid: tMedia('manager.grid'),
      fileInfo: tMedia('manager.fileInfo'),
      selectFile: tMedia('manager.selectFile'),
      filePath: tMedia('manager.filePath'),
      fileSize: tMedia('manager.fileSize'),
      imageSize: tMedia('manager.imageSize'),
      uploadedBy: tMedia('manager.uploadedBy'),
      actions: tMedia('manager.actions'),
      download: tMedia('manager.download'),
      edit: tMedia('manager.edit'),
      rename: tMedia('manager.rename'),
      move: tMedia('manager.move'),
      copyLink: tMedia('manager.copyLink'),
      delete: tMedia('manager.delete'),
      noFiles: tMedia('manager.noFiles'),
      usedStorage: tMedia('manager.usedStorage'),
      manageStorage: tMedia('manager.manageStorage'),
      fileType: tMedia('manager.fileType'),
      folder: tMedia('manager.folder'),
      file: tMedia('manager.file'),
      loadMore: tMedia('manager.loadMore'),
      selectMultiple: tMedia('manager.selectMultiple'),
      cancelSelect: tMedia('manager.cancelSelect'),
      deleteSelected: tMedia('manager.deleteSelected'),
      selectedCount: tMedia('manager.selectedCount'),
    }),
    [tMedia],
  )
  const mediaItems = useMemo(
    () =>
      mediaRecordsToItems(
        mediaQuery.data?.pages.flatMap((page) => page.items) ?? [],
        mediaQuery.data?.pages.flatMap((page) => page.folders) ?? [],
      ),
    [mediaQuery.data?.pages],
  )

  useEffect(() => {
    void getPublicWebsiteSettings().then((settings) => {
      setSiteName(settings.siteName)
      setLogoUrl(settings.logoUrl)
      setFaviconUrl(settings.faviconUrl)
    })
  }, [])

  const save = async () => {
    try {
      setSaving(true)
      await saveWebsiteSettings({ data: { siteName, logoUrl, faviconUrl } })
      await router.invalidate()
      toast.success(t('website.saved'))
    } catch (error) {
      toast.apiError(error, t('website.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h3 className="text-lg font-semibold">{t('website.title')}</h3>
        <p className="text-sm text-slate-500">{t('website.description')}</p>
      </div>
      <label className="block space-y-1.5 text-sm font-medium">
        <span>{t('website.siteName')}</span>
        <Input
          value={siteName}
          onChange={(event) => setSiteName(event.target.value)}
          placeholder={t('website.siteNamePlaceholder')}
        />
      </label>
      <div className="space-y-1.5 text-sm font-medium">
        <span>{t('website.logo')}</span>
        <button
          type="button"
          onClick={() => setPickerTarget('logo')}
          className="flex h-36 w-72 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500 transition hover:border-primary hover:text-primary"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={siteName}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-center">
              <ImagePlus className="mx-auto mb-2 size-7" />
              {t('website.chooseLogo')}
            </span>
          )}
        </button>
        {logoUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLogoUrl('')}
          >
            <Trash2 className="size-4" />
            {t('website.removeLogo')}
          </Button>
        )}
      </div>
      <div className="space-y-1.5 text-sm font-medium">
        <span>{t('website.favicon')}</span>
        <p className="text-xs font-normal text-slate-500">
          {t('website.faviconHint')}
        </p>
        <button
          type="button"
          onClick={() => setPickerTarget('favicon')}
          className="flex size-28 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500 transition hover:border-primary hover:text-primary"
        >
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt={t('website.favicon')}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-center text-xs">
              <ImagePlus className="mx-auto mb-2 size-6" />
              {t('website.chooseFavicon')}
            </span>
          )}
        </button>
        {faviconUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFaviconUrl('')}
          >
            <Trash2 className="size-4" />
            {t('website.removeFavicon')}
          </Button>
        )}
      </div>
      <Button disabled={saving || !siteName.trim()} onClick={() => void save()}>
        {saving ? t('website.saving') : t('website.save')}
      </Button>
      <MediaPicker
        open={pickerTarget !== null}
        imageOnly
        items={mediaItems}
        labels={mediaLabels}
        title={
          pickerTarget === 'favicon'
            ? t('website.faviconPickerTitle')
            : t('website.pickerTitle')
        }
        closeLabel={t('website.close')}
        hasMore={mediaQuery.hasNextPage}
        isLoadingMore={mediaQuery.isFetchingNextPage}
        onLoadMore={() => void mediaQuery.fetchNextPage()}
        onCreateMedia={(item) =>
          createMedia.mutateAsync({
            name: item.name,
            originalName: item.name,
            path: item.path,
            url: item.url ?? `/images/${item.name}`,
            storageMode: mediaSettings.data?.storageMode ?? 'SOURCE',
            mimeType: item.mimeType ?? 'application/octet-stream',
            extension: item.name.split('.').pop() ?? '',
            size: item.size ?? 0,
            folder: item.path.split('/').slice(0, -1).join('/') || '/',
            data: item.data,
          })
        }
        onCreateFolder={(folder) =>
          createFolder
            .mutateAsync({
              name: folder.name,
              parentPath: folder.parentPath,
              storageMode: mediaSettings.data?.storageMode ?? 'SOURCE',
            })
            .then(() => undefined)
        }
        onRenameMedia={(item, name) =>
          updateMedia.mutateAsync({ id: item.id, name })
        }
        onDeleteMedia={(item) =>
          deleteMedia.mutateAsync({ id: item.id }).then(() => undefined)
        }
        onClose={() => setPickerTarget(null)}
        onSelect={(item) => {
          const imageUrl = item.url || item.path
          if (pickerTarget === 'favicon') setFaviconUrl(imageUrl)
          else setLogoUrl(imageUrl)
          setPickerTarget(null)
        }}
      />
    </div>
  )
}
