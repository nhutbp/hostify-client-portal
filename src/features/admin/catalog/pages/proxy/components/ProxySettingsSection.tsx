import { Link } from '@tanstack/react-router'
import { Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProxyCard } from './ProxyFormUi'
import type { ProxyFormDraft } from './proxyFormTypes'

export function ProxySettingsSection({
  form,
  update,
  isSaving,
  canSave,
  initialPackageId,
}: {
  form: ProxyFormDraft
  update: (patch: Partial<ProxyFormDraft>) => void
  isSaving: boolean
  canSave: boolean
  initialPackageId?: string
}) {
  const { t } = useTranslation('catalog')
  return (
    <ProxyCard icon={Settings2} title={t('proxy.new.packageSettings')}>
      <p className="mb-2 text-sm font-semibold text-[#11184c]">
        {t('proxy.status')}
      </p>
      <div className="flex flex-wrap gap-4 text-sm text-[#11184c]">
        {(
          [
            'ACTIVE',
            'DRAFT',
            ...(initialPackageId ? ['ARCHIVED'] : []),
          ] as ProxyFormDraft['status'][]
        ).map((status) => (
          <label key={status} className="flex items-center gap-2">
            <input
              type="radio"
              name="proxy-status"
              checked={form.status === status}
              onChange={() => update({ status })}
            />
            {t(
              status === 'ACTIVE'
                ? 'proxy.active'
                : status === 'DRAFT'
                  ? 'proxy.draft'
                  : 'proxy.archived',
            )}
          </label>
        ))}
      </div>
      <div className="mt-5 flex gap-2 border-t border-[#e7edf7] pt-4">
        <Link
          to={
            initialPackageId
              ? '/admin/dashboard/catalog/proxy/$id'
              : '/admin/dashboard/catalog/proxy'
          }
          params={initialPackageId ? { id: initialPackageId } : undefined}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-[#d5e1f2] bg-white px-4 text-sm font-medium text-[#11184c]"
        >
          {t('proxy.new.cancel')}
        </Link>
        <button
          type="submit"
          disabled={isSaving || !canSave}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving
            ? t('proxy.new.saving')
            : t(initialPackageId ? 'proxy.edit.save' : 'proxy.new.save')}
        </button>
      </div>
    </ProxyCard>
  )
}
