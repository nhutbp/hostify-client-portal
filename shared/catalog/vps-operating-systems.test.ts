import { describe, expect, it } from 'vitest'
import {
  availableVpsOperatingSystems,
  vpsOperatingSystems,
} from './vps-operating-systems'

describe('VPS operating systems', () => {
  it('keeps the catalog options selectable without duplicates', () => {
    expect(availableVpsOperatingSystems('Debian 12')).toEqual([
      ...vpsOperatingSystems,
    ])
  })

  it('preserves a legacy configured default as a selectable option', () => {
    expect(availableVpsOperatingSystems('Custom Linux')[0]).toBe('Custom Linux')
  })
})
