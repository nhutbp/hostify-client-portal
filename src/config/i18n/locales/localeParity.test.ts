import { describe, expect, it } from 'vitest'
import en from './en.json'
import vi from './vi.json'

function keysOf(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return entry && typeof entry === 'object' && !Array.isArray(entry)
      ? keysOf(entry as Record<string, unknown>, path)
      : [path]
  })
}

describe('shared VI/EN translations', () => {
  it('has the same keys in both languages', () => {
    expect(keysOf(vi).sort()).toEqual(keysOf(en).sort())
  })
})
