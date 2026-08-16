import { describe, expect, it } from 'vitest'
import {
  UPGRADE_LEVEL_DATA,
  getUpgradeLevelData,
  simulateUpgrade,
  totalRemainingExperience,
  type UpgradeConfig,
} from './calculator'

const baseConfig: UpgradeConfig = {
  currentLevel: 140,
  currentExp: 0,
  targetLevel: 141,
  vipLevel: 10,
  superKage: false,
  staminaBodies: 3,
  otherWeeklyStamina: 0,
  startDate: '2026-07-29',
}

describe('升级经验数据', () => {
  it('完整迁移 140—170 级经验与收益表', () => {
    expect(UPGRADE_LEVEL_DATA).toHaveLength(31)
    expect(UPGRADE_LEVEL_DATA[0]).toMatchObject({ level: 140, expNeeded: 10_035_498, activeTotal: 75_087.8896 })
    expect(UPGRADE_LEVEL_DATA.at(-1)).toMatchObject({ level: 170, expNeeded: null })
  })

  it('跨多级累计并扣除本级已有经验', () => {
    expect(totalRemainingExperience(140, 35_498, 141)).toBe(10_000_000)
    expect(totalRemainingExperience(140, 35_498, 142)).toBe(10_000_000 + 11_035_498)
    expect(totalRemainingExperience(150, 123, 150)).toBe(0)
  })

  it('141 级收益与参考计算器一致', () => {
    expect(getUpgradeLevelData(141)).toMatchObject({
      bountyV10: 114_166.525,
      bountyV14: 121_777.6802,
      activeTotal: 76_517.2276,
      normalExp: 803,
      shuraExp: 4_281.596,
    })
  })

  it('140—169 级 V10/V14 丰饶数据完整匹配参考表', () => {
    expect(UPGRADE_LEVEL_DATA.slice(0, -1).map((row) => Math.round(row.bountyV10))).toEqual([
      112_034, 114_167, 116_299, 118_432, 120_849, 124_403, 127_958, 131_512, 135_066, 138_621,
      142_175, 145_729, 149_284, 152_838, 156_393, 159_947, 167_411, 167_553, 167_695, 167_838,
      167_980, 168_051, 168_122, 168_193, 168_264, 168_335, 168_406, 168_477, 168_548, 168_620,
    ])
    expect(UPGRADE_LEVEL_DATA.slice(0, -1).map((row) => Math.round(row.bountyV14))).toEqual([
      119_503, 121_778, 124_052, 126_327, 128_905, 132_697, 136_488, 140_279, 144_071, 147_862,
      151_653, 155_445, 159_236, 163_027, 166_819, 170_610, 178_572, 178_724, 178_875, 179_027,
      179_178, 179_254, 179_330, 179_406, 179_482, 179_558, 179_633, 179_709, 179_785, 179_861,
    ])
  })
})

describe('逐日升级推演', () => {
  it('使用逐级 V10/V14 丰饶表并叠加超影基础加成', () => {
    const level140 = getUpgradeLevelData(140)!
    const superBonus = (level140.bountyV10 / 1.2) * 0.3
    expect(simulateUpgrade(baseConfig).firstDay?.bountyExp).toBe(Math.round(level140.bountyV10))
    expect(simulateUpgrade({ ...baseConfig, vipLevel: 14 }).firstDay?.bountyExp).toBe(Math.round(level140.bountyV14))
    expect(simulateUpgrade({ ...baseConfig, superKage: true }).firstDay?.bountyExp).toBe(
      Math.round(level140.bountyV10 + superBonus),
    )
    expect(simulateUpgrade({ ...baseConfig, vipLevel: 14, superKage: true }).firstDay?.bountyExp).toBe(
      Math.round(level140.bountyV14 + superBonus),
    )
  })

  it.each([
    [0, 440, 44, 0, 0],
    [3, 590, 59, 0, 0],
    [6, 740, 74, 0, 0],
    [9, 890, 75, 7, 0],
  ] as const)('每日 %i 体时优先精英再刷修罗', (staminaBodies, stamina, elite, shura, remaining) => {
    const day = simulateUpgrade({ ...baseConfig, staminaBodies }).firstDay
    expect(day).toMatchObject({
      addedStamina: stamina,
      eliteRuns: elite,
      shuraRuns: shura,
      remainingStamina: remaining,
    })
  })

  it('按平均每日收益给出两位小数所需天数', () => {
    const result = simulateUpgrade({
      ...baseConfig,
      currentLevel: 141,
      targetLevel: 142,
      otherWeeklyStamina: 500,
    })
    expect(result.preciseDays).toBeCloseTo(37.1679, 4)
    expect(result.days).toBe(38)
  })

  it('其他每周体力按七日平均计入每日基础体力', () => {
    const result = simulateUpgrade({ ...baseConfig, otherWeeklyStamina: 500 })
    expect(result.baseStamina).toBeCloseTo(590 + 500 / 7)
    expect(result.firstDay?.addedStamina).toBeCloseTo(590 + 500 / 7)
  })

  it('只差一点经验时当天完成', () => {
    const result = simulateUpgrade({ ...baseConfig, currentExp: 10_035_497 })
    expect(result.days).toBe(1)
    expect(result.milestones[0].dateReached).toEqual(new Date(2026, 6, 29, 12))
  })

  it('兼容未提供买体选项的旧配置并默认三体', () => {
    const {
      staminaBodies: _staminaBodies,
      otherWeeklyStamina: _otherWeeklyStamina,
      ...legacy
    } = baseConfig
    expect(simulateUpgrade(legacy).firstDay?.addedStamina).toBe(590)
  })

  it('当前等级等于目标等级时返回零天', () => {
    const result = simulateUpgrade({ ...baseConfig, targetLevel: 140 })
    expect(result.days).toBe(0)
    expect(result.firstDay).toBeNull()
    expect(result.milestones).toEqual([])
  })

  it('在 170 级边界阻止继续升级和非法经验', () => {
    expect(() => totalRemainingExperience(170, 0, 169)).toThrow('目标等级不能低于')
    expect(() => simulateUpgrade({ ...baseConfig, currentLevel: 170, targetLevel: 170, currentExp: 1 })).toThrow(
      '满级',
    )
  })

  it('拒绝无效日期和越界配置', () => {
    expect(() => simulateUpgrade({ ...baseConfig, startDate: '2026-02-30' })).toThrow('有效的开始计算日期')
    expect(() => simulateUpgrade({ ...baseConfig, currentExp: getUpgradeLevelData(140)?.expNeeded ?? 0 })).toThrow(
      '当前经验应在',
    )
    expect(() => simulateUpgrade({ ...baseConfig, otherWeeklyStamina: -1 })).toThrow('其他每周体力')
  })

  it('超过逐日推演安全上限时停止计算', () => {
    expect(() => simulateUpgrade(baseConfig, 0)).toThrow('20,000 天安全上限')
  })
})
