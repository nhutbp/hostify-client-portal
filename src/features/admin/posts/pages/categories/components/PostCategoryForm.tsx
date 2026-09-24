import { ImagePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { slugify } from '@/utils/utils'
import { postService } from '../../../services/postService'
import { postQueryKeys } from '../../../hooks/usePosts'
import type { PostCategory } from './data'

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

export function PostCategoryForm({
  categories,
  editingCategory,
  onDone,
  onCancel,
}: {
  categories: PostCategory[]
  editingCategory?: PostCategory | null
  onDone?: () => void
  onCancel?: () => void
}) {
  const { t } = useTranslation('posts')
  const queryClient = useQueryClient()
  const [isSlugEdited, setIsSlugEdited] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const mediaQuery = useMediaList()
  const mediaItems = mediaRecordsToItems(
    mediaQuery.data?.pages.flatMap((page) => page.items) ?? [],
    mediaQuery.data?.pages.flatMap((page) => page.folders) ?? [],
  )
  const mediaSettings = useMediaSettings()
  const createMedia = useCreateMedia()
  const createFolder = useCreateMediaFolder()
  const updateMedia = useUpdateMedia()
  const deleteMedia = useDeleteMedia()
  const editing = Boolean(editingCategory)
  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
      parentId: 'none',
      description: '',
      imageUrl: '',
    },
    onSubmit: async ({ value }) => {
      try {
        const input = {
          name: value.name.trim(),
          slug: value.slug || undefined,
          description: value.description || undefined,
          imageUrl: value.imageUrl || undefined,
          parentId: value.parentId === 'none' ? undefined : value.parentId,
        }
        if (editingCategory)
          await postService.updateCategory({
            ...input,
            id: editingCategory.id,
          })
        else await postService.createCategory(input)
        await queryClient.invalidateQueries({
          queryKey: postQueryKeys.categories(),
        })
        form.reset()
        setIsSlugEdited(false)
        onDone?.()
        toast.success(t('categorySaved'))
      } catch (error) {
        toast.apiError(error, t('saveFailed'))
      }
    },
  })
  useEffect(() => {
    form.reset({
      name: editingCategory?.name ?? '',
      slug: editingCategory?.slug ?? '',
      parentId: editingCategory?.parentId ?? 'none',
      description: editingCategory?.description ?? '',
      imageUrl: editingCategory?.imageUrl ?? '',
    })
    setIsSlugEdited(Boolean(editingCategory))
  }, [editingCategory, form])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
      className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {editing ? 'Sửa danh mục' : t('newCategory')}
      </h2>
      <div className="mt-5 space-y-4">
        <Field label={t('categoryName')}>
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                value.trim() ? undefined : t('categoryName'),
            }}
          >
            {(field) => (
              <Input
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  const value = event.target.value
                  field.handleChange(value)
                  if (!isSlugEdited) form.setFieldValue('slug', slugify(value))
                }}
                placeholder={t('categoryName')}
              />
            )}
          </form.Field>
        </Field>
        <Field label="Slug">
          <form.Field name="slug">
            {(field) => (
              <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  setIsSlugEdited(true)
                  field.handleChange(slugify(event.target.value))
                }}
                placeholder={t('slugPlaceholder')}
              />
            )}
          </form.Field>
        </Field>
        <Field label={t('parentCategory')}>
          <form.Field name="parentId">
            {(field) => (
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('rootCategory')}</SelectItem>
                  {categories
                    .filter((category) => category.id !== editingCategory?.id)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </form.Field>
        </Field>
        <Field label={t('description')}>
          <form.Field name="description">
            {(field) => (
              <Textarea
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder={t('descriptionPlaceholder')}
                className="min-h-24"
              />
            )}
          </form.Field>
        </Field>
        <Field label={t('featuredImage')} hint={t('imageUrlPlaceholder')}>
          <form.Field name="imageUrl">
            {(field) => (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-left hover:border-primary dark:border-slate-700"
              >
                {field.state.value ? (
                  <img
                    src={field.state.value}
                    alt=""
                    className="size-12 rounded-md object-cover"
                  />
                ) : (
                  <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <ImagePlus className="size-4" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    {t('setFeaturedImage')}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {field.state.value || t('imageUrlPlaceholder')}
                  </span>
                </span>
              </button>
            )}
          </form.Field>
        </Field>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full"
            >
              {editing ? 'Lưu thay đổi' : t('newCategory')}
            </Button>
          )}
        </form.Subscribe>
        {editing ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onCancel}
          >
            Hủy
          </Button>
        ) : null}
      </div>
      <MediaPicker
        open={pickerOpen}
        imageOnly
        items={mediaItems}
        labels={mediaLabels}
        title={t('setFeaturedImage')}
        closeLabel="Đóng"
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
        onRenameMedia={(item, nextName) =>
          updateMedia.mutateAsync({ id: item.id, name: nextName })
        }
        onDeleteMedia={(item) =>
          deleteMedia.mutateAsync({ id: item.id }).then(() => undefined)
        }
        onClose={() => setPickerOpen(false)}
        onSelect={(item) => {
          form.setFieldValue('imageUrl', item.url || item.path)
          setPickerOpen(false)
        }}
      />
    </form>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {children}
      {hint && <small className="block text-xs text-slate-500">{hint}</small>}
    </label>
  )
}
