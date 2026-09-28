import { Database, Eye, Globe2, HardDrive, Server, Wifi } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { HostingCard } from './HostingFormUi'
import type { HostingFormDraft } from './hostingFormTypes'

export function HostingPreviewSection({ form, isEdit = false }: { form: HostingFormDraft; isEdit?: boolean }) {
  const { t } = useTranslation('catalog')
  const price = Number(form.defaultPrice || 0).toLocaleString('vi-VN')
  const resources = [
    {
      icon: HardDrive,
      label: `${form.storageGb || 0} ${form.storageUnit} ${t('hosting.new.storage')}`,
    },
    {
      icon: Wifi,
      label:
        form.bandwidthGb === '-1'
          ? t('hosting.new.unlimitedBandwidth')
          : `${form.bandwidthGb || 0} ${form.bandwidthUnit} ${t('hosting.new.bandwidth')}`,
    },
    {
      icon: Globe2,
      label:
        form.websites === '-1'
          ? t('hosting.new.unlimitedWebsites')
          : `${form.websites || 0} ${t('hosting.new.websites')}`,
    },
    {
      icon: Database,
      label:
        form.databases === '-1'
          ? t('hosting.new.unlimitedDatabases')
          : `${form.databases || 0} ${t('hosting.new.databases')}`,
    },
  ]

  return (
    <HostingCard icon={Eye} title={t('hosting.new.preview')}>
      <div className="rounded-lg border border-[#dce7f5] bg-[#f9fbff] p-4 text-[#11184c]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eaf3ff]">
            {form.imageUrl ? (
              <img
                src={form.imageUrl}
                alt={form.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Server className="size-7 text-blue-600" />
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-1">
            {form.featured && (
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                {t('hosting.new.featured')}
              </span>
            )}
            {form.status === 'DRAFT' && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {t('hosting.new.hidden')}
              </span>
            )}
          </div>
        </div>
        <h3 className="break-words text-lg font-bold">
          {form.name || t('hosting.new.unnamedPackage')}
        </h3>
        <p className="mt-1 break-words text-sm leading-relaxed text-[#667a9b]">
          {form.description || t('hosting.new.description')}
        </p>
        <p className="mt-3 text-xl font-bold text-blue-600">
          {price} đ
          <span className="text-sm font-medium">/{t('hosting.monthly')}</span>
        </p>
        <ul className="mt-4 space-y-2 border-t border-[#e0e9f6] pt-4">
          {resources.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-sm">
              <Icon className="size-4 shrink-0 text-blue-600" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
        {form.tags.trim() && (
          <div className="mt-4 flex flex-wrap gap-1">
            {form.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
              .map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                >
                  {tag}
                </span>
              ))}
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-[#6a7d9f]">
        {t(isEdit ? 'hosting.edit.previewHint' : 'hosting.new.previewHint')}
      </p>
    </HostingCard>
  )
}
