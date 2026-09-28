import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ImageIcon, Server, Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CatalogImageMediaPicker } from '@/features/admin/catalog/components/CatalogImageMediaPicker'
import { HostingCard, hostingInputClass } from './HostingFormUi'
import type { HostingFormDraft } from './hostingFormTypes'

type Props = {
  form: HostingFormDraft
  update: (patch: Partial<HostingFormDraft>) => void
  isSaving: boolean
  canSave: boolean
  initialPackageId?: string
}

export function HostingSettingsSection({
  form,
  update,
  isSaving,
  canSave,
  initialPackageId,
}: Props) {
  const { t } = useTranslation('catalog')
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)

  return (
    <HostingCard icon={Settings2} title={t('hosting.new.packageSettings')}>
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#11184c]">
            {t('hosting.new.status')}
          </p>
          <div className="flex gap-5 text-sm text-[#11184c]">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="hosting-status"
                checked={form.status === 'ACTIVE'}
                onChange={() => update({ status: 'ACTIVE' })}
              />
              {t('hosting.new.visible')}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="hosting-status"
                checked={form.status === 'DRAFT'}
                onChange={() => update({ status: 'DRAFT' })}
              />
              {t('hosting.new.hidden')}
            </label>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-[#11184c]">
            {t('hosting.new.featured')}
          </p>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#11184c]">
            <input
              type="checkbox"
              className="sr-only"
              checked={form.featured}
              onChange={(event) => update({ featured: event.target.checked })}
            />
            <span className="hosting-switch" data-on={form.featured} />
            {t('hosting.new.showOnHome')}
          </label>
        </div>
        <div className="hosting-labeled-row">
          <label htmlFor="hosting-display-order">
            {t('hosting.new.displayOrder')}
          </label>
          <input
            id="hosting-display-order"
            type="number"
            min="0"
            className={hostingInputClass}
            value={form.displayOrder}
            onChange={(event) => update({ displayOrder: event.target.value })}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-[#11184c]">
            {t('hosting.new.image')}
          </p>
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#eaf3ff]">
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt={form.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Server className="size-10 text-blue-600" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-[#d5e1f2] px-2.5 text-sm text-blue-700"
                >
                  <ImageIcon className="size-4" />
                  {t('hosting.new.changeImage')}
                </button>
                {form.imageUrl && (
                  <button
                    type="button"
                    onClick={() => update({ imageUrl: '' })}
                    className="h-9 rounded-md border border-red-100 bg-red-50 px-2.5 text-sm text-red-600"
                  >
                    {t('hosting.new.removeImage')}
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-xs text-[#6a7d9f]">
                {t('hosting.new.imageHint')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 border-t border-[#e7edf7] pt-4">
          <Link
            to={
              initialPackageId
                ? '/admin/dashboard/catalog/hosting/$id'
                : '/admin/dashboard/catalog/hosting'
            }
            params={initialPackageId ? { id: initialPackageId } : undefined}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-[#d5e1f2] bg-white px-4 text-sm font-medium text-[#11184c]"
          >
            {t('hosting.new.cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSaving || !canSave}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving
              ? t('hosting.new.saving')
              : t(initialPackageId ? 'hosting.edit.save' : 'hosting.new.save')}
          </button>
        </div>
      </div>
      <CatalogImageMediaPicker
        open={mediaPickerOpen}
        title={t('hosting.new.image')}
        closeLabel={t('hosting.new.close')}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(imageUrl) => update({ imageUrl })}
      />
    </HostingCard>
  )
}
