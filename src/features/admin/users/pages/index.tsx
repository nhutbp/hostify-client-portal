import { useEffect, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { format, parseISO } from 'date-fns'
import {
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  UsersRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { AddUserDialog } from './components/AddUserDialog'
import { UserRoleDistribution, UserStatCards } from './components/UserStats'
import { UserTable } from './components/UserTable'
import {
  useAdminUserMutations,
  useAdminUsers,
  useAdminUserStats,
} from '../hooks/useAdminUsers'
import type { AdminUser, AdminUserRole, AdminUserStatus } from '../types'
import Pagination from '@/components/table/Pagination'
import { DateRangeModalPicker } from '@/components/common/DateRangeModalPicker'
import { MobileFilterSheet } from '@/components/common/MobileFilterSheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/utils/toast'
import { usePermission } from '@/features/auth/hooks/usePermission'

const roles = ['ALL', 'CUSTOMER', 'STAFF', 'ADMIN'] as const

export default function AdminUsersPage() {
  const { t } = useTranslation('adminUsers')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [role, setRole] = useState<'ALL' | AdminUserRole>('ALL')
  const [status, setStatus] = useState<'ALL' | AdminUserStatus>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selected, setSelected] = useState(new Set<string>())
  const [bulkStatus, setBulkStatus] = useState<AdminUserStatus>('ACTIVE')
  const [addOpen, setAddOpen] = useState(false)
  const navigate = useNavigate()
  const { updateStatus, bulkUpdateStatus } = useAdminUserMutations()
  const canCreate = usePermission('user.user.create')
  const canUpdate = usePermission('user.user.update')
  const canApprove = usePermission('user.user.approve')
  const stats = useAdminUserStats()
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 400)
    return () => window.clearTimeout(timeout)
  }, [search])
  const queryInput = useMemo(
    () => ({
      search: debouncedSearch,
      role,
      status,
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
      page,
      limit,
    }),
    [debouncedSearch, role, status, dateFrom, dateTo, page, limit],
  )
  const query = useAdminUsers(queryInput)
  const items = query.data?.items ?? []
  const dateRange = useMemo<DateRange>(
    () => ({
      from: dateFrom ? parseISO(dateFrom) : undefined,
      to: dateTo ? parseISO(dateTo) : undefined,
    }),
    [dateFrom, dateTo],
  )
  const clearFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setRole('ALL')
    setStatus('ALL')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }
  const changeStatus = async (user: AdminUser) => {
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
  const applyBulk = async () => {
    try {
      await bulkUpdateStatus.mutateAsync({
        ids: [...selected],
        status: bulkStatus,
      })
      setSelected(new Set())
      toast.success(t('actions.success'))
    } catch (error) {
      toast.apiError(error, t('actions.failed'))
    }
  }
  const exportCsv = () => {
    const rows = [
      [
        'ID',
        t('columns.user'),
        'Email',
        t('columns.contact'),
        t('columns.role'),
        t('columns.status'),
      ],
      ...items.map((user) => [
        user.code,
        user.name,
        user.email,
        user.phone ?? '',
        t(`roles.${user.role}`),
        t(`statuses.${user.status}`),
      ]),
    ]
    const csv =
      '\uFEFF' +
      rows
        .map((row) =>
          row
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(','),
        )
        .join('\n')
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  const selectClass =
    'h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900'
  return (
    <div className="w-full min-w-0 space-y-5 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-emerald-700">
            {t('breadcrumb')}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" />
            {t('export')}
          </Button>
          {canCreate && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('add')}
            </Button>
          )}
        </div>
      </div>
      <div className="flex w-full min-w-0 flex-col gap-4 xl:flex-row">
        <div className="w-full min-w-0 space-y-4 xl:flex-1">
          <UserStatCards />
          <main className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <nav className="flex gap-7 overflow-x-auto border-b border-slate-200 px-5 pt-1 dark:border-slate-700">
              {roles.map((value) => (
                <button
                  key={value}
                  onClick={() => {
                    setRole(value)
                    setPage(1)
                  }}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${role === value ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-slate-500 hover:text-emerald-700'}`}
                >
                  {t(`roles.${value}`)} (
                  {value === 'ALL'
                    ? (stats.data?.total ?? 0)
                    : (stats.data?.roles[value] ?? 0)}
                  )
                </button>
              ))}
            </nav>
            <div className="flex flex-nowrap items-center gap-2 p-4">
              <div className="relative min-w-0 flex-1 md:min-w-60">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('search')}
                  className="pl-9"
                />
              </div>
              <div className="hidden flex-wrap items-center gap-2 md:flex">
                <select
                  className={selectClass}
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as typeof status)
                    setPage(1)
                  }}
                >
                  {(['ALL', 'ACTIVE', 'PENDING', 'BLOCKED'] as const).map(
                    (value) => (
                      <option key={value} value={value}>
                        {t(`statuses.${value}`)}
                      </option>
                    ),
                  )}
                </select>
                <DateRangeModalPicker
                  value={dateRange}
                  onApply={(range) => {
                    setDateFrom(
                      range.from ? format(range.from, 'yyyy-MM-dd') : '',
                    )
                    setDateTo(range.to ? format(range.to, 'yyyy-MM-dd') : '')
                    setPage(1)
                  }}
                  label={t('dateRange.label')}
                  title={t('dateRange.title')}
                  description={t('dateRange.description')}
                  applyLabel={t('dateRange.apply')}
                  cancelLabel={t('dateRange.cancel')}
                  fromLabel={t('dateRange.from')}
                  toLabel={t('dateRange.to')}
                  maxDays={3660}
                />
                <Button variant="outline" onClick={clearFilters}>
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  {t('clear')}
                </Button>
              </div>
              <MobileFilterSheet
                title={t('filters.title')}
                activeCount={
                  Number(status !== 'ALL') + Number(Boolean(dateFrom || dateTo))
                }
                onReset={clearFilters}
              >
                <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <span>{t('columns.status')}</span>
                  <select
                    className={`${selectClass} w-full`}
                    value={status}
                    onChange={(event) => {
                      setStatus(event.target.value as typeof status)
                      setPage(1)
                    }}
                  >
                    {(['ALL', 'ACTIVE', 'PENDING', 'BLOCKED'] as const).map(
                      (value) => (
                        <option key={value} value={value}>
                          {t(`statuses.${value}`)}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <DateRangeModalPicker
                  value={dateRange}
                  onApply={(range) => {
                    setDateFrom(
                      range.from ? format(range.from, 'yyyy-MM-dd') : '',
                    )
                    setDateTo(range.to ? format(range.to, 'yyyy-MM-dd') : '')
                    setPage(1)
                  }}
                  label={t('dateRange.label')}
                  title={t('dateRange.title')}
                  description={t('dateRange.description')}
                  applyLabel={t('dateRange.apply')}
                  cancelLabel={t('dateRange.cancel')}
                  fromLabel={t('dateRange.from')}
                  toLabel={t('dateRange.to')}
                  maxDays={3660}
                  className="flex-col items-stretch"
                  buttonClassName="w-full min-w-0"
                />
              </MobileFilterSheet>
            </div>
            {canApprove && selected.size > 0 && (
              <div className="mx-4 mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
                <strong className="mr-auto text-emerald-800">
                  {t('selected', { count: selected.size })}
                </strong>
                <select
                  className={selectClass}
                  value={bulkStatus}
                  onChange={(e) =>
                    setBulkStatus(e.target.value as AdminUserStatus)
                  }
                >
                  {(['ACTIVE', 'PENDING', 'BLOCKED'] as const).map((value) => (
                    <option key={value} value={value}>
                      {t(`statuses.${value}`)}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={applyBulk}
                  disabled={bulkUpdateStatus.isPending}
                >
                  {t('apply')}
                </Button>
              </div>
            )}
            {query.isLoading ? (
              <div className="grid min-h-72 place-items-center text-slate-500">
                {t('loading')}
              </div>
            ) : items.length ? (
              <UserTable
                items={items}
                page={page}
                limit={limit}
                canUpdate={canUpdate}
                canApprove={canApprove}
                selected={selected}
                onSelectedChange={setSelected}
                onStatusChange={changeStatus}
                onEdit={(user) =>
                  navigate({
                    to: '/dashboard/users/$userId',
                    params: { userId: user.id },
                  })
                }
                pendingId={
                  updateStatus.isPending ? updateStatus.variables.id : undefined
                }
              />
            ) : (
              <div className="grid min-h-72 place-items-center text-center text-slate-500">
                <div>
                  <UsersRound className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  {t('empty')}
                </div>
              </div>
            )}
            {query.data && (
              <Pagination
                pagination={query.data.meta}
                displayedCount={items.length}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setLimit(size)
                  setPage(1)
                }}
                pageSizeOptions={[10, 20, 50, 100]}
              />
            )}
          </main>
        </div>
        <aside className="w-full min-w-0 xl:w-[290px] xl:shrink-0">
          <UserRoleDistribution />
        </aside>
      </div>
      {canCreate && <AddUserDialog open={addOpen} onOpenChange={setAddOpen} />}
    </div>
  )
}
