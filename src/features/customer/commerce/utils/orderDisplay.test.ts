import { describe, expect, it } from 'vitest'
import { orderStatus, paymentMethodLabels } from './orderDisplay'

describe('order history display', () => {
  it('identifies a pending payment without suggesting money was collected', () => {
    expect(orderStatus('PENDING_PAYMENT').label).toBe('Chờ thanh toán')
    expect(orderStatus('PAID').label).toBe('Đã thanh toán')
  })

  it('shows the selected payment method name', () => {
    expect(paymentMethodLabels.VIETQR).toBe('VietQR / Ngân hàng')
  })
})
