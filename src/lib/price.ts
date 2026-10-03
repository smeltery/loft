export const PRICE_PER_TB_USD = 9
export const MIN_TB = 1
export const MAX_TB = 30

export function clampTb(tb: number): number {
  return Math.min(MAX_TB, Math.max(MIN_TB, Math.trunc(tb)))
}

export function monthlyUsd(tb: number): number {
  return clampTb(tb) * PRICE_PER_TB_USD
}
