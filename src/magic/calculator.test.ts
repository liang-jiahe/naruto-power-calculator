import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  MAGIC_TIERS,
  calcPieceTotal,
  calculateMagic,
  calculateMaterials,
  createMagicPieces,
  normalizeMaterialQuery,
} from './calculator'
import { MATERIAL_DATA, type MaterialSeriesName } from './materials-data'

describe('饰品抗魔', () => {
  it.each([
    [0, 30, 0], [2160, 0, 2160], [2160, 1, 2268], [2161, 1, 2270],
    [3148, 30, 7870], [3469, 35, 9540], [100, 28, 240],
  ])('基础 %i、强化 +%i 的总抗魔为 %i', (base, level, expected) => {
    expect(calcPieceTotal(base, level)).toBe(expected)
  })

  it('对整数边界使用精确向上取整', () => {
    for (const base of [1, 19, 20, 99, 2160, 3776, 4183, 4578]) {
      for (let level = 0; level <= 35; level++) {
        const numerator = base * (20 + level)
        expect(calcPieceTotal(base, level)).toBe(Math.floor((numerator + 19) / 20))
      }
    }
  })

  it('处理负值、非有限值和小数输入', () => {
    expect(calcPieceTotal(-100, 10)).toBe(0)
    expect(calcPieceTotal(100, -1)).toBe(100)
    expect(calcPieceTotal(NaN, 1)).toBe(0)
    expect(calcPieceTotal(Infinity, 1)).toBe(0)
    expect(calcPieceTotal(100, Infinity)).toBe(100)
    expect(calcPieceTotal(100.6, 1.6)).toBe(112)
  })

  it('六件相加；名称和更换标记不改变抗魔', () => {
    const pieces = createMagicPieces().map((piece) => ({ ...piece, base: 3776, level: 30 }))
    const result = calculateMagic(pieces, '云迹')
    expect(result.total).toBe(56640)
    expect(result.gap).toBe(-2289)
    expect(result.currentTier?.name).toBe('云迹')
    expect(calculateMagic(pieces.map((piece) => ({ ...piece, name: '云迹', replace: true })), '云迹').total).toBe(result.total)
  })

  it('门槛等值时达标，同门槛按原项目顺序选取当前品级', () => {
    for (const tier of MAGIC_TIERS) {
      const pieces = createMagicPieces()
      pieces[0].base = tier.drop
      expect(calculateMagic(pieces, tier.name).gap).toBe(0)
    }
    const pieces = createMagicPieces()
    pieces[0].base = 22401
    expect(calculateMagic(pieces, '曙光').currentTier?.name).toBe('祝福')
  })
})

// SHA-256 values computed from every original [level, greenWater, purpleStar, protectionCharm]
// row at meow-magic-calculator commit d6766f7. This verifies all 170 rows without a network dependency.
const sourceSnapshots: Record<MaterialSeriesName, { count: number; hash: string; totals: number[] }> = {
  破晓: { count: 30, hash: 'b62dfbf4217deb11c28c854ca1f7ba35a1a64dc3f56ea7a516be72564523ce5b', totals: [586712, 9057, 878] },
  晨曦: { count: 35, hash: '92a46e4c2bb5633b3f1a40f3dda03f35e5df0b35eb13f6daa87067d8d485287b', totals: [946820, 15795, 1465] },
  旭日: { count: 35, hash: '0701329f91a60d26bad9d9560d2e62634f512e5d0067dddd92f72bfdffa00b95', totals: [1246001, 20764, 1889] },
  苍穹: { count: 35, hash: '83d63793d2183e712ef03c208f16c79fe629d7cf9974754236d1f31fbf99f1b0', totals: [1293402, 23014, 2072] },
  云迹: { count: 35, hash: '75da6fc344736ad8bcb3315c0bd736f00cc03666f83447dd010ca4bb0937ae33', totals: [1535125, 25533, 2261] },
}

describe('强化材料数据与区间计算', () => {
  it.each(Object.keys(MATERIAL_DATA) as MaterialSeriesName[])('%s 的每一行数据与原项目完全一致', (name) => {
    const series = MATERIAL_DATA[name]
    const snapshot = sourceSnapshots[name]
    const rows = series.entries.map((entry) => [entry.level, entry.greenWater, entry.purpleStar, entry.protectionCharm])
    expect(rows).toHaveLength(snapshot.count)
    expect(series.maxLevel).toBe(snapshot.count)
    expect(rows.map((row) => row[0])).toEqual(Array.from({ length: snapshot.count }, (_, i) => i + 1))
    expect(createHash('sha256').update(JSON.stringify(rows)).digest('hex')).toBe(snapshot.hash)
    const full = calculateMaterials({ series: name, current: 0, target: series.maxLevel })
    expect([full.totals.greenWater, full.totals.purpleStar, full.totals.protectionCharm]).toEqual(snapshot.totals)
  })

  it('区间包含目标级、不包含当前级；单次与此前累计相互独立', () => {
    const result = calculateMaterials({ series: '破晓', current: 1, target: 3 })
    expect(result.totals).toEqual({ greenWater: 5672, purpleStar: 131, protectionCharm: 0 })
    expect(result.targetCost).toMatchObject({ greenWater: 3585, purpleStar: 131, protectionCharm: 0 })
    expect(result.rows[0].priorCost).toEqual({ greenWater: 0, purpleStar: 0, protectionCharm: 0 })
    expect(result.rows[2].priorCost).toEqual({ greenWater: 2696, purpleStar: 0, protectionCharm: 0 })
    expect(result.rows.filter((row) => row.inRange).map((row) => row.level)).toEqual([2, 3])
    expect(result.rows.filter((row) => row.isTarget).map((row) => row.level)).toEqual([3])
  })

  it('相同等级无区间消耗；+0 没有单次消耗', () => {
    for (const level of [0, 1, 30]) {
      const result = calculateMaterials({ series: '破晓', current: level, target: level })
      expect(result.levelCount).toBe(0)
      expect(result.totals).toEqual({ greenWater: 0, purpleStar: 0, protectionCharm: 0 })
      expect(result.rows.some((row) => row.inRange)).toBe(false)
    }
    expect(calculateMaterials({ series: '破晓', current: 0, target: 0 }).targetCost)
      .toEqual({ greenWater: 0, purpleStar: 0, protectionCharm: 0 })
  })

  it('将范围限制在系列支持的等级内，目标不得低于当前等级', () => {
    expect(normalizeMaterialQuery({ series: '破晓', current: 35, target: 1 }))
      .toEqual({ series: '破晓', current: 30, target: 30 })
    expect(normalizeMaterialQuery({ series: '云迹', current: -2, target: 100 }))
      .toEqual({ series: '云迹', current: 0, target: 35 })
    expect(normalizeMaterialQuery({ series: '晨曦', current: NaN, target: Infinity }))
      .toEqual({ series: '晨曦', current: 0, target: 0 })
  })

  it('所有合法区间均等于逐级相加的结果', () => {
    for (const name of Object.keys(MATERIAL_DATA) as MaterialSeriesName[]) {
      const series = MATERIAL_DATA[name]
      for (let current = 0; current <= series.maxLevel; current++) {
        for (let target = current; target <= series.maxLevel; target++) {
          const result = calculateMaterials({ series: name, current, target })
          const entries = series.entries.slice(current, target)
          for (const key of ['greenWater', 'purpleStar', 'protectionCharm'] as const) {
            expect(result.totals[key]).toBe(entries.reduce((sum, row) => sum + row[key], 0))
          }
        }
      }
    }
  })
})
