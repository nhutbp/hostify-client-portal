import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Cpu,
  Gauge,
  HardDrive,
  Info,
  Loader2,
  MemoryStick,
  Plus,
  Server,
  Trash2,
} from 'lucide-react'
import type { CreateVpsPackageInput } from '../../services/vpsService'
import {
  useCreateVpsPackage,
  useVpsPackageLookups,
} from '../../hooks/useVpsPackage'
import type { VpsPlan } from '../../types/vps'
import { toast } from '@/utils/toast'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { VpsServerIllustration } from './VpsServerIllustration'
import { Field, NumberControl, Section, vpsInputClass } from './VpsFormFields'
import { vpsOperatingSystems } from '../../data/operatingSystems'
import { CatalogImageMediaPicker } from '../CatalogImageMediaPicker'

const inputClass = vpsInputClass
type Period = {
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'YEARLY'
  label: string
  amount: string
  discount: string
}
const periodsDefault: Period[] = [
  {
    billingCycle: 'MONTHLY',
    label: '1 Tháng',
    amount: '299000',
    discount: '-',
  },
  {
    billingCycle: 'QUARTERLY',
    label: '3 Tháng',
    amount: '850000',
    discount: '-5%',
  },
  {
    billingCycle: 'SEMI_ANNUAL',
    label: '6 Tháng',
    amount: '1600000',
    discount: '-10%',
  },
  {
    billingCycle: 'YEARLY',
    label: '12 Tháng',
    amount: '2800000',
    discount: '-15%',
  },
]
export function VpsPackageForm({ initialPlan }: { initialPlan?: VpsPlan }) {
  const { t } = useTranslation('catalog')
  const navigate = useNavigate()
  const lookups = useVpsPackageLookups()
  const createPackage = useCreateVpsPackage()
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const [form, setForm] = useState({
    name: initialPlan?.name ?? t('vps.form.defaultName'),
    description: initialPlan?.description ?? t('vps.form.defaultDescription'),
    content: '',
    providerId: '',
    providerCategoryId: '',
    datacenterIds: [] as string[],
    cpu: '4',
    ramGb: '8',
    diskGb: '100',
    diskType: 'NVMe SSD',
    operatingSystem: vpsOperatingSystems[0] as string,
    bandwidth: t('vps.form.unlimited'),
    ipCount: '1',
    status: 'ACTIVE' as 'DRAFT' | 'ACTIVE',
    featured: true,
    displayOrder: '0',
    tags: t('vps.form.tagValue'),
    imageUrl: '',
  })
  const [periods, setPeriods] = useState(periodsDefault)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'os' | 'location'>('os')
  const [tagDraft, setTagDraft] = useState('')
  const setValue = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((current) => ({ ...current, [key]: value }))
  useEffect(() => {
    const provider = lookups.data?.providers[0]
    if (provider && !form.providerId) setValue('providerId', provider.id)
  }, [lookups.data?.providers, form.providerId])
  useEffect(() => {
    if (form.providerId && form.datacenterIds.length === 0) {
      const initial =
        lookups.data?.datacenters
          .filter((item) => item.providerId === form.providerId)
          .slice(0, 2)
          .map((item) => item.id) ?? []
      if (initial.length) setValue('datacenterIds', initial)
    }
  }, [form.providerId, lookups.data?.datacenters])
  const datacenters =
    lookups.data?.datacenters.filter(
      (item) => !form.providerId || item.providerId === form.providerId,
    ) ?? []
  const updatePeriod = (
    index: number,
    key: 'amount' | 'discount',
    value: string,
  ) =>
    setPeriods((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: key === 'amount' ? value.replace(/\D/g, '') : value,
            }
          : item,
      ),
    )
  const formatMoney = (value: string | number) =>
    Number(value || 0).toLocaleString('en-US')
  const periodLabel = (cycle: Period['billingCycle']) =>
    t(
      `vps.form.${({ MONTHLY: 'cycleMonth', QUARTERLY: 'cycleQuarter', SEMI_ANNUAL: 'cycleHalfYear', YEARLY: 'cycleYear' } as const)[cycle]}`,
    )
  const addPeriod = () => {
    const next = periodsDefault.find(
      (item) =>
        !periods.some((period) => period.billingCycle === item.billingCycle),
    )
    if (next)
      setPeriods((items) =>
        [...items, next].sort(
          (a, b) =>
            periodsDefault.findIndex(
              (item) => item.billingCycle === a.billingCycle,
            ) -
            periodsDefault.findIndex(
              (item) => item.billingCycle === b.billingCycle,
            ),
        ),
      )
  }
  const toggleDatacenter = (id: string) => {
    const chosen = lookups.data?.datacenters.find((item) => item.id === id)
    if (chosen && chosen.providerId !== form.providerId) {
      setForm((current) => ({
        ...current,
        providerId: chosen.providerId,
        datacenterIds: [id],
      }))
      return
    }
    setValue(
      'datacenterIds',
      form.datacenterIds.includes(id)
        ? form.datacenterIds.filter((item) => item !== id)
        : [...form.datacenterIds, id],
    )
  }
  const removeTag = (value: string) =>
    setValue(
      'tags',
      form.tags
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item && item !== value)
        .join(', '),
    )
  const addTag = () => {
    const next = tagDraft.trim()
    if (next) {
      setValue(
        'tags',
        [
          ...form.tags
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          next,
        ].join(', '),
      )
      setTagDraft('')
    }
  }
  const submit = async (status: 'DRAFT' | 'ACTIVE') => {
    setError('')
    if (!form.providerCategoryId) {
      setError(t('vps.form.selectProvider'))
      return
    }
    const input: CreateVpsPackageInput = {
      name: form.name,
      description: form.description,
      content: form.content,
      status,
      featured: form.featured,
      displayOrder: Number(form.displayOrder),
      tags: form.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      imageUrl: form.imageUrl || null,
      cpu: Number(form.cpu),
      ramGb: Number(form.ramGb),
      diskGb: Number(form.diskGb),
      diskType: form.diskType,
      operatingSystem: form.operatingSystem,
      bandwidth:
        form.bandwidth === t('vps.form.unlimited')
          ? 'UNLIMITED'
          : form.bandwidth,
      ipCount: Number(form.ipCount),
      providerCategoryId: form.providerCategoryId,
      datacenterIds: form.datacenterIds.length
        ? form.datacenterIds
        : datacenters.slice(0, 1).map((item) => item.id),
      billingPrices: periods.map((item) => ({
        billingCycle: item.billingCycle,
        amount: Number(item.amount),
        discountPercent: Number(item.discount.replace(/[^0-9]/g, '')) || 0,
      })),
    }
    try {
      await createPackage.mutateAsync(input)
      toast.success(t('vps.form.created'))
      await navigate({ to: '/dashboard/catalog/vps' })
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : t('vps.form.createFailed'),
      )
    }
  }
  const rows = [
    { icon: Cpu, value: `${form.cpu} vCPU` },
    { icon: MemoryStick, value: `${form.ramGb} GB RAM` },
    { icon: HardDrive, value: `${form.diskGb} GB ${form.diskType}` },
    {
      icon: Gauge,
      value:
        form.bandwidth === t('vps.form.unlimited')
          ? t('vps.form.previewBandwidth')
          : `${form.bandwidth} Mbps`,
    },
    {
      icon: Server,
      value: t('vps.form.previewIp', { count: Number(form.ipCount) }),
    },
  ]
  const datacenterOrder = ['VN-HN', 'VN-HCM', 'SG-1', 'JP-1', 'US-1', 'DE-FRA']
  const allDatacenters = [...(lookups.data?.datacenters ?? [])].sort(
    (a, b) => datacenterOrder.indexOf(a.code) - datacenterOrder.indexOf(b.code),
  )
  const flags: Record<string, string> = {
    VN: '🇻🇳',
    SG: '🇸🇬',
    JP: '🇯🇵',
    US: '🇺🇸',
    DE: '🇩🇪',
  }
  return (
    <div className="text-[#101945]">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="vps-create-grid">
        <div className="min-w-0 space-y-2.5">
          <Section
            number={1}
            title={t('vps.form.sectionBasic')}
            className="min-h-[308px]"
          >
            <div className="vps-basic-columns">
              <div className="space-y-3">
                <div className="vps-labeled-row">
                  <label htmlFor="vps-name">
                    {t('vps.form.name')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="vps-name"
                      className={inputClass}
                      maxLength={100}
                      value={form.name}
                      onChange={(event) => setValue('name', event.target.value)}
                    />
                    <span className="absolute bottom-0.5 right-2 text-[10px] text-[#7182a4]">
                      {form.name.length}/100
                    </span>
                  </div>
                </div>
                <div className="vps-labeled-row">
                  <label htmlFor="vps-description">
                    {t('vps.form.shortDescription')}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="vps-description"
                      className="h-[65px] w-full resize-none rounded-[5px] border bg-white px-2.5 py-2 text-xs"
                      maxLength={200}
                      value={form.description}
                      onChange={(event) =>
                        setValue('description', event.target.value)
                      }
                    />
                    <span className="absolute bottom-2 right-2 text-[10px] text-[#7182a4]">
                      {form.description.length}/200
                    </span>
                  </div>
                </div>
                <div className="vps-labeled-row">
                  <label htmlFor="vps-tags">{t('vps.form.tag')}</label>
                  <div className="min-h-[57px] rounded-[5px] border border-[#d6e2f6] px-1.5 py-1">
                    <div className="flex flex-wrap gap-1">
                      {form.tags
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean)
                        .map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="rounded bg-[#e9f3ff] px-1.5 py-0.5 text-[11px] text-[#0054d7]"
                          >
                            {tag} ×
                          </button>
                        ))}
                    </div>
                    <input
                      id="vps-tags"
                      list="vps-tag-suggestions"
                      className="mt-1 h-4 w-full border-0 bg-transparent px-1 text-[11px] outline-none"
                      placeholder={t('vps.form.tagPlaceholder')}
                      value={tagDraft}
                      onChange={(event) => setTagDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addTag()
                        }
                      }}
                      onBlur={addTag}
                    />
                    <datalist id="vps-tag-suggestions">
                      {lookups.data?.tags.map((tag) => (
                        <option key={tag.id} value={tag.name} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-xs">{t('vps.form.status')}</p>
                  <div className="flex gap-5 text-xs">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        checked={form.status === 'ACTIVE'}
                        onChange={() => setValue('status', 'ACTIVE')}
                        name="status"
                      />
                      {t('vps.form.visible')}
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        checked={form.status === 'DRAFT'}
                        onChange={() => setValue('status', 'DRAFT')}
                        name="status"
                      />
                      {t('vps.form.hidden')}
                    </label>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs">{t('vps.form.featured')}</p>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.featured}
                      onChange={(event) =>
                        setValue('featured', event.target.checked)
                      }
                    />
                    <span
                      className="vps-create-switch"
                      data-on={form.featured}
                    />
                    {t('vps.form.showOnHome')}
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="vps-display-order"
                    className="w-24 shrink-0 text-xs"
                  >
                    {t('vps.form.displayOrder')}
                  </label>
                  <input
                    id="vps-display-order"
                    className={inputClass}
                    type="number"
                    min="0"
                    value={form.displayOrder}
                    onChange={(event) =>
                      setValue('displayOrder', event.target.value)
                    }
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs">{t('vps.form.image')}</p>
                  <div className="flex items-start gap-3">
                    <div className="flex h-[72px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#eaf3ff]">
                      {form.imageUrl ? (
                        <img
                          src={form.imageUrl}
                          alt={form.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <VpsServerIllustration />
                      )}
                    </div>
                    <div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setMediaPickerOpen(true)}
                          className="h-[30px] rounded-[5px] border border-[#d6e2f6] px-2.5 text-xs text-[#073b9e]"
                        >
                          {t('vps.form.changeImage')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue('imageUrl', '')}
                          className="h-[30px] rounded-[5px] border border-[#f9d8dd] bg-[#fff8f9] px-3 text-xs text-red-500"
                        >
                          {t('vps.form.removeImage')}
                        </button>
                      </div>
                      <p className="mt-1.5 text-[10px] leading-4 text-[#607397]">
                        {t('vps.form.imageFormatHint')}
                        <br />
                        {t('vps.form.imageSizeHint')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-[#26385c]">
                {t('vps.form.content')}
              </p>
              <TiptapEditor
                content={form.content}
                onChange={(value) => setValue('content', value)}
                placeholder={t('vps.form.contentPlaceholder')}
              />
            </div>
          </Section>
          <Section
            number={2}
            title={t('vps.form.sectionHardware')}
            className="min-h-[156px]"
          >
            <div className="vps-hardware-grid">
              <Field label={t('vps.form.cpu')} required>
                <NumberControl
                  value={form.cpu}
                  onChange={(value) => setValue('cpu', value)}
                  min={1}
                  buttons
                />
              </Field>
              <Field label={t('vps.form.ram')} required>
                <NumberControl
                  value={form.ramGb}
                  onChange={(value) => setValue('ramGb', value)}
                  min={1}
                  unit="GB"
                  buttons
                />
              </Field>
              <Field label={t('vps.form.disk')} required>
                <NumberControl
                  value={form.diskGb}
                  onChange={(value) => setValue('diskGb', value)}
                  min={1}
                  unit="GB"
                  buttons
                />
                <select
                  className={`${inputClass} mt-1`}
                  value={form.diskType}
                  onChange={(event) => setValue('diskType', event.target.value)}
                >
                  <option value="NVMe SSD">NVMe SSD (Hiệu suất cao)</option>
                  <option value="SSD">SSD</option>
                  <option value="HDD">HDD</option>
                </select>
              </Field>
              <Field label={t('vps.form.bandwidth')} required>
                <div className="flex h-[30px] overflow-hidden rounded-[5px] border border-[#d6e2f6] text-xs">
                  <input
                    className="min-w-0 flex-1 px-2.5"
                    value={form.bandwidth}
                    onChange={(event) =>
                      setValue('bandwidth', event.target.value)
                    }
                  />
                  <span className="flex items-center border-l bg-[#f4f8fe] px-2 text-[#53688b]">
                    Mbps
                  </span>
                </div>
              </Field>
              <Field label={t('vps.form.ipCount')} required>
                <input
                  className={inputClass}
                  type="number"
                  min="1"
                  value={form.ipCount}
                  onChange={(event) => setValue('ipCount', event.target.value)}
                />
              </Field>
            </div>
          </Section>
          <Section number={3} title={t('vps.form.sectionPricing')}>
            <div className="vps-pricing-grid">
              <div>
                <Field label={t('vps.form.price')} required>
                  <div className="flex h-[30px] overflow-hidden rounded-[5px] border border-[#d6e2f6]">
                    <input
                      className="min-w-0 flex-1 px-3 text-xs"
                      inputMode="numeric"
                      value={formatMoney(periods[0].amount)}
                      onChange={(event) =>
                        updatePeriod(0, 'amount', event.target.value)
                      }
                    />
                    <span className="flex items-center border-l bg-[#f4f8fe] px-4 text-xs text-[#53688b]">
                      {t('vps.form.priceMonth')}
                    </span>
                  </div>
                </Field>
                <p className="mt-5 text-xs font-medium">
                  {t('vps.form.durationDiscount')}
                </p>
                <div className="mt-1 rounded-md bg-[#eaf4ff] px-3 py-2 text-[11px] leading-4 text-[#31568f]">
                  {t('vps.form.discountHint')}
                </div>
              </div>
              <div className="min-w-0">
                <div className="vps-pricing-table overflow-hidden rounded-md border border-[#d6e2f6]">
                  <div className="vps-pricing-row bg-[#f6f9ff] font-semibold">
                    <span>{t('vps.form.period')}</span>
                    <span>{t('vps.form.amount')}</span>
                    <span>{t('vps.form.discount')}</span>
                    <span>{t('vps.form.afterDiscount')}</span>
                    <span />
                  </div>
                  {periods.map((period, index) => (
                    <div
                      key={period.billingCycle}
                      className="vps-pricing-row border-t border-[#e5edfa]"
                    >
                      <span className="pl-2">
                        {periodLabel(period.billingCycle)}
                      </span>
                      <input
                        className="h-[23px] min-w-0 rounded-[4px] border px-2 text-center"
                        inputMode="numeric"
                        value={formatMoney(period.amount)}
                        onChange={(event) =>
                          updatePeriod(index, 'amount', event.target.value)
                        }
                      />
                      <input
                        className="h-[23px] min-w-0 rounded-[4px] border px-2 text-center"
                        value={period.discount}
                        onChange={(event) =>
                          updatePeriod(index, 'discount', event.target.value)
                        }
                        disabled={index === 0}
                      />
                      <span
                        className={`rounded-[4px] py-1 text-center ${index === 0 || index === 2 || index === 3 ? 'font-semibold text-blue-600' : ''}`}
                      >
                        {formatMoney(
                          Math.round(
                            Number(period.amount) *
                              (1 -
                                (Number(
                                  period.discount.replace(/[^0-9]/g, ''),
                                ) || 0) /
                                  100),
                          ),
                        )}
                      </span>
                      {index > 0 ? (
                        <button
                          type="button"
                          aria-label={`${t('vps.form.removePeriod')} ${periodLabel(period.billingCycle)}`}
                          onClick={() =>
                            setPeriods((items) =>
                              items.filter(
                                (item) =>
                                  item.billingCycle !== period.billingCycle,
                              ),
                            )
                          }
                          className="text-[#61769b]"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      ) : (
                        <span />
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addPeriod}
                  disabled={periods.length === periodsDefault.length}
                  className="ml-3 mt-1 inline-flex h-[26px] items-center gap-1 rounded border border-[#b4cfff] px-3 text-xs text-[#075bea] disabled:opacity-50"
                >
                  <Plus className="size-3" />
                  {t('vps.form.addPeriod')}
                </button>
              </div>
            </div>
          </Section>
          <Section
            number={4}
            title={t('vps.form.sectionProvider')}
            className="vps-provider-section"
          >
            <div>
              <Field label={t('vps.form.defaultProvider')} required>
                <select
                  className={inputClass}
                  value={form.providerCategoryId}
                  onChange={(event) =>
                    setValue('providerCategoryId', event.target.value)
                  }
                >
                  <option value="">{t('vps.form.selectProvider')}</option>
                  {lookups.data?.providerCategories.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </Field>
              <p className="mt-1 text-[10px] text-[#61749b]">
                {t('vps.form.providerHint')}
              </p>
            </div>
          </Section>
        </div>
        <aside className="min-w-0 space-y-2.5">
          <section className="vps-create-section min-h-[295px]">
            <div className="flex items-center justify-between border-b border-[#e4ebf7] pb-2">
              <h2 className="text-[15px] font-bold text-[#101945]">
                {t('vps.form.preview')}
              </h2>
              <button
                type="button"
                className="rounded-[5px] border border-[#d6e2f6] px-2 py-1 text-[11px] text-[#0054d7]"
              >
                {t('vps.form.viewWebsite')}
              </button>
            </div>
            <div className="px-3 pt-3">
              <div className="flex justify-between text-xs text-[#55688c]">
                <span className="flex items-center gap-1.5">
                  <Server className="size-4 text-[#101945]" />
                  <span className="rounded bg-[#eaf3ff] px-1.5 py-0.5">
                    VPS
                  </span>
                </span>
                {form.featured && (
                  <span className="rounded bg-[#06a67c] px-2 py-0.5 text-[11px] text-white">
                    {t('vps.table.popular')}
                  </span>
                )}
              </div>
              <h3 className="mt-2 text-[15px] font-bold text-[#101945]">
                {form.name || t('vps.form.namePlaceholder')}
              </h3>
              <p className="mt-1 text-[11px] text-[#5e7195]">
                {form.description || t('vps.form.shortDescriptionValue')}
              </p>
              <p className="mt-2 text-[17px] font-bold text-[#0054d7]">
                {formatMoney(periods[0].amount)} {t('vps.form.priceMonth')}
              </p>
              <div className="mt-2 space-y-1 text-xs text-[#101945]">
                {rows.map(({ icon: RowIcon, value }) => (
                  <p key={value} className="flex items-center gap-5">
                    <RowIcon className="size-3.5 shrink-0" />
                    {value}
                  </p>
                ))}
              </div>
            </div>
          </section>
          <section className="vps-create-section min-h-[286px]">
            <h2 className="text-[15px] font-bold text-[#101945]">
              {t('vps.form.additional')}
            </h2>
            <div
              role="tablist"
              aria-label={t('vps.form.additional')}
              className="flex border-b border-[#d6e2f6] text-xs"
            >
              {(['os', 'location'] as const).map((tab) => (
                <button
                  key={tab}
                  id={`vps-additional-tab-${tab}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls="vps-additional-panel"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 border-b-2 py-1.5 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-[#506181]'}`}
                >
                  {t(`vps.form.${tab === 'location' ? 'datacenters' : 'os'}`)}
                </button>
              ))}
            </div>
            <div
              id="vps-additional-panel"
              role="tabpanel"
              aria-labelledby={`vps-additional-tab-${activeTab}`}
              className="min-h-[145px] space-y-1 py-2.5"
            >
              {activeTab === 'os' ? (
                <label
                  className="block text-xs text-[#26385c]"
                  htmlFor="vps-operating-system"
                >
                  <span className="mb-1 block font-medium">
                    {t('vps.form.defaultOs')}
                  </span>
                  <select
                    id="vps-operating-system"
                    className={inputClass}
                    value={form.operatingSystem}
                    onChange={(event) =>
                      setValue('operatingSystem', event.target.value)
                    }
                  >
                    {vpsOperatingSystems.map((system) => (
                      <option key={system} value={system}>
                        {system}
                      </option>
                    ))}
                  </select>
                </label>
              ) : allDatacenters.length ? (
                allDatacenters.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2 text-xs text-[#26385c]"
                  >
                    <input
                      type="checkbox"
                      className="size-3.5"
                      checked={form.datacenterIds.includes(item.id)}
                      onChange={() => toggleDatacenter(item.id)}
                    />
                    <span className="text-base leading-none">
                      {flags[item.countryCode] ?? '🌐'}
                    </span>
                    {item.name}
                  </label>
                ))
              ) : (
                <p className="text-xs text-slate-500">
                  {t('vps.form.noDatacenters')}
                </p>
              )}
            </div>
            <div className="flex items-start gap-2 rounded-[5px] bg-[#eaf4ff] px-2.5 py-2 text-[11px] leading-4 text-[#31568f]">
              <Info className="mt-0.5 size-3.5 shrink-0 text-blue-600" />
              {t(
                activeTab === 'os'
                  ? 'vps.form.osHint'
                  : 'vps.form.datacenterHint',
              )}
            </div>
            <div className="-mx-[17px] mt-3 flex flex-wrap justify-end gap-2 border-t border-[#e6edf8] px-4 py-2.5">
              <button
                type="button"
                onClick={() => navigate({ to: '/dashboard/catalog/vps' })}
                className="h-[40px] min-w-[116px] rounded-[6px] border border-[#d6e2f6] text-xs text-[#194181]"
              >
                {t('vps.form.cancel')}
              </button>
              <button
                type="button"
                disabled={createPackage.isPending}
                onClick={() => submit('DRAFT')}
                className="h-[40px] min-w-[88px] rounded-[6px] border border-[#d6e2f6] text-xs text-[#194181] disabled:opacity-50"
              >
                {t('vps.form.saveDraft')}
              </button>
              <button
                type="button"
                disabled={createPackage.isPending || lookups.isLoading}
                onClick={() => submit(form.status)}
                className="h-[40px] min-w-[148px] rounded-[6px] bg-[#075bea] px-3 text-xs font-medium text-white disabled:opacity-50"
              >
                {createPackage.isPending && (
                  <Loader2 className="mr-1 inline size-3 animate-spin" />
                )}
                {t('vps.form.next')} <span className="ml-1">→</span>
              </button>
            </div>
          </section>
        </aside>
      </div>
      <CatalogImageMediaPicker
        open={mediaPickerOpen}
        title={t('vps.form.image')}
        closeLabel={t('vps.form.closePicker')}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => setValue('imageUrl', url)}
      />
    </div>
  )
}
