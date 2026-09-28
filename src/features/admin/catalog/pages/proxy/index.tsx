import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Plus, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useProxyPackages } from '../../hooks/useProxyPackages'
import { useProviderCategories } from '../../hooks/useProviderCategories'
import { ProxyPlansTable } from './components/ProxyPlansTable'

export default function AdminProxyPackagesPage() {
  const { t } = useTranslation('catalog')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [providerCategoryId, setProviderCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const providers = useProviderCategories('')
  const list = useProxyPackages({
    page,
    limit: 10,
    search,
    providerCategoryId: providerCategoryId || undefined,
    status:
      status === 'ACTIVE' || status === 'DRAFT' || status === 'ARCHIVED'
        ? status
        : undefined,
  })
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(query)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [query])
  return (
    <div className="space-y-5 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-400">
            {t('proxy.breadcrumb')}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#11184c]">
            {t('proxy.title')}
          </h1>
          <p className="mt-1 text-base text-slate-500">
            {t('proxy.description')}
          </p>
        </div>
        <Link
          to="/dashboard/catalog/proxy/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="size-4" />
          {t('proxy.new.create')}
        </Link>
      </header>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_210px_180px]">
        <div className="relative">
          <Search className="absolute left-3 top-3 size-4 text-slate-400" />
          <input
            aria-label={t('proxy.search')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('proxy.search')}
            className="h-10 w-full rounded-lg border border-[#d5e1f2] bg-white pl-10 pr-3 text-sm"
          />
        </div>
        <select
          aria-label={t('proxy.provider')}
          value={providerCategoryId}
          onChange={(event) => {
            setProviderCategoryId(event.target.value)
            setPage(1)
          }}
          className="h-10 rounded-lg border border-[#d5e1f2] bg-white px-3 text-sm"
        >
          <option value="">{t('proxy.allProviders')}</option>
          {(providers.data ?? []).map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
        <select
          aria-label={t('proxy.status')}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          className="h-10 rounded-lg border border-[#d5e1f2] bg-white px-3 text-sm"
        >
          <option value="">{t('proxy.allStatuses')}</option>
          <option value="ACTIVE">{t('proxy.active')}</option>
          <option value="DRAFT">{t('proxy.draft')}</option>
          <option value="ARCHIVED">{t('proxy.archived')}</option>
        </select>
      </div>
      {list.isPending && (
        <p className="py-12 text-center text-slate-500">{t('proxy.loading')}</p>
      )}
      {list.isError && (
        <p role="alert" className="py-12 text-center text-red-600">
          {t('proxy.loadFailed')}: {list.error.message}
        </p>
      )}
      {list.data && <ProxyPlansTable data={list.data} onPageChange={setPage} />}
    </div>
  )
}
