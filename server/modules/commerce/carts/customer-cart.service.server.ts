import { createAppError } from '../../../common/app-error.server'
import { requireCustomer } from '../../identity/auth/customer-access.server'
import {
  quoteCoupon,
  normalizeCouponCode,
} from '../coupons/coupon.service.server'
import { calculateCheckoutTotals } from '../../billing/invoices/checkout-pricing'
import { availableVpsOperatingSystems } from '../../../../shared/catalog/vps-operating-systems'
import {
  addItemToActiveCart,
  clearActiveCustomerCart,
  findActiveCustomerCart,
  findActiveDatacenter,
  findCartDatacenters,
  findOwnedActiveCartItem,
  findPurchasablePlan,
  removeItemFromCustomerCart,
  setActiveCartCoupon,
  updateOwnedCartItem,
} from './customer-cart.repository.server'
import type {
  AddCustomerCartItemInput,
  UpdateCustomerCartItemInput,
} from './customer-cart.schemas'

function invalidPackage(message = 'Gói hoặc giá không còn khả dụng') {
  return createAppError({
    message,
    errorCode: 'CART_PACKAGE_UNAVAILABLE',
    statusCode: 400,
  })
}

async function validateSelection(input: {
  productId: string
  planId: string
  billingCycle: string
  datacenterId?: string | null
}) {
  const plan = await findPurchasablePlan({ ...input, now: new Date() })
  if (!plan?.prices.length) throw invalidPackage()

  const assignedIds = plan.product.metas.flatMap((meta) =>
    Array.isArray(meta.metaValue)
      ? meta.metaValue.filter((id): id is string => typeof id === 'string')
      : [],
  )
  if (plan.product.category.slug === 'vps' && !assignedIds.length) {
    throw invalidPackage('Gói VPS chưa được cấu hình datacenter')
  }
  if (assignedIds.length) {
    if (
      !input.datacenterId ||
      !assignedIds.includes(input.datacenterId) ||
      !(await findActiveDatacenter(input.datacenterId))
    ) {
      throw invalidPackage('Vị trí datacenter không khả dụng cho gói này')
    }
  } else if (input.datacenterId) {
    throw invalidPackage('Gói này không có lựa chọn datacenter')
  }

  return plan
}

export async function addCustomerCartItem(input: AddCustomerCartItemInput) {
  const user = await requireCustomer()
  await validateSelection(input)
  return addItemToActiveCart({ ...input, userId: user.id })
}

export async function updateCustomerCartItem(
  input: UpdateCustomerCartItemInput,
) {
  const user = await requireCustomer()
  const item = await findOwnedActiveCartItem(user.id, input.id)
  if (!item?.planId) throw invalidPackage('Không tìm thấy gói trong giỏ hàng')
  const plan = await validateSelection({
    productId: item.productId,
    planId: item.planId,
    billingCycle: input.billingCycle,
    datacenterId: input.datacenterId,
  })
  const savedConfiguration =
    item.configuration &&
    typeof item.configuration === 'object' &&
    !Array.isArray(item.configuration)
      ? (item.configuration as Record<string, unknown>)
      : {}
  const savedOs =
    typeof savedConfiguration.operatingSystem === 'string'
      ? savedConfiguration.operatingSystem
      : undefined
  const defaultOsValue = plan.product.metas.find(
    (meta) => meta.metaKey === 'operatingSystem',
  )?.metaValue
  const defaultOs =
    typeof defaultOsValue === 'string' ? defaultOsValue : undefined
  const operatingSystem = input.operatingSystem ?? savedOs ?? defaultOs
  if (plan.product.category.slug === 'vps') {
    if (
      !operatingSystem ||
      !availableVpsOperatingSystems(defaultOs).includes(operatingSystem)
    )
      throw invalidPackage('Hệ điều hành không khả dụng cho gói VPS')
  } else if (input.operatingSystem) {
    throw invalidPackage('Gói này không hỗ trợ lựa chọn hệ điều hành')
  }
  const result = await updateOwnedCartItem(user.id, {
    ...input,
    operatingSystem:
      plan.product.category.slug === 'vps' ? operatingSystem : undefined,
  })
  if (!result.count)
    throw invalidPackage('Giỏ hàng đã thay đổi, vui lòng thử lại')
  return { id: input.id }
}

export async function clearCustomerCart() {
  const user = await requireCustomer()
  await clearActiveCustomerCart(user.id)
  await setActiveCartCoupon(user.id, null)
  return { cleared: true }
}

export async function applyCustomerCoupon(code: string) {
  const user = await requireCustomer()
  const cart = await getCustomerCart()
  if (!cart.items.length || cart.hasUnavailableItems)
    throw invalidPackage('Giỏ hàng chưa sẵn sàng để áp dụng mã')
  await quoteCoupon(code, BigInt(cart.subtotalMinor))
  await setActiveCartCoupon(user.id, normalizeCouponCode(code))
  return { code: normalizeCouponCode(code) }
}

export async function removeCustomerCoupon() {
  const user = await requireCustomer()
  await setActiveCartCoupon(user.id, null)
  return { code: null }
}

export async function getCustomerCart() {
  const user = await requireCustomer()
  const cart = await findActiveCustomerCart(user.id)
  const now = new Date()
  const datacenterIds =
    cart?.items.flatMap((item) => {
      const config = item.configuration
      const selected =
        config &&
        typeof config === 'object' &&
        !Array.isArray(config) &&
        typeof config.datacenterId === 'string'
          ? [config.datacenterId]
          : []
      const assigned = item.product.metas.flatMap((meta) =>
        meta.metaKey === 'datacenterIds' && Array.isArray(meta.metaValue)
          ? meta.metaValue.filter((id): id is string => typeof id === 'string')
          : [],
      )
      return [...selected, ...assigned]
    }) ?? []
  const datacenters = datacenterIds.length
    ? await findCartDatacenters([...new Set(datacenterIds)])
    : []
  const datacenterById = new Map(datacenters.map((item) => [item.id, item]))
  const items =
    cart?.items.map((item) => {
      const configuration =
        item.configuration &&
        typeof item.configuration === 'object' &&
        !Array.isArray(item.configuration)
          ? (item.configuration as Record<string, unknown>)
          : {}
      const cycle =
        typeof configuration.billingCycle === 'string'
          ? configuration.billingCycle
          : ''
      const datacenterId =
        typeof configuration.datacenterId === 'string'
          ? configuration.datacenterId
          : null
      const datacenter = datacenterId ? datacenterById.get(datacenterId) : null
      const assignedDatacenterIds = item.product.metas.flatMap((meta) =>
        meta.metaKey === 'datacenterIds' && Array.isArray(meta.metaValue)
          ? meta.metaValue.filter((id): id is string => typeof id === 'string')
          : [],
      )
      const defaultOsValue = item.product.metas.find(
        (meta) => meta.metaKey === 'operatingSystem',
      )?.metaValue
      const defaultOs =
        typeof defaultOsValue === 'string' ? defaultOsValue : undefined
      const operatingSystem =
        typeof configuration.operatingSystem === 'string'
          ? configuration.operatingSystem
          : defaultOs
      const availableOperatingSystems =
        item.product.category.slug === 'vps'
          ? availableVpsOperatingSystems(defaultOs)
          : []
      const features =
        item.plan?.features &&
        typeof item.plan.features === 'object' &&
        !Array.isArray(item.plan.features)
          ? (item.plan.features as Record<string, unknown>)
          : {}
      const latestCycles = new Map<
        string,
        { billingCycle: string; amountMinor: number; setupFeeMinor: number }
      >()
      for (const candidate of item.plan?.prices ?? []) {
        if (
          candidate.effectiveFrom > now ||
          (candidate.effectiveTo && candidate.effectiveTo <= now) ||
          latestCycles.has(candidate.billingCycle)
        )
          continue
        latestCycles.set(candidate.billingCycle, {
          billingCycle: candidate.billingCycle,
          amountMinor: Number(candidate.amountMinor),
          setupFeeMinor: Number(candidate.setupFeeMinor),
        })
      }
      const availableCycles = [...latestCycles.values()]
      const price =
        item.product.status === 'ACTIVE' &&
        item.product.category.deletedAt === null &&
        item.plan?.status === 'ACTIVE'
          ? item.plan.prices.find(
              (candidate) =>
                candidate.billingCycle === cycle &&
                candidate.effectiveFrom <= now &&
                (!candidate.effectiveTo || candidate.effectiveTo > now),
            )
          : undefined
      const unitAmountMinor = price ? Number(price.amountMinor) : null
      const setupFeeMinor = price ? Number(price.setupFeeMinor) : null
      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        description: item.product.description ?? '',
        category: item.product.category.name,
        categorySlug: item.product.category.slug,
        operatingSystem,
        availableOperatingSystems,
        featured: item.product.metas.some(
          (meta) => meta.metaKey === 'featured' && meta.metaValue === true,
        ),
        planId: item.planId,
        planName: item.plan?.name ?? '',
        billingCycle: cycle,
        datacenterId,
        datacenterName: datacenter?.name ?? null,
        locations: assignedDatacenterIds.flatMap((id) => {
          const location = datacenterById.get(id)
          return location?.status === 'ACTIVE'
            ? [{ id, name: location.name }]
            : []
        }),
        availableCycles,
        features: {
          cpu: Number(features.cpu ?? features.cpuCores ?? 0),
          ramGb: Number(features.ramGb ?? 0),
          diskGb: Number(features.diskGb ?? features.storageGb ?? 0),
          diskType: String(features.diskType ?? features.storageType ?? ''),
          bandwidth: String(features.bandwidth ?? features.bandwidthGb ?? ''),
          ipCount: Number(features.ipCount ?? 0),
        },
        quantity: item.quantity,
        unitAmountMinor,
        setupFeeMinor,
        totalMinor: price
          ? (unitAmountMinor! + setupFeeMinor!) * item.quantity
          : null,
        available:
          Boolean(price) &&
          (item.product.category.slug !== 'vps' || Boolean(datacenterId)) &&
          (!assignedDatacenterIds.length ||
            Boolean(
              datacenterId && assignedDatacenterIds.includes(datacenterId),
            )) &&
          (!datacenterId || datacenter?.status === 'ACTIVE') &&
          (item.product.category.slug !== 'vps' ||
            Boolean(
              operatingSystem &&
              availableOperatingSystems.includes(operatingSystem),
            )),
      }
    }) ?? []
  const subtotalMinor = items.reduce(
    (sum, item) => sum + (item.available ? (item.totalMinor ?? 0) : 0),
    0,
  )
  let coupon: {
    code: string
    discountType: string
    discountValue: number
  } | null = null
  let couponError: string | null = null
  let discountMinor = 0n
  if (cart?.couponCode && subtotalMinor > 0) {
    try {
      const quote = await quoteCoupon(
        cart.couponCode,
        BigInt(subtotalMinor),
        now,
      )
      discountMinor = quote.discountMinor
      coupon = {
        code: quote.code,
        discountType: quote.discountType,
        discountValue: Number(quote.discountValue),
      }
    } catch (error) {
      couponError =
        error instanceof Error
          ? error.message
          : 'Mã giảm giá không còn khả dụng'
    }
  }
  const totals = calculateCheckoutTotals(BigInt(subtotalMinor), discountMinor)
  return {
    id: cart?.id ?? null,
    currency: 'VND',
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalMinor,
    discountMinor: Number(totals.discountMinor),
    taxMinor: Number(totals.taxMinor),
    totalMinor: Number(totals.totalMinor),
    coupon,
    couponError,
    hasUnavailableItems: items.some((item) => !item.available),
  }
}

export async function removeCustomerCartItem(id: string) {
  const user = await requireCustomer()
  const result = await removeItemFromCustomerCart(user.id, id)
  if (!result.count) {
    throw createAppError({
      message: 'Không tìm thấy sản phẩm trong giỏ hàng',
      errorCode: 'CART_ITEM_NOT_FOUND',
      statusCode: 404,
    })
  }
  return { id }
}
