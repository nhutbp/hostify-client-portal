import {
  ChevronDown,
  GripVertical,
  ImagePlus,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { usePosts } from '@/features/admin/posts/hooks/usePosts'
import { toast } from '@/utils/toast'
import {
  useCreateMenu,
  useDeleteMenu,
  useMenus,
  useUpdateMenu,
} from '../hooks/useMenus'

type MenuItem = {
  id: string
  label: string
  url: string
  parentId?: string | null
  icon?: string | null
  imageUrl?: string | null
}
type Menu = {
  id: string
  name: string
  items: MenuItem[]
  locations: string[]
  autoAddPages: boolean
}
type SourceItem = MenuItem

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

export default function MenuSettingsPage() {
  const { t } = useTranslation('appearance')
  const [menus, setMenus] = useState<Menu[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mode, setMode] = useState<'manage' | 'edit'>('manage')
  const [search, setSearch] = useState({ posts: '' })
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [imageItemId, setImageItemId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const posts = usePosts({ page: 1, limit: 10, search: debouncedSearch.posts })
  const menusQuery = useMenus()
  const createMenuMutation = useCreateMenu()
  const updateMenuMutation = useUpdateMenu()
  const deleteMenuMutation = useDeleteMenu()
  const mediaQuery = useMediaList()
  const mediaItems = useMemo(
    () =>
      mediaRecordsToItems(
        mediaQuery.data?.pages.flatMap((page) => page.items) ?? [],
        mediaQuery.data?.pages.flatMap((page) => page.folders) ?? [],
      ),
    [mediaQuery.data?.pages],
  )
  const mediaSettings = useMediaSettings()
  const createMedia = useCreateMedia()
  const createFolder = useCreateMediaFolder()
  const updateMedia = useUpdateMedia()
  const deleteMedia = useDeleteMedia()
  const activeMenu = menus.find((menu) => menu.id === activeId) ?? null
  const createMenuForm = useForm({
    defaultValues: { name: '' },
    validators: {
      onSubmit: ({ value }) =>
        value.name.trim() ? undefined : { name: 'Vui lòng nhập tên menu' },
    },
    onSubmit: async ({ value }) => {
      const menu = await createMenuMutation.mutateAsync({
        name: value.name.trim(),
        locations: ['main'],
        autoAddPages: false,
      })
      createMenuForm.reset()
      setActiveId(menu.id)
      setMode('manage')
    },
  })
  const customLinkForm = useForm({
    defaultValues: { url: '', label: '' },
    validators: {
      onSubmit: ({ value }) => {
        const errors: Record<string, string> = {}
        if (!value.url.trim()) errors.url = 'Vui lòng nhập URL'
        if (!value.label.trim()) errors.label = 'Vui lòng nhập nhãn liên kết'
        return Object.keys(errors).length ? errors : undefined
      },
    },
    onSubmit: async ({ value }) => {
      updateActive({
        items: [
          ...(activeMenu?.items ?? []),
          {
            id: crypto.randomUUID(),
            label: value.label.trim(),
            url: value.url.trim(),
          },
        ],
      })
      customLinkForm.reset()
    },
  })

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 300)
    return () => window.clearTimeout(timeout)
  }, [search])
  useEffect(() => {
    const data = (menusQuery.data ?? []) as Menu[]
    setMenus(data)
    setActiveId((current) =>
      current && data.some((menu) => menu.id === current)
        ? current
        : (data[0]?.id ?? null),
    )
  }, [menusQuery.data])
  const persist = (next: Menu[]) => {
    setMenus(next)
    const menu = next.find((entry) => entry.id === activeId)
    if (!menu) return Promise.resolve()
    return updateMenuMutation.mutateAsync({
      id: menu.id,
      name: menu.name,
      locations: menu.locations,
      autoAddPages: menu.autoAddPages,
      items: menu.items.map((item, index) => ({
        ...item,
        itemType: 'custom',
        sortOrder: index,
      })),
    })
  }
  const updateActive = (update: Partial<Menu>) => {
    if (!activeMenu) return
    void persist(
      menus.map((menu) =>
        menu.id === activeMenu.id ? { ...menu, ...update } : menu,
      ),
    ).catch((error) => toast.apiError(error, t('save')))
  }
  const removeMenu = async (menu: Menu) => {
    if (!window.confirm(t('deleteMenuConfirm', { name: menu.name }))) return
    try {
      await deleteMenuMutation.mutateAsync(menu.id)
      setMenus((current) => current.filter((entry) => entry.id !== menu.id))
      setActiveId((current) => (current === menu.id ? null : current))
      toast.success(t('menuDeleted'))
    } catch (error) {
      toast.apiError(error, t('deleteMenuFailed'))
    }
  }
  const addItems = (items: SourceItem[]) => {
    if (!activeMenu) return
    const additions = items.filter(
      (item) =>
        selected[item.id] &&
        !activeMenu.items.some((current) => current.id === item.id),
    )
    updateActive({ items: [...activeMenu.items, ...additions] })
    setSelected({})
  }
  const move = (index: number, direction: -1 | 1) => {
    if (!activeMenu) return
    const next = [...activeMenu.items]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    updateActive({ items: next })
  }
  const depthOf = (item: MenuItem, items = activeMenu?.items ?? []) => {
    let depth = 0
    let parentId = item.parentId
    while (parentId) {
      depth += 1
      parentId = items.find((entry) => entry.id === parentId)?.parentId
      if (depth > items.length) break
    }
    return depth
  }
  const changeDepth = (item: MenuItem, direction: -1 | 1) => {
    if (!activeMenu) return
    const index = activeMenu.items.findIndex((entry) => entry.id === item.id)
    const depth = depthOf(item)
    if (direction === 1 && index > 0 && depth === 0)
      updateActive({
        items: activeMenu.items.map((entry, entryIndex) =>
          entry.id === item.id
            ? { ...entry, parentId: activeMenu.items[entryIndex - 1]?.id }
            : entry,
        ),
      })
    if (direction === -1 && item.parentId) {
      const parent = activeMenu.items.find(
        (entry) => entry.id === item.parentId,
      )
      updateActive({
        items: activeMenu.items.map((entry) =>
          entry.id === item.id
            ? { ...entry, parentId: parent?.parentId ?? null }
            : entry,
        ),
      })
    }
  }
  const dropItem = (targetId: string) => {
    if (!activeMenu || !draggedId || draggedId === targetId) return
    const next = [...activeMenu.items]
    const from = next.findIndex((entry) => entry.id === draggedId)
    const to = next.findIndex((entry) => entry.id === targetId)
    const moved = next.splice(from, 1)[0]
    next.splice(to, 0, moved)
    updateActive({ items: next })
    setDraggedId(null)
  }
  const sourceGroups = useMemo(
    () => [
      {
        key: 'posts',
        title: t('posts'),
        items: (
          (posts.data?.items ?? []) as Array<{
            id: string
            title: string
            slug: string
          }>
        ).map((item) => ({
          id: item.id,
          label: item.title,
          url: `/${item.slug}`,
        })),
      },
    ],
    [posts.data?.items, t],
  )
  const createView = (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>{t('createMenu')}</CardTitle>
        <p className="text-sm text-slate-500">{t('createFirstMenu')}</p>
      </CardHeader>
      <CardContent>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            void createMenuForm.handleSubmit()
          }}
        >
          <createMenuForm.Field name="name">
            {(field) => (
              <div className="min-w-0 flex-1">
                <Input
                  autoFocus
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t('menuNamePlaceholder')}
                  aria-invalid={Boolean(field.state.meta.errors[0])}
                />
                {field.state.meta.errors[0] ? (
                  <p className="mt-1 text-xs text-red-500">
                    {field.state.meta.errors[0]}
                  </p>
                ) : null}
              </div>
            )}
          </createMenuForm.Field>
          <Button type="submit">
            <Plus />
            {t('createMenu')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
  if (mode === 'manage' || !activeMenu)
    return (
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('menuSettings')}</p>
        </div>
        {menus.length === 0 ? (
          createView
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{t('menuList')}</h2>
              <Button onClick={() => setMode('edit')}>
                <Plus />
                {t('createMenu')}
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {menus.map((menu) => (
                <Card key={menu.id}>
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-semibold">{menu.name}</p>
                      <p className="text-xs text-slate-500">
                        {menu.items.length} {t('menuSettings').toLowerCase()}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActiveId(menu.id)
                          setMode('edit')
                        }}
                      >
                        {t('editMenu')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950/40"
                        disabled={deleteMenuMutation.isPending}
                        onClick={() => void removeMenu(menu)}
                        aria-label={t('deleteMenu')}
                        title={t('deleteMenu')}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                void createMenuForm.handleSubmit()
              }}
            >
              <createMenuForm.Field name="name">
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    placeholder={t('menuNamePlaceholder')}
                    aria-invalid={Boolean(field.state.meta.errors[0])}
                  />
                )}
              </createMenuForm.Field>
              <Button type="submit">
                <Plus />
                {t('createMenu')}
              </Button>
            </form>
          </>
        )}
      </div>
    )
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('menuSettings')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMode('manage')}>
            {t('menuList')}
          </Button>
          <Button
            onClick={() => {
              void persist(menus)
                .then(() => toast.success(t('saved')))
                .catch((error) => toast.apiError(error, t('save')))
            }}
          >
            <Save />
            {t('save')}
          </Button>
        </div>
      </div>
      <div className="flex gap-1 border-b border-slate-200">
        <Button
          variant="ghost"
          className="rounded-b-none border-b-2 border-primary"
        >
          {t('editMenu')}
        </Button>
        <Button
          variant="ghost"
          className="rounded-b-none text-slate-500"
          onClick={() => setMode('manage')}
        >
          {t('locations')}
        </Button>
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(240px,3fr)_minmax(0,7fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{t('addItems')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-0">
            {sourceGroups.map((source) => (
              <details key={source.key} className="group rounded-md border">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold">
                  {source.title}
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="space-y-2 border-t bg-slate-50 p-3 dark:bg-slate-900">
                  <Input
                    value={search[source.key as keyof typeof search]}
                    onChange={(event) =>
                      setSearch((current) => ({
                        ...current,
                        [source.key]: event.target.value,
                      }))
                    }
                    placeholder={t('search')}
                  />
                  {source.items.length ? (
                    source.items.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={Boolean(selected[item.id])}
                          onCheckedChange={(checked) =>
                            setSelected((current) => ({
                              ...current,
                              [item.id]: checked === true,
                            }))
                          }
                        />
                        {item.label}
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">{t('noResults')}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!source.items.length}
                    onClick={() => addItems(source.items)}
                  >
                    <Plus />
                    {t('addToMenu')}
                  </Button>
                </div>
              </details>
            ))}
            <details className="rounded-md border">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold">
                {t('customLinks')}
              </summary>
              <form
                className="space-y-2 border-t p-3"
                onSubmit={(event) => {
                  event.preventDefault()
                  void customLinkForm.handleSubmit()
                }}
              >
                <customLinkForm.Field name="url">
                  {(field) => (
                    <div>
                      <Input
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                        placeholder={t('customUrl')}
                        aria-invalid={Boolean(field.state.meta.errors[0])}
                      />
                      {field.state.meta.errors[0] ? (
                        <p className="mt-1 text-xs text-red-500">
                          {field.state.meta.errors[0]}
                        </p>
                      ) : null}
                    </div>
                  )}
                </customLinkForm.Field>
                <customLinkForm.Field name="label">
                  {(field) => (
                    <div>
                      <Input
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                        placeholder={t('linkText')}
                        aria-invalid={Boolean(field.state.meta.errors[0])}
                      />
                      {field.state.meta.errors[0] ? (
                        <p className="mt-1 text-xs text-red-500">
                          {field.state.meta.errors[0]}
                        </p>
                      ) : null}
                    </div>
                  )}
                </customLinkForm.Field>
                <Button type="submit" variant="outline" size="sm">
                  <Plus />
                  {t('addCustomLink')}
                </Button>
              </form>
            </details>
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>{t('menuStructure')}</CardTitle>
              <p className="text-sm text-slate-500">{t('instruction')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block space-y-1.5 text-sm">
                <span>{t('menuName')}</span>
                <Input
                  value={activeMenu.name}
                  onChange={(event) =>
                    updateActive({ name: event.target.value })
                  }
                />
              </label>
              <div className="space-y-2">
                {activeMenu.items.length ? (
                  activeMenu.items.map((item, index) => (
                    <div key={item.id}>
                      <div
                        draggable
                        onDragStart={() => setDraggedId(item.id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => dropItem(item.id)}
                        style={{ marginLeft: `${depthOf(item) * 30}px` }}
                        onClick={() =>
                          setExpandedId(expandedId === item.id ? null : item.id)
                        }
                        className="flex cursor-grab items-center gap-2 rounded-md border bg-slate-50 px-3 py-2.5 dark:bg-slate-900"
                      >
                        <GripVertical className="size-4 shrink-0 text-slate-400" />
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="size-5 rounded object-cover"
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{item.label}</p>
                          <p className="truncate text-xs text-slate-500">
                            {item.url}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation()
                            changeDepth(item, -1)
                          }}
                        >
                          ←
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation()
                            changeDepth(item, 1)
                          }}
                        >
                          →
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation()
                            move(index, -1)
                          }}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation()
                            move(index, 1)
                          }}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={(event) => {
                            event.stopPropagation()
                            updateActive({
                              items: activeMenu.items.filter(
                                (entry) => entry.id !== item.id,
                              ),
                            })
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      {expandedId === item.id && (
                        <div
                          className="space-y-3 rounded-b-md border border-t-0 bg-white p-4"
                          style={{ marginLeft: `${depthOf(item) * 30}px` }}
                        >
                          <label className="block space-y-1 text-sm">
                            <span>Nhấn để đổi tên nhãn điều hướng</span>
                            <Input
                              value={item.label}
                              onChange={(event) =>
                                updateActive({
                                  items: activeMenu.items.map((entry) =>
                                    entry.id === item.id
                                      ? { ...entry, label: event.target.value }
                                      : entry,
                                  ),
                                })
                              }
                            />
                          </label>
                          <label className="block space-y-1 text-sm">
                            <span>Hình ảnh</span>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => setImageItemId(item.id)}
                            >
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt=""
                                  className="size-6 rounded object-cover"
                                />
                              ) : (
                                <ImagePlus className="size-4" />
                              )}
                              Chọn hình ảnh từ media
                            </Button>
                          </label>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="rounded-md border border-dashed p-6 text-center text-sm text-slate-500">
                    {t('empty')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('menuLocations')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={activeMenu.autoAddPages}
                  onCheckedChange={(checked) =>
                    updateActive({ autoAddPages: checked === true })
                  }
                />
                {t('autoAddPages')}
              </label>
              {[
                ['main', 'mainMenu'],
                ['mobile', 'mobileMenu'],
                ['footer', 'footerMenu'],
                ['top', 'topMenu'],
                ['account', 'accountMenu'],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <Checkbox
                    checked={activeMenu.locations.includes(value)}
                    onCheckedChange={(checked) =>
                      updateActive({
                        locations:
                          checked === true
                            ? [...new Set([...activeMenu.locations, value])]
                            : activeMenu.locations.filter(
                                (item) => item !== value,
                              ),
                      })
                    }
                  />
                  {t(label)}
                </label>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <MediaPicker
        open={Boolean(imageItemId)}
        imageOnly
        items={mediaItems}
        labels={mediaLabels}
        title="Chọn hình ảnh menu"
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
        onRenameMedia={(item, name) =>
          updateMedia.mutateAsync({ id: item.id, name })
        }
        onDeleteMedia={(item) =>
          deleteMedia.mutateAsync({ id: item.id }).then(() => undefined)
        }
        onClose={() => setImageItemId(null)}
        onSelect={(item) => {
          if (imageItemId)
            updateActive({
              items: activeMenu.items.map((entry) =>
                entry.id === imageItemId
                  ? {
                      ...entry,
                      imageUrl: item.url || item.path,
                      icon: undefined,
                    }
                  : entry,
              ),
            })
          setImageItemId(null)
        }}
      />
    </div>
  )
}
