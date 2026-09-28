import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useForm } from '@tanstack/react-form'
import { useSelector } from '@tanstack/react-store'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  createProxyPackageSchema,
  updateProxyPackageSchema,
} from '../../../../../../../server/modules/catalog/products/proxy.schemas'
import {
  useCreateProxyPackage,
  useUpdateProxyPackage,
} from '../../../hooks/useProxyPackages'
import { useProviderCategories } from '../../../hooks/useProviderCategories'
import type { ProxyPackageDetail } from '../../../services/proxyService'
import { slugify } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { initialProxyForm, proxyCycles } from './proxyFormTypes'
import type {
  ProxyFormDraft,
  ProxyCycle,
  ProxyDetailsTab,
} from './proxyFormTypes'

function getInitialValues(product?: ProxyPackageDetail): ProxyFormDraft {
  if (!product) return initialProxyForm
  const features = product.features
  const savedPrices = product.billingPrices.flatMap((price) => {
    if (!price || typeof price !== 'object' || Array.isArray(price)) return []
    const cycle = price.billingCycle
    if (typeof cycle !== 'string' || !proxyCycles.includes(cycle as ProxyCycle))
      return []
    return [
      {
        billingCycle: cycle as ProxyCycle,
        amount: String(typeof price.amount === 'number' ? price.amount : 0),
        discountPercent: String(
          typeof price.discountPercent === 'number' ? price.discountPercent : 0,
        ),
      },
    ]
  })
  const monthly = product.prices.find(
    (price) => price.billingCycle === 'MONTHLY',
  )
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
    proxyType:
      features.proxyType === 'DATACENTER' || features.proxyType === 'MOBILE'
        ? features.proxyType
        : 'RESIDENTIAL',
    displayCategory: features.displayCategory,
    country:
      features.country === 'VN' ||
      features.country === 'SG' ||
      features.country === 'JP' ||
      features.country === 'DE'
        ? features.country
        : 'US',
    ipMode: features.ipMode === 'ROTATING' ? 'ROTATING' : 'STATIC',
    protocols: features.protocols.filter(
      (protocol): protocol is 'HTTP' | 'HTTPS' | 'SOCKS5' =>
        protocol === 'HTTP' || protocol === 'HTTPS' || protocol === 'SOCKS5',
    ),
    ipDelivery: features.ipDelivery === 'MANUAL' ? 'MANUAL' : 'INSTANT',
    bandwidthGb: String(features.bandwidthGb),
    concurrentConnections: String(features.concurrentConnections),
    autoRotation: features.autoRotation,
    whitelistIp: features.whitelistIp,
    cityTargeting: features.cityTargeting,
    ipReplacement: features.ipReplacement,
    cleanIp: features.cleanIp,
    apiSupport: features.apiSupport,
    ipWarranty: features.ipWarranty,
    support24h: features.support24h,
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

export function useProxyPackageForm(initialPackage?: ProxyPackageDetail) {
  const { t } = useTranslation('catalog')
  const navigate = useNavigate()
  const providerQuery = useProviderCategories('')
  const createPackage = useCreateProxyPackage()
  const updatePackage = useUpdateProxyPackage()
  const [slugEdited, setSlugEdited] = useState(Boolean(initialPackage))
  const [error, setError] = useState('')
  const [errorTab, setErrorTab] = useState<ProxyDetailsTab | null>(null)
  const [validationAttempt, setValidationAttempt] = useState(0)
  const formApi = useForm({
    defaultValues: getInitialValues(initialPackage),
    onSubmit: async ({ value }) => {
      setError('')
      setErrorTab(null)
      const candidate = {
        ...value,
        bandwidthGb: Number(value.bandwidthGb),
        concurrentConnections: Number(value.concurrentConnections),
        defaultPrice: Number(value.defaultPrice),
        billingPrices: value.billingPrices.map((price) => ({
          billingCycle: price.billingCycle,
          amount: Number(price.amount),
          discountPercent: Number(price.discountPercent),
        })),
      }
      const parsed = initialPackage
        ? updateProxyPackageSchema.safeParse({
            ...candidate,
            id: initialPackage.id,
          })
        : createProxyPackageSchema.safeParse(candidate)
      if (!parsed.success) {
        const issue = parsed.error.issues[0]
        const field = issue?.path[0]
        setErrorTab(
          field === 'defaultPrice' || field === 'billingPrices'
            ? 'pricing'
            : field === 'providerCategoryId'
              ? 'provider'
              : typeof field === 'string' &&
                  field in initialProxyForm &&
                  typeof initialProxyForm[field as keyof ProxyFormDraft] ===
                    'boolean'
                ? 'features'
                : field === 'name' ||
                    field === 'slug' ||
                    field === 'description' ||
                    field === 'content' ||
                    field === 'status'
                  ? null
                  : 'configuration',
        )
        setValidationAttempt((attempt) => attempt + 1)
        setError(`${t('proxy.new.invalid')} ${issue?.message ?? ''}`)
        return
      }
      try {
        if (initialPackage) {
          await updatePackage.mutateAsync({
            ...parsed.data,
            id: initialPackage.id,
          })
          toast.success(t('proxy.edit.saved'))
          await navigate({
            to: '/dashboard/catalog/proxy/$id',
            params: { id: initialPackage.id },
          })
        } else {
          await createPackage.mutateAsync({
            ...parsed.data,
            status:
              parsed.data.status === 'ARCHIVED' ? 'DRAFT' : parsed.data.status,
          })
          toast.success(t('proxy.new.saved'))
          await navigate({ to: '/dashboard/catalog/proxy' })
        }
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : t(
                initialPackage
                  ? 'proxy.edit.saveFailed'
                  : 'proxy.new.saveFailed',
              ),
        )
      }
    },
  })
  const form = useSelector(formApi.store, (state) => state.values)
  const firstProviderId = providerQuery.data?.[0]?.id
  useEffect(() => {
    if (!form.providerCategoryId && firstProviderId)
      formApi.setFieldValue('providerCategoryId', firstProviderId)
  }, [firstProviderId, form.providerCategoryId, formApi])
  const update = (patch: Partial<ProxyFormDraft>) => {
    for (const key of Object.keys(patch) as (keyof ProxyFormDraft)[])
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
    providers: providerQuery.data ?? [],
    isSaving: createPackage.isPending || updatePackage.isPending,
    error,
    errorTab,
    validationAttempt,
  }
}
