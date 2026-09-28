import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useSelector } from '@tanstack/react-store'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Building2,
  Cpu,
  Gauge,
  HardDrive,
  MemoryStick,
  Plus,
  Server,
  Tag,
  Trash2,
} from 'lucide-react'
import type {
  CreateVpsPackageInput,
  VpsPackageDetail,
} from '../../services/vpsService'
import {
  useCreateVpsPackage,
  useUpdateVpsPackage,
  useVpsPackageLookups,
} from '../../hooks/useVpsPackage'
import { toast } from '@/utils/toast'
import { slugify } from '@/utils/utils'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { Field, NumberControl, Section, vpsInputClass } from './VpsFormFields'
import { VpsDetailsTabs } from './VpsDetailsTabs'
import type { VpsDetailsTab } from './VpsDetailsTabs'
import { VpsPublishingSection } from './VpsPublishingSection'
import { VpsAdditionalSection } from './VpsAdditionalSection'
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

function getInitialPeriods(product?: VpsPackageDetail): Period[] {
  if (!product) return periodsDefault
  const saved = product.billingPrices
  const currentPrices = product.plans[0]?.prices ?? []
  const periods = periodsDefault.flatMap((template) => {
    const configured = saved.find(
      (value) =>
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value.billingCycle === template.billingCycle,
    )
    if (
      configured &&
      typeof configured === 'object' &&
      !Array.isArray(configured) &&
      typeof configured.amount === 'number'
    ) {
      const discount =
        typeof configured.discountPercent === 'number'
          ? configured.discountPercent
          : 0
      return [
        {
          ...template,
          amount: String(configured.amount),
          discount: template.billingCycle === 'MONTHLY' ? '-' : `-${discount}%`,
        },
      ]
    }
    const current = currentPrices.find(
      (price) => price.billingCycle === template.billingCycle,
    )
    return current
      ? [
          {
            ...template,
            amount: String(current.amountMinor),
            discount: template.billingCycle === 'MONTHLY' ? '-' : '0%',
          },
        ]
      : []
  })
  return periods.length ? periods : periodsDefault
}

export function VpsPackageForm({
  initialPackage,
}: {
  initialPackage?: VpsPackageDetail
}) {
  const { t } = useTranslation('catalog')
  const navigate = useNavigate()
  const lookups = useVpsPackageLookups()
  const createPackage = useCreateVpsPackage()
  const updatePackage = useUpdateVpsPackage()
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const formApi = useForm({
    defaultValues: (() => {
      const features = initialPackage?.plans[0]?.features
      const config =
        features && typeof features === 'object' && !Array.isArray(features)
          ? (features as Record<string, unknown>)
          : {}
      const getNumber = (key: string, fallback: number) =>
        String(typeof config[key] === 'number' ? config[key] : fallback)
      return {
        name: initialPackage?.name ?? t('vps.form.defaultName'),
        slug: initialPackage?.slug ?? slugify(t('vps.form.defaultName')),
        description:
          initialPackage?.description ?? t('vps.form.defaultDescription'),
        content: initialPackage?.content ?? '',
        providerId: initialPackage?.providerId ?? '',
        providerCategoryId: initialPackage?.providerCategory?.id ?? '',
        datacenterIds: initialPackage?.datacenterIds ?? ([] as string[]),
        cpu: getNumber('cpu', 4),
        ramGb: getNumber('ramGb', 8),
        diskGb: getNumber('diskGb', 100),
        diskType:
          typeof config.diskType === 'string' ? config.diskType : 'NVMe SSD',
        operatingSystem:
          initialPackage?.operatingSystem ?? (vpsOperatingSystems[0] as string),
        bandwidth:
          config.bandwidth === 'UNLIMITED'
            ? t('vps.form.unlimited')
            : typeof config.bandwidth === 'string'
              ? config.bandwidth
              : t('vps.form.unlimited'),
        ipCount: getNumber('ipCount', 1),
        status:
          initialPackage?.status === 'DRAFT'
            ? ('DRAFT' as const)
            : ('ACTIVE' as const),
        featured: initialPackage?.featured ?? true,
        displayOrder: String(initialPackage?.displayOrder ?? 0),
        tags: initialPackage?.tags.join(', ') ?? t('vps.form.tagValue'),
        imageUrl: initialPackage?.imageUrl ?? '',
        billingPrices: getInitialPeriods(initialPackage),
      }
    })(),
    onSubmit: async ({ value }) => savePackage(value),
  })
  const form = useSelector(formApi.store, (state) => state.values)
  const periods = form.billingPrices
  const [error, setError] = useState('')
  const [detailsTab, setDetailsTab] = useState<VpsDetailsTab>('hardware')
  const [tagDraft, setTagDraft] = useState('')
  const setValue = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => formApi.setFieldValue(key, value as never)
  const setPeriods = (update: (items: Period[]) => Period[]) =>
    formApi.setFieldValue(
      'billingPrices',
      update(formApi.state.values.billingPrices),
    )
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
      setValue('providerId', chosen.providerId)
      setValue('datacenterIds', [id])
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
  const savePackage = async (value: typeof form) => {
    setError('')
    if (!value.slug || value.slug.length < 2) {
      setError(t('vps.form.slugRequired'))
      return
    }
    if (!value.providerCategoryId) {
      setError(t('vps.form.selectProvider'))
      setDetailsTab('provider')
      return
    }
    const input: CreateVpsPackageInput = {
      name: value.name,
      slug: value.slug,
      description: value.description,
      content: value.content,
      status: value.status,
      featured: value.featured,
      displayOrder: Number(value.displayOrder),
      tags: value.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      imageUrl: value.imageUrl || null,
      cpu: Number(value.cpu),
      ramGb: Number(value.ramGb),
      diskGb: Number(value.diskGb),
      diskType: value.diskType,
      operatingSystem: value.operatingSystem,
      bandwidth:
        value.bandwidth === t('vps.form.unlimited')
          ? 'UNLIMITED'
          : value.bandwidth,
      ipCount: Number(value.ipCount),
      providerCategoryId: value.providerCategoryId,
      datacenterIds: value.datacenterIds.length
        ? value.datacenterIds
        : datacenters.slice(0, 1).map((item) => item.id),
      billingPrices: value.billingPrices.map((item) => ({
        billingCycle: item.billingCycle,
        amount: Number(item.amount),
        discountPercent: Number(item.discount.replace(/[^0-9]/g, '')) || 0,
      })),
    }
    try {
      if (initialPackage) {
        await updatePackage.mutateAsync({ ...input, id: initialPackage.id })
        toast.success(t('vps.form.updated'))
        await navigate({
          to: '/admin/dashboard/catalog/vps/$id',
          params: { id: initialPackage.id },
        })
      } else {
        await createPackage.mutateAsync(input)
        toast.success(t('vps.form.created'))
        await navigate({ to: '/admin/dashboard/catalog/vps' })
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : t(
              initialPackage
                ? 'vps.form.updateFailed'
                : 'vps.form.createFailed',
            ),
      )
    }
  }
  const submit = (status: 'DRAFT' | 'ACTIVE') => {
    formApi.setFieldValue('status', status)
    void formApi.handleSubmit()
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
            icon={Box}
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
                      onChange={(event) => {
                        const name = event.target.value
                        setValue('name', name)
                        if (!slugManuallyEdited) setValue('slug', slugify(name))
                      }}
                    />
                    <span className="absolute bottom-0.5 right-2 text-[10px] text-[#7182a4]">
                      {form.name.length}/100
                    </span>
                  </div>
                </div>
                <div className="vps-labeled-row">
                  <label htmlFor="vps-slug">
                    {t('vps.form.slug')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="vps-slug"
                    className={inputClass}
                    maxLength={120}
                    value={form.slug}
                    onChange={(event) => {
                      setSlugManuallyEdited(true)
                      setValue('slug', slugify(event.target.value))
                    }}
                    placeholder={t('vps.form.slugPlaceholder')}
                  />
                </div>
                <div className="vps-labeled-row">
                  <label htmlFor="vps-description">
                    {t('vps.form.shortDescription')}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="vps-description"
                      className="h-[110px] w-full resize-none rounded-[5px] border bg-white px-2.5 py-2 pb-6 text-xs"
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
          <VpsDetailsTabs activeTab={detailsTab} onChange={setDetailsTab} />
          <div
            id="vps-details-hardware-panel"
            role="tabpanel"
            aria-labelledby="vps-details-hardware-tab"
            hidden={detailsTab !== 'hardware'}
            className="pt-2"
          >
            <Section
              icon={Server}
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
                    onChange={(event) =>
                      setValue('diskType', event.target.value)
                    }
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
                    onChange={(event) =>
                      setValue('ipCount', event.target.value)
                    }
                  />
                </Field>
              </div>
            </Section>
          </div>
          <div
            id="vps-details-pricing-panel"
            role="tabpanel"
            aria-labelledby="vps-details-pricing-tab"
            hidden={detailsTab !== 'pricing'}
            className="pt-2"
          >
            <Section icon={Tag} title={t('vps.form.sectionPricing')}>
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
                  <div className="vps-pricing-table overflow-x-auto rounded-md border border-[#d6e2f6]">
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
          </div>
          <div
            id="vps-details-provider-panel"
            role="tabpanel"
            aria-labelledby="vps-details-provider-tab"
            hidden={detailsTab !== 'provider'}
            className="pt-2"
          >
            <Section
              icon={Building2}
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
          <div
            id="vps-details-additional-panel"
            role="tabpanel"
            aria-labelledby="vps-details-additional-tab"
            hidden={detailsTab !== 'additional'}
            className="pt-2"
          >
            <VpsAdditionalSection
              operatingSystem={form.operatingSystem}
              onOperatingSystemChange={(value) =>
                setValue('operatingSystem', value)
              }
              datacenterIds={form.datacenterIds}
              datacenters={allDatacenters}
              onToggleDatacenter={toggleDatacenter}
            />
          </div>
        </div>
        <aside className="min-w-0 space-y-2.5">
          <VpsPublishingSection
            name={form.name}
            status={form.status}
            featured={form.featured}
            displayOrder={form.displayOrder}
            imageUrl={form.imageUrl}
            isSaving={
              createPackage.isPending ||
              updatePackage.isPending ||
              lookups.isLoading
            }
            onStatusChange={(status) => setValue('status', status)}
            onFeaturedChange={(featured) => setValue('featured', featured)}
            onDisplayOrderChange={(displayOrder) =>
              setValue('displayOrder', displayOrder)
            }
            onChangeImage={() => setMediaPickerOpen(true)}
            onRemoveImage={() => setValue('imageUrl', '')}
            onCancel={() =>
              navigate(
                initialPackage
                  ? {
                      to: '/admin/dashboard/catalog/vps/$id',
                      params: { id: initialPackage.id },
                    }
                  : { to: '/admin/dashboard/catalog/vps' },
              )
            }
            onSaveDraft={() => submit('DRAFT')}
            onSave={() => submit(form.status)}
            isEdit={Boolean(initialPackage)}
          />
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
