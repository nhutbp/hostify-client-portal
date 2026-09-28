import { Link } from '@tanstack/react-router'
import { Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ViaCard } from './ViaFormUi'
import type { ViaFormDraft } from './viaFormTypes'

export function ViaSettingsSection({
  form,
  update,
  isSaving,
  canSave,
  initialPackageId,
}: {
  form: ViaFormDraft
  update: (patch: Partial<ViaFormDraft>) => void
  isSaving: boolean
  canSave: boolean
  initialPackageId?: string
}) {
  const { t } = useTranslation('catalog')
  return (
    <ViaCard icon={Settings2} title={t('via.new.packageSettings')}>
      <p className="mb-2 text-sm font-semibold text-[#11184c]">
        {t('via.status')}
      </p>
      <div className="flex flex-wrap gap-4 text-sm text-[#11184c]">
        {(
          [
            'ACTIVE',
            'DRAFT',
            ...(initialPackageId ? ['ARCHIVED'] : []),
          ] as ViaFormDraft['status'][]
        ).map((status) => (
          <label key={status} className="flex items-center gap-2">
            <input
              type="radio"
              name="via-status"
              checked={form.status === status}
              onChange={() => update({ status })}
            />
            {t(
              status === 'ACTIVE'
                ? 'via.active'
                : status === 'DRAFT'
                  ? 'via.draft'
                  : 'via.archived',
            )}
          </label>
        ))}
      </div>
      <div className="mt-5 flex gap-2 border-t border-[#e7edf7] pt-4">
        <Link
          to={
            initialPackageId
              ? '/dashboard/catalog/via/$id'
              : '/dashboard/catalog/via'
          }
          params={initialPackageId ? { id: initialPackageId } : undefined}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-[#d5e1f2] bg-white px-4 text-sm font-medium text-[#11184c]"
        >
          {t('via.new.cancel')}
        </Link>
        <button
          type="submit"
          disabled={isSaving || !canSave}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving
            ? t('via.new.saving')
            : t(initialPackageId ? 'via.edit.save' : 'via.new.save')}
        </button>
      </div>
    </ViaCard>
  )
}
