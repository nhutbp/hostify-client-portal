import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useForm } from '@tanstack/react-form'
import { useSelector } from '@tanstack/react-store'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  createPhysicalPackageSchema,
  updatePhysicalPackageSchema,
} from '../../../../../../../../server/modules/catalog/products/physical.schemas'
import {
  useCreatePhysicalPackage,
  useUpdatePhysicalPackage,
} from '../../../../hooks/usePhysicalPackages'
import { useProviderCategories } from '../../../../hooks/useProviderCategories'
import type { PhysicalPackageDetail } from '../../../../services/physicalService'
import { slugify } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { initialPhysicalForm, physicalCycles } from './physicalFormTypes'
import type { PhysicalFormDraft } from './physicalFormTypes'

function getInitialValues(product?: PhysicalPackageDetail): PhysicalFormDraft {
  if (!product) return initialPhysicalForm
  const features = product.features
  const monthly = product.prices.find(
    (price) => price.billingCycle === 'MONTHLY',
  )
  const savedPrices = product.billingPrices.flatMap((price) => {
    if (!price || typeof price !== 'object' || Array.isArray(price)) return []
    const cycle = price.billingCycle
    if (
      typeof cycle !== 'string' ||
      !physicalCycles.includes(cycle as (typeof physicalCycles)[number])
    )
      return []
    return [
      {
        billingCycle: cycle as (typeof physicalCycles)[number],
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
    status:
      product.status === 'ACTIVE' || product.status === 'ARCHIVED'
        ? product.status
        : 'DRAFT',
    featured: product.featured,
    displayOrder: String(product.displayOrder),
    imageUrl: product.imageUrl ?? '',
    cpuModel: features.cpuModel,
    cpuCores: String(features.cpuCores),
    ramGb: String(features.ramGb),
    storageGb: String(features.storageGb),
    storageType:
      features.storageType === 'HDD' || features.storageType === 'SSD'
        ? features.storageType
        : 'NVME',
    bandwidthMbps: String(features.bandwidthMbps),
    ipCount: String(features.ipCount),
    location: features.location,
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

export function usePhysicalPackageForm(initialPackage?: PhysicalPackageDetail) {
  const { t } = useTranslation('catalog')
  const navigate = useNavigate()
  const providers = useProviderCategories('')
  const createPackage = useCreatePhysicalPackage()
  const updatePackage = useUpdatePhysicalPackage()
  const [slugEdited, setSlugEdited] = useState(Boolean(initialPackage))
  const [error, setError] = useState('')
  const formApi = useForm({
    defaultValues: getInitialValues(initialPackage),
    onSubmit: async ({ value }) => {
      setError('')
      const candidate = {
        ...value,
        displayOrder: Number(value.displayOrder),
        cpuCores: Number(value.cpuCores),
        ramGb: Number(value.ramGb),
        storageGb: Number(value.storageGb),
        bandwidthMbps: Number(value.bandwidthMbps),
        ipCount: Number(value.ipCount),
        defaultPrice: Number(value.defaultPrice),
        imageUrl: value.imageUrl || null,
        billingPrices: value.billingPrices.map((price) => ({
          billingCycle: price.billingCycle,
          amount: Number(price.amount),
          discountPercent: Number(price.discountPercent),
        })),
      }
      const parsed = initialPackage
        ? updatePhysicalPackageSchema.safeParse({
            ...candidate,
            id: initialPackage.id,
          })
        : createPhysicalPackageSchema.safeParse(candidate)
      if (!parsed.success) {
        const issue = parsed.error.issues[0]
        setError(t('physical.new.invalid'))
        document
          .querySelector(`[name="${String(issue?.path[0])}"]`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }
      try {
        if (initialPackage) {
          await updatePackage.mutateAsync({
            ...parsed.data,
            id: initialPackage.id,
          })
          toast.success(t('physical.edit.saved'))
          await navigate({
            to: '/admin/dashboard/catalog/physical/$id',
            params: { id: initialPackage.id },
          })
        } else {
          await createPackage.mutateAsync({
            ...parsed.data,
            status:
              parsed.data.status === 'ARCHIVED' ? 'DRAFT' : parsed.data.status,
          })
          toast.success(t('physical.new.saved'))
          await navigate({ to: '/admin/dashboard/catalog/physical' })
        }
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : t(
                initialPackage
                  ? 'physical.edit.saveFailed'
                  : 'physical.new.saveFailed',
              ),
        )
      }
    },
  })
  const form = useSelector(formApi.store, (state) => state.values)
  const firstProviderId = providers.data?.[0]?.id
  useEffect(() => {
    if (!form.providerCategoryId && firstProviderId)
      formApi.setFieldValue('providerCategoryId', firstProviderId)
  }, [firstProviderId, form.providerCategoryId, formApi])
  const update = (patch: Partial<PhysicalFormDraft>) => {
    for (const key of Object.keys(patch) as (keyof PhysicalFormDraft)[])
      formApi.setFieldValue(key, patch[key] as never)
  }
  const onNameChange = (name: string) => {
    formApi.setFieldValue('name', name)
    if (!slugEdited) formApi.setFieldValue('slug', slugify(name))
  }
  const onSlugChange = (slug: string) => {
    setSlugEdited(true)
    formApi.setFieldValue('slug', slugify(slug))
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
  }
}
