import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useForm } from '@tanstack/react-form'
import { useSelector } from '@tanstack/react-store'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  createViaPackageSchema,
  updateViaPackageSchema,
} from '../../../../../../../server/modules/catalog/products/via.schemas'
import {
  useCreateViaPackage,
  useUpdateViaPackage,
} from '../../../hooks/useViaPackages'
import { useProviderCategories } from '../../../hooks/useProviderCategories'
import type { ViaPackageDetail } from '../../../services/viaService'
import { slugify } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { initialViaForm } from './viaFormTypes'
import type { ViaDetailsTab, ViaFormDraft } from './viaFormTypes'

function getInitialValues(product?: ViaPackageDetail): ViaFormDraft {
  if (!product) return initialViaForm
  const f = product.features
  const savedPrices = product.quantityPrices.flatMap((price) => {
    if (!price || typeof price !== 'object' || Array.isArray(price)) return []
    if (typeof price.quantity !== 'number' || typeof price.amount !== 'number')
      return []
    return [
      {
        quantity: String(price.quantity),
        amount: String(price.amount),
        discountPercent: String(
          typeof price.discountPercent === 'number' ? price.discountPercent : 0,
        ),
      },
    ]
  })
  const defaultPrice =
    product.defaultPrice ||
    product.prices.find((price) => price.billingCycle === 'ONE_TIME')
      ?.amountMinor ||
    0
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    content: product.content,
    status:
      product.status === 'ACTIVE' || product.status === 'ARCHIVED'
        ? product.status
        : 'DRAFT',
    platform:
      f.platform === 'GOOGLE' || f.platform === 'TIKTOK'
        ? f.platform
        : 'FACEBOOK',
    country:
      f.country === 'VN' ||
      f.country === 'SG' ||
      f.country === 'JP' ||
      f.country === 'DE'
        ? f.country
        : 'US',
    accountType:
      f.accountType === 'BM' || f.accountType === 'ADS' ? f.accountType : 'VIA',
    accountAge:
      f.accountAge === 'NEW' || f.accountAge === 'SIX_MONTHS'
        ? f.accountAge
        : 'ONE_YEAR',
    verification: f.verification === 'UNVERIFIED' ? 'UNVERIFIED' : 'VERIFIED',
    twoFactor: f.twoFactor,
    changeLimit:
      f.changeLimit === 'LIMITED' || f.changeLimit === 'NO_CHANGE'
        ? f.changeLimit
        : 'UNLIMITED',
    deliveryMethod:
      f.deliveryMethod === 'ACCOUNT_PASSWORD_2FA'
        ? 'ACCOUNT_PASSWORD_2FA'
        : 'ACCOUNT_PASSWORD',
    warrantyDays: String(f.warrantyDays),
    originalEmail: f.originalEmail,
    originalPhone: f.originalPhone,
    birthday: f.birthday,
    loginBrowser: f.loginBrowser,
    backupCookie: f.backupCookie,
    usageGuide: f.usageGuide,
    defaultPrice: String(defaultPrice),
    quantityPrices: savedPrices.length
      ? savedPrices
      : [{ quantity: '1', amount: String(defaultPrice), discountPercent: '0' }],
    providerCategoryId: product.providerCategory?.id ?? '',
  }
}

export function useViaPackageForm(initialPackage?: ViaPackageDetail) {
  const { t } = useTranslation('catalog')
  const navigate = useNavigate()
  const providerQuery = useProviderCategories('')
  const createPackage = useCreateViaPackage()
  const updatePackage = useUpdateViaPackage()
  const [slugEdited, setSlugEdited] = useState(Boolean(initialPackage))
  const [error, setError] = useState('')
  const [errorTab, setErrorTab] = useState<ViaDetailsTab | null>(null)
  const [validationAttempt, setValidationAttempt] = useState(0)
  const formApi = useForm({
    defaultValues: getInitialValues(initialPackage),
    onSubmit: async ({ value }) => {
      setError('')
      setErrorTab(null)
      const candidate = {
        ...value,
        warrantyDays: Number(value.warrantyDays),
        defaultPrice: Number(value.defaultPrice),
        quantityPrices: value.quantityPrices.map((price) => ({
          quantity: Number(price.quantity),
          amount: Number(price.amount),
          discountPercent: Number(price.discountPercent),
        })),
      }
      const parsed = initialPackage
        ? updateViaPackageSchema.safeParse({
            ...candidate,
            id: initialPackage.id,
          })
        : createViaPackageSchema.safeParse(candidate)
      if (!parsed.success) {
        const field = parsed.error.issues[0]?.path[0]
        setErrorTab(
          field === 'defaultPrice' || field === 'quantityPrices'
            ? 'pricing'
            : field === 'providerCategoryId'
              ? 'provider'
              : field === 'name' ||
                  field === 'slug' ||
                  field === 'description' ||
                  field === 'content' ||
                  field === 'status'
                ? null
                : typeof field === 'string' &&
                    field in initialViaForm &&
                    typeof initialViaForm[field as keyof ViaFormDraft] ===
                      'boolean' &&
                    field !== 'twoFactor'
                  ? 'extras'
                  : 'configuration',
        )
        setValidationAttempt((attempt) => attempt + 1)
        setError(
          `${t('via.new.invalid')} ${parsed.error.issues[0]?.message ?? ''}`,
        )
        return
      }
      try {
        if (initialPackage) {
          await updatePackage.mutateAsync({
            ...parsed.data,
            id: initialPackage.id,
          })
          toast.success(t('via.edit.saved'))
          await navigate({
            to: '/admin/dashboard/catalog/via/$id',
            params: { id: initialPackage.id },
          })
        } else {
          await createPackage.mutateAsync({
            ...parsed.data,
            status:
              parsed.data.status === 'ARCHIVED' ? 'DRAFT' : parsed.data.status,
          })
          toast.success(t('via.new.saved'))
          await navigate({ to: '/admin/dashboard/catalog/via' })
        }
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : t(initialPackage ? 'via.edit.saveFailed' : 'via.new.saveFailed'),
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
  const update = (patch: Partial<ViaFormDraft>) => {
    for (const key of Object.keys(patch) as (keyof ViaFormDraft)[])
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
