import { Eye, Globe2, ShieldCheck, UserRound, KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ViaCard } from './ViaFormUi'
import type { ViaFormDraft } from './viaFormTypes'

export function ViaPreviewSection({
  form,
  isEdit,
}: {
  form: ViaFormDraft
  isEdit: boolean
}) {
  const { t, i18n } = useTranslation('catalog')
  const price = Number(form.defaultPrice || 0).toLocaleString(i18n.language)
  return (
    <ViaCard icon={Eye} title={t('via.new.preview')}>
      <div className="rounded-lg border border-[#dce7f5] bg-[#f9fbff] p-4 text-[#11184c]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <span className="flex size-12 items-center justify-center rounded-lg bg-blue-600 text-white">
            <UserRound className="size-7" />
          </span>
          {form.status !== 'ACTIVE' && (
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {t(form.status === 'DRAFT' ? 'via.draft' : 'via.archived')}
            </span>
          )}
        </div>
        <h3 className="break-words text-lg font-bold">
          {form.name || t('via.new.unnamedPackage')}
        </h3>
        <p className="mt-1 break-words text-sm leading-relaxed text-[#667a9b]">
          {form.description || t('via.new.description')}
        </p>
        <p className="mt-3 text-xl font-bold text-blue-600">
          {price} đ
          <span className="text-sm font-medium">/{t('via.account')}</span>
        </p>
        <ul className="mt-4 space-y-2 border-t border-[#e0e9f6] pt-4 text-sm">
          <li className="flex items-center gap-2">
            <UserRound className="size-4 shrink-0 text-blue-600" />
            {t(`via.options.platform.${form.platform}`)} ·{' '}
            {t(`via.options.accountType.${form.accountType}`)}
          </li>
          <li className="flex items-center gap-2">
            <Globe2 className="size-4 shrink-0 text-blue-600" />
            {t(`via.options.country.${form.country}`)}
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-blue-600" />
            {t(`via.options.verification.${form.verification}`)} ·{' '}
            {t(`via.options.twoFactor.${form.twoFactor}`)}
          </li>
          <li className="flex items-center gap-2">
            <KeyRound className="size-4 shrink-0 text-blue-600" />
            {t(`via.options.accountAge.${form.accountAge}`)} ·{' '}
            {form.warrantyDays} {t('via.days')}
          </li>
        </ul>
      </div>
      <p className="mt-2 text-xs text-[#6a7d9f]">
        {t(isEdit ? 'via.edit.previewHint' : 'via.new.previewHint')}
      </p>
    </ViaCard>
  )
}
