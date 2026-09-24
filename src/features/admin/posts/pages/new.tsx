import { useEffect, useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useSelector } from '@tanstack/react-store'
import { Calendar, ChevronUp, ImagePlus, Save, Upload } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
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
import { slugify } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { usePostCategories, usePostDetail, usePostPlatforms } from '../hooks/usePosts'
import { postService } from '../services/postService'
import { usePermission } from '@/features/auth/hooks/usePermission'

const mediaLabels: MediaLabels = {
  allFiles: 'Tất cả tệp',
  unclassified: 'Chưa phân loại',

  banner: 'Banner',
  logo: 'Logo',
  documents: 'Tài liệu',
  other: 'Khác',
  trash: 'Thùng rác',
  allFilesBreadcrumb: 'Tất cả tệp',
  search: 'Tìm kiếm',
  newFolder: 'Thư mục mới',
  upload: 'Tải lên',
  allTypes: 'Tất cả loại',
  allSizes: 'Tất cả kích thước',
  uploadedAt: 'Ngày tải lên',
  filter: 'Lọc',
  list: 'Danh sách',
  grid: 'Lưới',
  fileInfo: 'Thông tin tệp',
  selectFile: 'Chọn tệp',
  filePath: 'Đường dẫn',
  fileSize: 'Kích thước',
  imageSize: 'Kích thước ảnh',
  uploadedBy: 'Người tải lên',
  actions: 'Thao tác',
  download: 'Tải xuống',
  edit: 'Chỉnh sửa',
  rename: 'Đổi tên',
  move: 'Di chuyển',
  copyLink: 'Sao chép liên kết',
  delete: 'Xóa',
  noFiles: 'Không có tệp',
  usedStorage: 'Dung lượng đã dùng',
  manageStorage: 'Quản lý dung lượng',
  fileType: 'Loại tệp',
  folder: 'Thư mục',
  file: 'Tệp',
  loadMore: 'Tải thêm',
  selectMultiple: 'Chọn nhiều',
  cancelSelect: 'Hủy',
  deleteSelected: 'Xóa đã chọn',
  selectedCount: 'Đã chọn',
}

export default function NewPostPage({ postId }: { postId?: string }) {
  const { t } = useTranslation('posts')
  const navigate = useNavigate()
  const canSave = usePermission(
    postId ? 'post.post.update' : 'post.post.create',
  )
  const detail = usePostDetail(postId)
  const categories = usePostCategories()
  const platforms = usePostPlatforms()
  const [videoPickerOpen, setVideoPickerOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const mediaQuery = useMediaList()
  const mediaItems = useMemo(
    () =>
      mediaRecordsToItems(
        mediaQuery.data?.pages.flatMap((page) => page.items) ?? [],
        mediaQuery.data?.pages.flatMap((page) => page.folders) ?? [],
      ),
    [mediaQuery.data?.pages],
  )
  const settings = useMediaSettings()
  const createMedia = useCreateMedia()
  const createFolder = useCreateMediaFolder()
  const updateMedia = useUpdateMedia()
  const deleteMedia = useDeleteMedia()
  const form = useForm({
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
      visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
      featuredImage: '',
      metaVideoUrl: '',
      categoryIds: [] as string[],
      platformIds: [] as string[],
    },
  })
  const values = useSelector(form.store, (state) => state.values)
  const {
    title,
    slug,
    excerpt,
    content,
    status,
    visibility,
    featuredImage,
    metaVideoUrl,
    categoryIds,
    platformIds,
  } = values

  useEffect(() => {
    const post = detail.data
    if (!post) return
    const nextValues = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? '',
      content: post.content,
      status: post.status,
      visibility: post.visibility,
      featuredImage: post.featuredImage ?? '',
      metaVideoUrl: String(
        post.metas.find((meta) => meta.metaKey === 'video_url')?.metaValue ??
          '',
      ),
      categoryIds: post.categories.map((item) => item.categoryId),
      platformIds: post.platforms.map((item) => item.platformId),
    }
    form.reset(nextValues)
    // Hydrate the form fields explicitly so subscribers receive the loaded values.
    form.setFieldValue('title', nextValues.title)
  }, [detail.data, form])
  const save = async (nextStatus = status) => {
    try {
      const input = {
        title,
        slug: slug || title,
        excerpt: excerpt || undefined,
        content,
        status: nextStatus,
        visibility,
        featuredImage: featuredImage || undefined,
        metaVideoUrl: metaVideoUrl || undefined,
        categoryIds,
        platformIds,
      }
      if (postId) await postService.update({ ...input, id: postId })
      else await postService.create(input)
      toast.success(t('saved'))
      await navigate({ to: '/dashboard/posts' })
    } catch (error) {
      toast.apiError(error, t('saveFailed'))
    }
  }
  const toggleCategory = (id: string) =>
    form.setFieldValue(
      'categoryIds',
      categoryIds.includes(id)
        ? categoryIds.filter((item) => item !== id)
        : [...categoryIds, id],
    )
  const togglePlatform = (id: string) =>
    form.setFieldValue(
      'platformIds',
      platformIds.includes(id)
        ? platformIds.filter((item) => item !== id)
        : [...platformIds, id],
    )
  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          {postId ? t('editTitle') : t('createTitle')}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void navigate({ to: '/dashboard/posts' })}
          >
            {t('cancel')}
          </Button>
          {canSave && (
            <Button variant="outline" onClick={() => void save('DRAFT')}>
              <Save />
              {t('saveDraft')}
            </Button>
          )}
          {canSave && (
            <Button onClick={() => void save('PUBLISHED')}>
              <Upload />
              {t('publish')}
            </Button>
          )}
        </div>
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0 space-y-5">
          <div className="space-y-4">
            <label className="block space-y-1.5 text-sm font-medium">
              <span>{t('titleLabel')}</span>
              <Input
                value={title}
                onChange={(event) => {
                  form.setFieldValue('title', event.target.value)
                  form.setFieldValue('slug', slugify(event.target.value))
                }}
                placeholder={t('titlePlaceholder')}
              />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              <span>{t('slugLabel')}</span>
              <Input
                value={slug}
                onChange={(event) =>
                  form.setFieldValue('slug', slugify(event.target.value))
                }
                placeholder={t('slugPlaceholder')}
              />
              <small className="font-normal text-slate-500">
                /{slug || 'post-name'}
              </small>
            </label>
            <label className="block space-y-1.5 text-sm">
              <span>{t('excerpt')}</span>
              <Textarea
                value={excerpt}
                onChange={(event) =>
                  form.setFieldValue('excerpt', event.target.value)
                }
                placeholder={t('excerptPlaceholder')}
                className="min-h-20"
              />
            </label>
          </div>
          <TiptapEditor
            key={detail.data?.id ?? postId ?? 'new-post'}
            content={content}
            onChange={(next) => form.setFieldValue('content', next)}
            placeholder={t('contentPlaceholder')}
          />
        </main>
        <aside className="space-y-4">
          <Card className="gap-4 p-4">
            <CardHeader className="flex-row items-center justify-between p-0">
              <CardTitle className="text-base">{t('publishBox')}</CardTitle>
              <ChevronUp className="size-4" />
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              <label className="block space-y-1.5 text-sm">
                <span>{t('status')}</span>
                <Select
                  value={status}
                  onValueChange={(value) =>
                    form.setFieldValue('status', value as 'DRAFT' | 'PUBLISHED')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">{t('statuses.draft')}</SelectItem>
                    <SelectItem value="PUBLISHED">
                      {t('statuses.published')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="block space-y-1.5 text-sm">
                <span>{t('visibility')}</span>
                <Select
                  value={visibility}
                  onValueChange={(value) =>
                    form.setFieldValue(
                      'visibility',
                      value as 'PUBLIC' | 'PRIVATE',
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">{t('public')}</SelectItem>
                    <SelectItem value="PRIVATE">{t('private')}</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="size-4" />
                {status === 'PUBLISHED'
                  ? t('statuses.published')
                  : t('statuses.draft')}
              </p>
              {canSave && (
                <Button className="w-full" onClick={() => void save()}>
                  <Save />
                  {t('saveStatus')}
                </Button>
              )}
            </CardContent>
          </Card>
          <Card className="gap-4 p-4">
            <CardHeader className="flex-row items-center justify-between p-0">
              <CardTitle className="text-base">{t('platform')}</CardTitle>
              <ChevronUp className="size-4" />
            </CardHeader>
            <CardContent className="space-y-2 p-0">
              {platforms.data?.map((platform) => (
                <label key={platform.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={platformIds.includes(platform.id)}
                    onCheckedChange={() => togglePlatform(platform.id)}
                  />
                  {platform.name}
                </label>
              ))}
              {!platforms.data?.length && (
                <p className="text-xs text-slate-500">{t('empty')}</p>
              )}
            </CardContent>
          </Card>
          <Card className="gap-4 p-4">
            <CardHeader className="flex-row items-center justify-between p-0">
              <CardTitle className="text-base">{t('category')}</CardTitle>
              <ChevronUp className="size-4" />
            </CardHeader>
            <CardContent className="space-y-2 p-0">
              {categories.data?.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={categoryIds.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  {category.name}
                </label>
              ))}
              {!categories.data?.length && (
                <p className="text-xs text-slate-500">{t('empty')}</p>
              )}
            </CardContent>
          </Card>
          <Card className="gap-4 p-4">
            <CardHeader className="flex-row items-center justify-between p-0">
              <CardTitle className="text-base">{t('featuredImage')}</CardTitle>
              <ChevronUp className="size-4" />
            </CardHeader>
            <CardContent className="p-0">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex min-h-24 w-full items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-primary/30 text-sm text-primary"
              >
                {featuredImage ? (
                  <img
                    src={featuredImage}
                    alt={title}
                    className="max-h-40 w-full object-cover"
                  />
                ) : (
                  <span>
                    <ImagePlus className="mx-auto mb-2 size-6" />
                    {t('setFeaturedImage')}
                  </span>
                )}
              </button>
            </CardContent>
          </Card>
          <Card className="gap-4 p-4">
            <CardHeader className="flex-row items-center justify-between p-0">
              <CardTitle>Media</CardTitle>
              <ChevronUp className="size-4" />
            </CardHeader>
            <CardContent className="space-y-2 p-0">
              <label className="block space-y-1.5 text-sm">
                <span>URL media</span>
                <Input
                  type="url"
                  value={metaVideoUrl}
                  onChange={(event) =>
                    form.setFieldValue('metaVideoUrl', event.target.value)
                  }
                  placeholder="https://..."
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setVideoPickerOpen(true)}
                >
                  Chọn từ media
                </Button>
              </label>
              <p className="text-xs text-slate-500">
                Nhập URL trực tiếp hoặc chọn file video từ media. Lưu với key
                video_url.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
      <MediaPicker
        open={pickerOpen || videoPickerOpen}
        imageOnly={pickerOpen}
        videoOnly={videoPickerOpen}
        items={mediaItems}
        labels={mediaLabels}
        title={videoPickerOpen ? 'Chọn media' : t('setFeaturedImage')}
        closeLabel={t('close')}
        hasMore={mediaQuery.hasNextPage}
        isLoadingMore={mediaQuery.isFetchingNextPage}
        onLoadMore={() => void mediaQuery.fetchNextPage()}
        onCreateMedia={(item) =>
          createMedia.mutateAsync({
            name: item.name,
            originalName: item.name,
            path: item.path,
            url: item.url ?? `/images/${item.name}`,
            storageMode: settings.data?.storageMode ?? 'SOURCE',
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
              storageMode: settings.data?.storageMode ?? 'SOURCE',
            })
            .then(() => undefined)
        }
        onRenameMedia={(item, name) =>
          updateMedia.mutateAsync({ id: item.id, name })
        }
        onDeleteMedia={(item) =>
          deleteMedia.mutateAsync({ id: item.id }).then(() => undefined)
        }
        onClose={() => {
          setPickerOpen(false)
          setVideoPickerOpen(false)
        }}
        onSelect={(item) => {
          if (videoPickerOpen)
            form.setFieldValue('metaVideoUrl', item.url || item.path)
          else form.setFieldValue('featuredImage', item.url || item.path)
          setPickerOpen(false)
          setVideoPickerOpen(false)
        }}
      />
    </div>
  )
}
