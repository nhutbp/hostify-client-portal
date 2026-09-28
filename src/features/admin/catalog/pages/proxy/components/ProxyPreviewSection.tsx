import { Eye, Globe2, Network, Radio, Wifi } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProxyCard } from './ProxyFormUi'
import type { ProxyFormDraft } from './proxyFormTypes'

export function ProxyPreviewSection({
  form,
  isEdit,
}: {
  form: ProxyFormDraft
  isEdit: boolean
}) {
  const { t, i18n } = useTranslation('catalog')
  const price = Number(form.defaultPrice || 0).toLocaleString(i18n.language)
  return (
    <ProxyCard icon={Eye} title={t('proxy.new.preview')}>
      <div className="rounded-lg border border-[#dce7f5] bg-[#f9fbff] p-4 text-[#11184c]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <span className="flex size-12 items-center justify-center rounded-lg bg-[#eaf3ff]">
            <Network className="size-7 text-blue-600" />
          </span>
          {form.status !== 'ACTIVE' && (
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {t(form.status === 'DRAFT' ? 'proxy.draft' : 'proxy.archived')}
            </span>
          )}
        </div>
        <h3 className="break-words text-lg font-bold">
          {form.name || t('proxy.new.unnamedPackage')}
        </h3>
        <p className="mt-1 break-words text-sm leading-relaxed text-[#667a9b]">
          {form.description || t('proxy.new.description')}
        </p>
        <p className="mt-3 text-xl font-bold text-blue-600">
          {price} đ
          <span className="text-sm font-medium">/{t('proxy.monthly')}</span>
        </p>
        <ul className="mt-4 space-y-2 border-t border-[#e0e9f6] pt-4 text-sm">
          <li className="flex items-center gap-2">
            <Network className="size-4 shrink-0 text-blue-600" />
            {t(`proxy.types.${form.proxyType}`)}
          </li>
          <li className="flex items-center gap-2">
            <Globe2 className="size-4 shrink-0 text-blue-600" />
            {t(`proxy.countries.${form.country}`)}
          </li>
          <li className="flex items-center gap-2">
            <Radio className="size-4 shrink-0 text-blue-600" />
            {t(`proxy.modes.${form.ipMode}`)} ·{' '}
            {form.protocols.join(', ') || '—'}
          </li>
          <li className="flex items-center gap-2">
            <Wifi className="size-4 shrink-0 text-blue-600" />
            {form.bandwidthGb === '-1'
              ? t('proxy.unlimited')
              : `${form.bandwidthGb} GB`}{' '}
            · {form.concurrentConnections} {t('proxy.new.connections')}
          </li>
        </ul>
      </div>
      <p className="mt-2 text-xs text-[#6a7d9f]">
        {t(isEdit ? 'proxy.edit.previewHint' : 'proxy.new.previewHint')}
      </p>
    </ProxyCard>
  )
}
