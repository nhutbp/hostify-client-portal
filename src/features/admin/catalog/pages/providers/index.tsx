import { useEffect, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/utils/toast'
import { slugify } from '@/utils/utils'
import {
  useCreateProviderCategory,
  useDeleteProviderCategory,
  useProviderCategories,
  useUpdateProviderCategory,
} from '../../hooks/useProviderCategories'
import type { ProviderCategory } from '../../services/providerCategoryService'

export default function CatalogProvidersPage() {
  const { t } = useTranslation('catalog')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<ProviderCategory | null>(null)
  const query = useProviderCategories(search)
  const create = useCreateProviderCategory()
  const update = useUpdateProviderCategory()
  const remove = useDeleteProviderCategory()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  useEffect(() => {
    setName(editing?.name ?? '')
    setSlug(editing?.slug ?? '')
    setDescription(editing?.description ?? '')
    setSlugEdited(Boolean(editing))
  }, [editing])

  const reset = () => {
    setEditing(null)
    setName('')
    setSlug('')
    setDescription('')
    setSlugEdited(false)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const input = {
      name: name.trim(),
      slug: slug || undefined,
      description: description || undefined,
    }
    try {
      if (editing) await update.mutateAsync({ ...input, id: editing.id })
      else await create.mutateAsync(input)
      toast.success(t('providers.saved'))
      reset()
    } catch (error) {
      toast.apiError(error, t('providers.saveFailed'))
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t('providers.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('providers.subtitle')}
        </p>
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(280px,3fr)_minmax(0,7fr)]">
        <form
          onSubmit={submit}
          className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {editing ? t('providers.edit') : t('providers.new')}
          </h2>
          <div className="mt-5 space-y-4">
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">{t('providers.name')}</span>
              <Input
                required
                value={name}
                onChange={(event) => {
                  const value = event.target.value
                  setName(value)
                  if (!slugEdited) setSlug(slugify(value))
                }}
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Slug</span>
              <Input
                value={slug}
                onChange={(event) => {
                  setSlugEdited(true)
                  setSlug(slugify(event.target.value))
                }}
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">
                {t('providers.parentCategory')}
              </span>
              <Input value={t('providers.title')} disabled />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">{t('providers.description')}</span>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-24"
              />
            </label>
            <Button
              type="submit"
              disabled={create.isPending || update.isPending}
              className="w-full"
            >
              <Plus className="mr-2 size-4" />
              {editing ? t('providers.save') : t('providers.create')}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={reset}
              >
                {t('providers.cancel')}
              </Button>
            )}
          </div>
        </form>
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">{t('providers.list')}</h2>
              <p className="text-sm text-slate-500">
                {t('providers.listSubtitle')}
              </p>
            </div>
            <span className="text-sm text-slate-500">
              {query.data?.length ?? 0}
            </span>
          </div>
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('providers.search')}
            />
          </div>
          {query.isLoading ? (
            <p className="py-10 text-center text-sm text-slate-500">
              {t('providers.loading')}
            </p>
          ) : query.isError ? (
            <p className="py-10 text-center text-sm text-red-500">
              {t('providers.loadFailed')}
            </p>
          ) : query.data?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-xs text-slate-500">
                  <tr>
                    <th className="px-3 py-3">{t('providers.name')}</th>
                    <th className="px-3 py-3">Slug</th>
                    <th className="px-3 py-3">{t('providers.description')}</th>
                    <th className="px-3 py-3 text-right">
                      {t('providers.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-slate-50 dark:bg-slate-800/40">
                    <td className="px-3 py-3 font-semibold text-slate-800 dark:text-slate-100">
                      {t('providers.title')}
                    </td>
                    <td className="px-3 py-3 text-slate-500">/nha-cung-cap</td>
                    <td className="px-3 py-3 text-slate-500">
                      {t('providers.rootDescription')}
                    </td>
                    <td className="px-3 py-3" />
                  </tr>
                  {query.data.map((provider) => (
                    <tr key={provider.id} className="border-b last:border-0">
                      <td className="py-3 pl-8 pr-3 font-semibold">
                        <span className="mr-2 text-slate-400">↳</span>
                        {provider.name}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        /{provider.slug}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {provider.description || '—'}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditing(provider)}
                            aria-label={t('providers.edit')}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-500"
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  t('providers.confirmDelete', {
                                    name: provider.name,
                                  }),
                                )
                              )
                                return
                              try {
                                await remove.mutateAsync(provider.id)
                                toast.success(t('providers.deleted'))
                              } catch (error) {
                                toast.apiError(
                                  error,
                                  t('providers.deleteFailed'),
                                )
                              }
                            }}
                            aria-label={t('providers.delete')}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">
              {t('providers.empty')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
