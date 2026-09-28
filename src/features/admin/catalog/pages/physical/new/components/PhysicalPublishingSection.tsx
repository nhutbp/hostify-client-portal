import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ImageIcon, Settings2, Server } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CatalogImageMediaPicker } from '@/features/admin/catalog/components/CatalogImageMediaPicker'
import {
  PhysicalCard,
  PhysicalField,
  physicalInputClass,
} from './PhysicalFormUi'
import type { PhysicalFormDraft } from './physicalFormTypes'

export function PhysicalPublishingSection({
  form,
  update,
  isSaving,
  canSave,
  initialPackageId,
}: {
  form: PhysicalFormDraft
  update: (patch: Partial<PhysicalFormDraft>) => void
  isSaving: boolean
  canSave: boolean
  initialPackageId?: string
}) {
  const { t } = useTranslation('catalog')
  const [pickerOpen, setPickerOpen] = useState(false)
  return (
    <PhysicalCard icon={Settings2} title={t('physical.new.publishing')}>
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#11184c]">
            {t('physical.status')}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="physical-status"
                checked={form.status === 'ACTIVE'}
                onChange={() => update({ status: 'ACTIVE' })}
              />
              {t('physical.active')}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="physical-status"
                checked={form.status === 'DRAFT'}
                onChange={() => update({ status: 'DRAFT' })}
              />
              {t('physical.draft')}
            </label>
            {initialPackageId && (
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="physical-status"
                  checked={form.status === 'ARCHIVED'}
                  onChange={() => update({ status: 'ARCHIVED' })}
                />
                {t('physical.archived')}
              </label>
            )}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-[#11184c]">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => update({ featured: event.target.checked })}
          />
          {t('physical.new.featured')}
        </label>
        <PhysicalField
          name="displayOrder"
          label={t('physical.new.displayOrder')}
        >
          <input
            id="displayOrder"
            name="displayOrder"
            type="number"
            min="0"
            className={physicalInputClass}
            value={form.displayOrder}
            onChange={(event) => update({ displayOrder: event.target.value })}
          />
        </PhysicalField>
        <div>
          <p className="mb-2 text-sm font-semibold text-[#11184c]">
            {t('physical.new.image')}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-md bg-blue-50">
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt={form.name}
                  className="size-full object-cover"
                />
              ) : (
                <Server className="size-10 text-blue-600" />
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-[#d5e1f2] px-2.5 text-sm text-blue-700"
              >
                <ImageIcon className="size-4" />
                {t('physical.new.changeImage')}
              </button>
              {form.imageUrl && (
                <button
                  type="button"
                  onClick={() => update({ imageUrl: '' })}
                  className="rounded-md border border-red-100 bg-red-50 px-2.5 text-sm text-red-600"
                >
                  {t('physical.new.removeImage')}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 border-t border-slate-100 pt-4">
          <Link
            to={
              initialPackageId
                ? '/admin/dashboard/catalog/physical/$id'
                : '/admin/dashboard/catalog/physical'
            }
            params={initialPackageId ? { id: initialPackageId } : undefined}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-[#d5e1f2] px-3 text-sm font-medium"
          >
            {t('physical.new.cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSaving || !canSave}
            className="h-10 flex-1 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving
              ? t('physical.new.saving')
              : t(
                  initialPackageId ? 'physical.edit.save' : 'physical.new.save',
                )}
          </button>
        </div>
      </div>
      <CatalogImageMediaPicker
        open={pickerOpen}
        title={t('physical.new.image')}
        closeLabel={t('physical.new.close')}
        onClose={() => setPickerOpen(false)}
        onSelect={(imageUrl) => update({ imageUrl })}
      />
    </PhysicalCard>
  )
}
