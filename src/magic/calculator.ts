import { MATERIAL_DATA, type MaterialCost, type MaterialSeriesName } from './materials-data'

// Thresholds and reference values from meow-magic-calculator @ d6766f7.
export const MAGIC_TIERS = [
  { name: '落岩', drop: 17801, ref: 2160 },
  { name: '封印', drop: 22401, ref: 2376 },
  { name: '祝福', drop: 22401, ref: 2612 },
  { name: '祈愿', drop: 29161, ref: 2861 },
  { name: '破晓', drop: 32254, ref: 3148 },
  { name: '晨曦', drop: 36161, ref: 3469 },
  { name: '曙光', drop: 40841, ref: 3776 },
  { name: '旭日', drop: 44921, ref: 4183 },
  { name: '苍穹', drop: 49421, ref: 4578 },
  { name: '云迹', drop: 54351, ref: null },
] as const

export const MAGIC_SLOTS = ['耳环', '项链', '手镯', '戒指', '徽章', '腰带'] as const
export const DEFAULT_MAGIC_TARGET = '曙光'
export const MAX_MAGIC_LEVEL = Math.max(...Object.values(MATERIAL_DATA).map((series) => series.maxLevel))
export type MagicTierName = typeof MAGIC_TIERS[number]['name']
export type MagicPiece = { base: number; level: number; name: MagicTierName; replace: boolean }
export type MaterialQuery = { series: MaterialSeriesName; current: number; target: number }

export const createMagicPieces = (): MagicPiece[] =>
  MAGIC_SLOTS.map(() => ({ base: 0, level: 0, name: '落岩', replace: false }))

export const createMaterialQuery = (): MaterialQuery => ({ series: '破晓', current: 0, target: 1 })

export const nonNegativeInteger = (value: number, max = Number.MAX_SAFE_INTEGER) =>
  Number.isFinite(value) ? Math.min(max, Math.max(0, Math.round(value))) : 0

export function calcPieceTotal(base: number, level: number) {
  const b = BigInt(nonNegativeInteger(base))
  const l = BigInt(nonNegativeInteger(level))
  // Integer arithmetic avoids floating-point errors at exact 5% boundaries.
  return Number(b + (b * l + 19n) / 20n)
}

export function calculateMagic(pieces: readonly MagicPiece[], targetName: MagicTierName) {
  const pieceTotals = pieces.map((piece) => calcPieceTotal(piece.base, piece.level))
  const total = pieceTotals.reduce((sum, value) => sum + value, 0)
  const target = MAGIC_TIERS.find((tier) => tier.name === targetName) ?? MAGIC_TIERS[6]
  const currentTier = MAGIC_TIERS.findLast((tier) => total >= tier.drop)
  return { pieceTotals, total, target, currentTier, gap: target.drop - total }
}

const emptyCost = (): MaterialCost => ({ greenWater: 0, purpleStar: 0, protectionCharm: 0 })
const addCost = (left: MaterialCost, right: MaterialCost): MaterialCost => ({
  greenWater: left.greenWater + right.greenWater,
  purpleStar: left.purpleStar + right.purpleStar,
  protectionCharm: left.protectionCharm + right.protectionCharm,
})

export function normalizeMaterialQuery(query: MaterialQuery): MaterialQuery {
  const series = MATERIAL_DATA[query.series]
  const current = nonNegativeInteger(query.current, series.maxLevel)
  const target = Math.max(current, nonNegativeInteger(query.target, series.maxLevel))
  return { ...query, current, target }
}

export function calculateMaterials(query: MaterialQuery) {
  const { current, target } = normalizeMaterialQuery(query)
  const series = MATERIAL_DATA[query.series]
  let priorCost = emptyCost()
  let totals = emptyCost()
  const rows = series.entries.map((entry) => {
    const inRange = entry.level > current && entry.level <= target
    const row = { ...entry, priorCost, inRange, isTarget: entry.level === target }
    priorCost = addCost(priorCost, entry)
    if (inRange) totals = addCost(totals, entry)
    return row
  })
  return {
    series,
    current,
    target,
    levelCount: target - current,
    totals,
    targetCost: series.entries.find((entry) => entry.level === target) ?? emptyCost(),
    rows,
  }
}
