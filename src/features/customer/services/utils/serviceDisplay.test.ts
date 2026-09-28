import { describe, expect, it } from 'vitest'
import { formatServicePrice, serviceStatusPresentation } from './serviceDisplay'

describe('customer service display', () => {
  it('highlights an active service approaching expiry', () => {
    expect(serviceStatusPresentation('ACTIVE', 3).label).toBe('Sắp hết hạn')
    expect(serviceStatusPresentation('ACTIVE', 30).label).toBe('Đang hoạt động')
  })

  it('does not invent a price when no order snapshot exists', () => {
    expect(formatServicePrice(null, null, null)).toBe('—')
    expect(formatServicePrice(299000, 'VND', 'MONTHLY')).toContain('/tháng')
  })
})
