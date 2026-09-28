import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { VpsServerIllustration } from './VpsServerIllustration'
import { vpsInputClass } from './VpsFormFields'

type Props = {
  name: string
  status: 'ACTIVE' | 'DRAFT'
  featured: boolean
  displayOrder: string
  imageUrl: string
  isSaving: boolean
  onStatusChange: (status: 'ACTIVE' | 'DRAFT') => void
  onFeaturedChange: (featured: boolean) => void
  onDisplayOrderChange: (value: string) => void
  onChangeImage: () => void
  onRemoveImage: () => void
  onCancel: () => void
  onSaveDraft: () => void
  onSave: () => void
  isEdit: boolean
}

export function VpsPublishingSection({
  name,
  status,
  featured,
  displayOrder,
  imageUrl,
  isSaving,
  onStatusChange,
  onFeaturedChange,
  onDisplayOrderChange,
  onChangeImage,
  onRemoveImage,
  onCancel,
  onSaveDraft,
  onSave,
  isEdit,
}: Props) {
  const { t } = useTranslation('catalog')

  return (
    <section className="vps-create-section">
      <h2 className="mb-4 text-[15px] font-bold text-[#101945]">
        {t('vps.form.publishSettings')}
      </h2>
      <div className="space-y-4">
        <div>
          <p className="mb-1 text-xs font-medium">{t('vps.form.status')}</p>
          <div className="flex gap-5 text-xs">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="vps-status"
                checked={status === 'ACTIVE'}
                onChange={() => onStatusChange('ACTIVE')}
              />
              {t('vps.form.visible')}
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="vps-status"
                checked={status === 'DRAFT'}
                onChange={() => onStatusChange('DRAFT')}
              />
              {t('vps.form.hidden')}
            </label>
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium">{t('vps.form.featured')}</p>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              className="sr-only"
              checked={featured}
              onChange={(event) => onFeaturedChange(event.target.checked)}
            />
            <span className="vps-create-switch" data-on={featured} />
            {t('vps.form.showOnHome')}
          </label>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="vps-display-order" className="w-24 shrink-0 text-xs">
            {t('vps.form.displayOrder')}
          </label>
          <input
            id="vps-display-order"
            className={vpsInputClass}
            type="number"
            min="0"
            value={displayOrder}
            onChange={(event) => onDisplayOrderChange(event.target.value)}
          />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium">{t('vps.form.image')}</p>
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex h-[72px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#eaf3ff]">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <VpsServerIllustration />
              )}
            </div>
            <div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={onChangeImage}
                  className="h-[30px] rounded-[5px] border border-[#d6e2f6] px-2.5 text-xs text-[#073b9e]"
                >
                  {t('vps.form.changeImage')}
                </button>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={onRemoveImage}
                    className="h-[30px] rounded-[5px] border border-[#f9d8dd] bg-[#fff8f9] px-3 text-xs text-red-500"
                  >
                    {t('vps.form.removeImage')}
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[10px] leading-4 text-[#607397]">
                {t('vps.form.imageFormatHint')}
                <br />
                {t('vps.form.imageSizeHint')}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-[#e6edf8] pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-[6px] border border-[#d6e2f6] text-xs text-[#194181]"
          >
            {t('vps.form.cancel')}
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onSaveDraft}
            className="h-10 rounded-[6px] border border-[#d6e2f6] text-xs text-[#194181] disabled:opacity-50"
          >
            {t('vps.form.saveDraft')}
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="col-span-2 h-10 rounded-[6px] bg-[#075bea] px-3 text-xs font-medium text-white disabled:opacity-50"
          >
            {isSaving && (
              <Loader2 className="mr-1 inline size-3 animate-spin" />
            )}
            {t(isEdit ? 'vps.form.update' : 'vps.form.next')}{' '}
            <span className="ml-1">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
