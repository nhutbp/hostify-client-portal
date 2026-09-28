import { describe, expect, it } from 'vitest'
import { slugify } from '../../../../src/utils/utils'
import { createVpsPackageSchema } from './vps.schemas'

describe('VPS product slug', () => {
  it('generates an ASCII URL slug from a Vietnamese package name', () => {
    expect(slugify('VPS Tiếng Việt Mới')).toBe('vps-tieng-viet-moi')
  })

  it('accepts an editable slug and rejects malformed values', () => {
    const slugSchema = createVpsPackageSchema.shape.slug
    expect(slugSchema.safeParse('vps-pro-custom').success).toBe(true)
    expect(slugSchema.safeParse('VPS Pro').success).toBe(false)
    expect(slugSchema.safeParse('a').success).toBe(false)
    expect(slugSchema.safeParse('vps--pro').success).toBe(false)
  })
})
