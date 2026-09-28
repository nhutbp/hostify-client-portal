import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../../common/response.server'
import {
  addCustomerCartItemSchema,
  applyCustomerCouponSchema,
  removeCustomerCartItemSchema,
  updateCustomerCartItemSchema,
} from './customer-cart.schemas'

export const getCustomerCart = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { getCustomerCart: get } =
      await import('./customer-cart.service.server')
    return createSuccessResponse(await get())
  },
)

export const addCustomerCartItem = createServerFn({ method: 'POST' })
  .validator(addCustomerCartItemSchema)
  .handler(async ({ data }) => {
    const { addCustomerCartItem: add } =
      await import('./customer-cart.service.server')
    return createSuccessResponse(await add(data), 'Đã thêm vào giỏ hàng')
  })

export const removeCustomerCartItem = createServerFn({ method: 'POST' })
  .validator(removeCustomerCartItemSchema)
  .handler(async ({ data }) => {
    const { removeCustomerCartItem: remove } =
      await import('./customer-cart.service.server')
    return createSuccessResponse(await remove(data.id), 'Đã xóa khỏi giỏ hàng')
  })

export const updateCustomerCartItem = createServerFn({ method: 'POST' })
  .validator(updateCustomerCartItemSchema)
  .handler(async ({ data }) => {
    const { updateCustomerCartItem: update } =
      await import('./customer-cart.service.server')
    return createSuccessResponse(await update(data), 'Đã cập nhật giỏ hàng')
  })

export const clearCustomerCart = createServerFn({ method: 'POST' }).handler(
  async () => {
    const { clearCustomerCart: clear } =
      await import('./customer-cart.service.server')
    return createSuccessResponse(await clear(), 'Đã xóa giỏ hàng')
  },
)

export const applyCustomerCoupon = createServerFn({ method: 'POST' })
  .validator(applyCustomerCouponSchema)
  .handler(async ({ data }) => {
    const { applyCustomerCoupon: apply } =
      await import('./customer-cart.service.server')
    return createSuccessResponse(
      await apply(data.code),
      'Đã áp dụng mã giảm giá',
    )
  })

export const removeCustomerCoupon = createServerFn({ method: 'POST' }).handler(
  async () => {
    const { removeCustomerCoupon: remove } =
      await import('./customer-cart.service.server')
    return createSuccessResponse(await remove(), 'Đã bỏ mã giảm giá')
  },
)
