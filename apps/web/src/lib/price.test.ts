import { describe, expect, test } from 'bun:test'
import { clampTb, monthlyUsd } from './price'

describe('price', () => {
  test('is free at every size', () => {
    expect(monthlyUsd(1)).toBe(0)
    expect(monthlyUsd(4)).toBe(0)
  })

  test('clamps to the published plan range', () => {
    expect(clampTb(0)).toBe(1)
    expect(clampTb(99)).toBe(30)
  })
})
