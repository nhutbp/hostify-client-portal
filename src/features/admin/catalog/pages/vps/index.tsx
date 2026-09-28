import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { VpsFilters } from '../../components/vps/VpsFilters'
import { VpsPlansTable } from '../../components/vps/VpsPlansTable'
import {
  useSetVpsPackageStatus,
  useVpsPackageLookups,
  useVpsPackages,
} from '../../hooks/useVpsPackage'
import { toast } from '@/utils/toast'

export default function AdminVpsPackagesPage() {
  const { t } = useTranslation('catalog')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [providerCategoryId, setProviderCategoryId] = useState('')
  const [datacenterId, setDatacenterId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const lookups = useVpsPackageLookups()
  const list = useVpsPackages({
    page,
    limit: 10,
    search,
    providerCategoryId: providerCategoryId || undefined,
    datacenterId: datacenterId || undefined,
    status: status === 'ACTIVE' || status === 'DRAFT' ? status : undefined,
  })
  const statusMutation = useSetVpsPackageStatus()
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1)
      setSearch(query)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [query])
  const togglePlan = async (id: string, nextStatus: 'ACTIVE' | 'DRAFT') => {
    try {
      await statusMutation.mutateAsync({ id, status: nextStatus })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('vps.table.updateFailed'),
      )
    }
  }
  return (
    <div className="space-y-5 text-slate-900">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-400">
            {t('vps.breadcrumb')}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#11184c]">
            {t('vps.title')}
          </h1>
          <p className="mt-1 text-base text-slate-500">
            {t('vps.description')}
          </p>
        </div>
        <Link
          to="/dashboard/catalog/vps/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-base font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="size-4" /> {t('vps.add')}
        </Link>
      </div>
      <div className="min-w-0">
        <VpsFilters
          query={query}
          onQueryChange={setQuery}
          providerId={providerCategoryId}
          onProviderChange={(value) => {
            setProviderCategoryId(value)
            setPage(1)
          }}
          status={status}
          onStatusChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
          datacenterId={datacenterId}
          onDatacenterChange={(value) => {
            setDatacenterId(value)
            setPage(1)
          }}
          providers={lookups.data?.providerCategories ?? []}
          datacenters={lookups.data?.datacenters ?? []}
        />
        {list.isPending && (
          <p className="py-12 text-center text-slate-500">
            {t('vps.table.loading')}
          </p>
        )}
        {list.isError && (
          <p role="alert" className="py-12 text-center text-red-600">
            {t('vps.table.loadFailed')}: {list.error.message}
          </p>
        )}
        {list.data && (
          <VpsPlansTable
            data={list.data}
            onToggle={togglePlan}
            isToggling={statusMutation.isPending}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  )
}
