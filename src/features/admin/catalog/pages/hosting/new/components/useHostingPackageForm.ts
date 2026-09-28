import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useForm } from '@tanstack/react-form'
import { useSelector } from '@tanstack/react-store'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { createHostingPackageSchema } from '../../../../../../../../server/modules/catalog/products/hosting.schemas'
import {
  useCreateHostingPackage,
  useUpdateHostingPackage,
} from '../../../../hooks/useHostingPackages'
import { useProviderCategories } from '../../../../hooks/useProviderCategories'
import type { HostingPackageDetail } from '../../../../services/hostingService'
import { slugify } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { hostingCycles, initialHostingForm } from './hostingFormTypes'
import type { HostingDetailsTab, HostingFormDraft } from './hostingFormTypes'

function getInitialValues(product?: HostingPackageDetail): HostingFormDraft {
  if (!product) return initialHostingForm
  const features = product.features
  const monthly = product.prices.find(
    (price) => price.billingCycle === 'MONTHLY',
  )
  const savedPrices = product.billingPrices.flatMap((price) => {
    if (!price || typeof price !== 'object' || Array.isArray(price)) return []
    const cycle = price.billingCycle
    if (
      typeof cycle !== 'string' ||
      !hostingCycles.includes(cycle as (typeof hostingCycles)[number])
    )
      return []
    return [
      {
        billingCycle: cycle as (typeof hostingCycles)[number],
        amount: String(typeof price.amount === 'number' ? price.amount : 0),
        discountPercent: String(
          typeof price.discountPercent === 'number' ? price.discountPercent : 0,
        ),
      },
    ]
  })
  const defaultPrice = product.defaultPrice || monthly?.amountMinor || 0
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    content: product.content,
    status: product.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
    featured: product.featured,
    displayOrder: String(product.displayOrder),
    tags: product.tags.join(', '),
    imageUrl: product.imageUrl ?? '',
    storageGb: String(features.storageGb),
    storageUnit: 'GB',
    bandwidthGb: String(features.bandwidthGb),
    bandwidthUnit: 'GB',
    websites: String(features.websites),
    databases: String(features.databases),
    cpuCores: String(features.cpuCores),
    ramGb: String(features.ramGb),
    emailAccounts: String(features.emailAccounts),
    addonDomains: String(features.addonDomains),
    controlPanel: features.controlPanel,
    freeSsl: features.freeSsl,
    automaticBackups: features.automaticBackups,
    malwareProtection: features.malwareProtection,
    freeDomain: features.freeDomain,
    multiplePhpVersions: features.multiplePhpVersions,
    cronJobs: features.cronJobs,
    staging: features.staging,
    defaultPrice: String(defaultPrice),
    billingPrices: savedPrices.length
      ? savedPrices
      : [
          {
            billingCycle: 'MONTHLY',
            amount: String(defaultPrice),
            discountPercent: '0',
          },
        ],
    providerCategoryId: product.providerCategory?.id ?? '',
  }
}

export function useHostingPackageForm(initialPackage?: HostingPackageDetail) {
  const { t } = useTranslation('catalog')
  const navigate = useNavigate()
  const providers = useProviderCategories('')
  const createPackage = useCreateHostingPackage()
  const updatePackage = useUpdateHostingPackage()
  const [slugEdited, setSlugEdited] = useState(false)
  const [error, setError] = useState('')
  const [errorTab, setErrorTab] = useState<HostingDetailsTab | null>(null)
  const [validationAttempt, setValidationAttempt] = useState(0)
  const formApi = useForm({
    defaultValues: getInitialValues(initialPackage),
    onSubmit: async ({ value }) => {
      setError('')
      setErrorTab(null)
      const form = value
      const bandwidth = Number(form.bandwidthGb)
      const candidate = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        content: form.content,
        status: form.status,
        featured: form.featured,
        displayOrder: Number(form.displayOrder),
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        imageUrl: form.imageUrl || null,
        storageGb:
          Number(form.storageGb) * (form.storageUnit === 'TB' ? 1024 : 1),
        bandwidthGb:
          bandwidth === -1
            ? -1
            : bandwidth * (form.bandwidthUnit === 'TB' ? 1024 : 1),
        websites: Number(form.websites),
        databases: Number(form.databases),
        cpuCores: Number(form.cpuCores),
        ramGb: Number(form.ramGb),
        emailAccounts: Number(form.emailAccounts),
        addonDomains: Number(form.addonDomains),
        controlPanel: form.controlPanel,
        freeSsl: form.freeSsl,
        automaticBackups: form.automaticBackups,
        malwareProtection: form.malwareProtection,
        freeDomain: form.freeDomain,
        multiplePhpVersions: form.multiplePhpVersions,
        cronJobs: form.cronJobs,
        staging: form.staging,
        defaultPrice: Number(form.defaultPrice),
        billingPrices: form.billingPrices.map((price) => ({
          billingCycle: price.billingCycle,
          amount: Number(price.amount),
          discountPercent: Number(price.discountPercent),
        })),
        providerCategoryId: form.providerCategoryId,
      }
      const parsed = createHostingPackageSchema.safeParse(candidate)
      if (!parsed.success) {
        const field = parsed.error.issues[0]?.path[0]
        setErrorTab(
          field === 'defaultPrice' || field === 'billingPrices'
            ? 'pricing'
            : field === 'providerCategoryId'
              ? 'provider'
              : field === 'name' ||
                  field === 'slug' ||
                  field === 'description' ||
                  field === 'content' ||
                  field === 'status' ||
                  field === 'featured' ||
                  field === 'displayOrder' ||
                  field === 'tags' ||
                  field === 'imageUrl'
                ? null
                : 'resources',
        )
        setValidationAttempt((attempt) => attempt + 1)
        setError(
          `${t('hosting.new.invalid')} ${parsed.error.issues[0]?.message ?? ''}`,
        )
        return
      }
      try {
        if (initialPackage) {
          await updatePackage.mutateAsync({
            ...parsed.data,
            id: initialPackage.id,
          })
          toast.success(t('hosting.edit.saved'))
          await navigate({
            to: '/dashboard/catalog/hosting/$id',
            params: { id: initialPackage.id },
          })
        } else {
          await createPackage.mutateAsync(parsed.data)
          toast.success(t('hosting.new.saved'))
          await navigate({ to: '/dashboard/catalog/hosting' })
        }
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : t(
                initialPackage
                  ? 'hosting.edit.saveFailed'
                  : 'hosting.new.saveFailed',
              ),
        )
      }
    },
  })
  const form = useSelector(formApi.store, (state) => state.values)
  const update = (patch: Partial<HostingFormDraft>) => {
    for (const key of Object.keys(patch) as (keyof HostingFormDraft)[]) {
      formApi.setFieldValue(key, patch[key] as never)
    }
  }
  const firstProviderId = providers.data?.[0]?.id

  useEffect(() => {
    if (!form.providerCategoryId && firstProviderId)
      formApi.setFieldValue('providerCategoryId', firstProviderId)
  }, [firstProviderId, form.providerCategoryId])

  const onNameChange = (name: string) => {
    formApi.setFieldValue('name', name)
    if (!slugEdited) formApi.setFieldValue('slug', slugify(name))
  }
  const onSlugChange = (slug: string) => {
    setSlugEdited(true)
    update({ slug: slugify(slug) })
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void formApi.handleSubmit()
  }

  return {
    form,
    update,
    onNameChange,
    onSlugChange,
    onSubmit,
    providers: providers.data ?? [],
    isSaving: createPackage.isPending || updatePackage.isPending,
    error,
    errorTab,
    validationAttempt,
  }
}
