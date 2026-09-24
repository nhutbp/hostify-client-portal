import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Edit3,
  KeyRound,
  LockKeyhole,
  UnlockKeyhole,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { UserPasswordDialog } from './components/UserPasswordDialog'
import { UserProfileDialog } from './components/UserProfileDialog'
import { ProfileSummary } from './components/ProfileSummary'
import { UserOverview } from './components/UserOverview'
import { UserRolesPanel } from './components/UserRolesPanel'
import { UserSideColumn } from './components/UserSideColumn'
import { UserSecurityTab } from './components/UserSecurityTab'
import { UserActivityTab } from './components/UserActivityTab'
import {
  useAdminUserDetail,
  useAdminUserMutations,
} from '../../hooks/useAdminUsers'
import { Button } from '@/components/ui/button'
import { toast } from '@/utils/toast'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { MediaPicker } from '@/features/admin/media/components/MediaPicker'
import { mediaRecordsToItems } from '@/features/admin/media/components/media-utils'
import type {
  MediaLabels,
  MediaRecordLike,
} from '@/features/admin/media/components/types'
import {
  useCreateMedia,
  useMediaList,
  useMediaSettings,
} from '@/features/admin/media/hooks/useMediaSettings'

type Tab = 'overview' | 'roles' | 'security' | 'activity'

export default function AdminUserDetailPage({ userId }: { userId: string }) {
  const { t, i18n } = useTranslation('adminUsers')
  const query = useAdminUserDetail(userId)
  const { updateStatus, updateProfile } = useAdminUserMutations()
  const canUpdate = usePermission('user.user.update')
  const canApprove = usePermission('user.user.approve')
  const canViewRoles = usePermission('user.role.view')
  const [tab, setTab] = useState<Tab>('overview')
  const [profileOpen, setProfileOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const mediaQuery = useMediaList()
  const mediaSettings = useMediaSettings()
  const createMedia = useCreateMedia()
  const mediaItems = useMemo(
    () =>
      mediaRecordsToItems(
        mediaQuery.data?.pages.flatMap((page) => page.items) ?? [],
        mediaQuery.data?.pages.flatMap((page) => page.folders) ?? [],
      ),
    [mediaQuery.data?.pages],
  )
  const mediaLabels = useMemo<MediaLabels>(
    () => ({
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
      filter: 'Bộ lọc',
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
      rename: 'Đổi tên',
      move: 'Di chuyển',
      copyLink: 'Sao chép liên kết',
      edit: 'Chỉnh sửa',
      delete: 'Xóa',
      noFiles: 'Chưa có tệp',
      usedStorage: 'Dung lượng đã dùng',
      manageStorage: 'Quản lý dung lượng',
      fileType: 'Loại tệp',
      folder: 'Thư mục',
      file: 'Tệp',
      loadMore: 'Tải thêm',
      selectMultiple: 'Chọn nhiều',
      cancelSelect: 'Hủy chọn',
      deleteSelected: 'Xóa đã chọn',
      selectedCount: 'Đã chọn',
    }),
    [],
  )
  if (query.isLoading)
    return (
      <div className="grid min-h-96 place-items-center text-slate-500">
        {t('loading')}
      </div>
    )
  if (!query.data)
    return (
      <div className="grid min-h-96 place-items-center text-slate-500">
        {t('editor.loadFailed')}
      </div>
    )
  const user = query.data
  const tabs: Array<[Tab, string]> = [
    ['overview', t('detail.tabs.overview')],
    ...(canViewRoles
      ? [['roles', t('detail.tabs.roles')] as [Tab, string]]
      : []),
    ['security', t('detail.tabs.security')],
    ['activity', t('detail.tabs.activity')],
  ]
  const toggleStatus = async () => {
    try {
      await updateStatus.mutateAsync({
        id: user.id,
        status: user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED',
      })
      toast.success(t('actions.success'))
    } catch (error) {
      toast.apiError(error, t('actions.failed'))
    }
  }
  const tabContent =
    tab === 'overview' ? (
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <UserOverview
          user={user}
          locale={i18n.language}
          canUpdate={canUpdate}
          onEdit={() => setProfileOpen(true)}
        />
        <UserSideColumn user={user} locale={i18n.language} />
      </div>
    ) : tab === 'roles' ? (
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <UserRolesPanel user={user} />
        <UserSideColumn user={user} locale={i18n.language} />
      </div>
    ) : tab === 'security' ? (
      <UserSecurityTab
        user={user}
        locale={i18n.language}
        onResetPassword={() => setPasswordOpen(true)}
        onToggleStatus={() => void toggleStatus()}
      />
    ) : (
      <UserActivityTab user={user} locale={i18n.language} />
    )
  return (
    <div className="space-y-4 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-2 text-sm text-emerald-700">
            {t('breadcrumb')} / {user.displayName}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/users">
              <ArrowLeft className="mr-2 size-4" />
              {t('detail.back')}
            </Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {canUpdate && (
            <Button variant="outline" onClick={() => setPasswordOpen(true)}>
              <KeyRound className="mr-2 size-4" />
              {t('detail.resetPassword')}
            </Button>
          )}
          {canApprove && (
            <Button
              variant="outline"
              className={
                user.status === 'BLOCKED'
                  ? 'text-emerald-700'
                  : 'border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700'
              }
              onClick={toggleStatus}
              disabled={updateStatus.isPending}
            >
              {user.status === 'BLOCKED' ? (
                <UnlockKeyhole className="mr-2 size-4" />
              ) : (
                <LockKeyhole className="mr-2 size-4" />
              )}
              {user.status === 'BLOCKED'
                ? t('actions.unlock')
                : t('actions.lock')}
            </Button>
          )}
          {canUpdate && (
            <Button onClick={() => setProfileOpen(true)}>
              <Edit3 className="mr-2 size-4" />
              {t('detail.editInfo')}
            </Button>
          )}
        </div>
      </div>
      <ProfileSummary
        user={user}
        locale={i18n.language}
        canUpdate={canUpdate}
        onAvatarClick={() => setAvatarPickerOpen(true)}
      />
      <nav className="flex gap-7 overflow-x-auto border-b border-slate-200">
        {tabs.map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium ${tab === value ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-slate-500 hover:text-emerald-700'}`}
          >
            {label}
          </button>
        ))}
      </nav>
      {tabContent}
      {canUpdate && (
        <UserProfileDialog
          user={user}
          open={profileOpen}
          onOpenChange={setProfileOpen}
        />
      )}
      {canUpdate && (
        <UserPasswordDialog
          userId={user.id}
          open={passwordOpen}
          onOpenChange={setPasswordOpen}
        />
      )}
      <MediaPicker
        open={avatarPickerOpen}
        items={mediaItems}
        imageOnly
        labels={mediaLabels}
        title="Chọn ảnh đại diện"
        closeLabel="Đóng"
        hasMore={mediaQuery.hasNextPage}
        isLoadingMore={mediaQuery.isFetchingNextPage}
        onLoadMore={() => void mediaQuery.fetchNextPage()}
        onCreateMedia={async (item) =>
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
        onClose={() => setAvatarPickerOpen(false)}
        onSelect={(media: MediaRecordLike) => {
          void updateProfile
            .mutateAsync({
              id: user.id,
              displayName: user.displayName,
              email: user.email,
              ...(user.phone ? { phone: user.phone } : {}),
              avatarUrl: media.url,
              ...(user.birthDate ? { birthDate: user.birthDate } : {}),
              gender: user.gender,
            })
            .then(() => {
              setAvatarPickerOpen(false)
              toast.success('Đã cập nhật ảnh đại diện')
            })
            .catch((error: unknown) =>
              toast.apiError(error, 'Không thể cập nhật ảnh đại diện'),
            )
        }}
      />
    </div>
  )
}
