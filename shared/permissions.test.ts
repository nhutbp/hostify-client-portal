import { describe, expect, it } from 'vitest'
import { MODULE_CATALOG } from './module-catalog'
import { isPermissionCode, PERMISSION_CATALOG } from './permissions'
import { ROLE_DEFINITIONS } from './roles'

describe('base catalogs', () => {
  it('keeps permission codes within active modules', () => {
    const modules = new Set(Object.keys(MODULE_CATALOG))
    expect(PERMISSION_CATALOG.length).toBeGreaterThan(0)
    for (const permission of PERMISSION_CATALOG) {
      expect(modules.has(permission.module)).toBe(true)
      expect(isPermissionCode(permission.code)).toBe(true)
    }
  })

  it('retains the base administrator role', () => {
    expect(ROLE_DEFINITIONS.some((role) => role.code === 'SUPER_ADMIN')).toBe(
      true,
    )
  })
})
