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
  weeklyPack: false,
  packOffset: 0,
  startDate: '2026-07-29',
}

describe('升级经验数据', () => {
  it('完整迁移 140—170 级经验与收益表', () => {
    expect(UPGRADE_LEVEL_DATA).toHaveLength(31)
    expect(UPGRADE_LEVEL_DATA[0]).toMatchObject({ level: 140, expNeeded: 10_035_498, activeTotal: 75_074 })
    expect(UPGRADE_LEVEL_DATA.at(-1)).toMatchObject({ level: 170, expNeeded: null })
  })

  it('跨多级累计并扣除本级已有经验', () => {
    expect(totalRemainingExperience(140, 35_498, 141)).toBe(10_000_000)
    expect(totalRemainingExperience(140, 35_498, 142)).toBe(10_000_000 + 11_035_498)
    expect(totalRemainingExperience(150, 123, 150)).toBe(0)
  })
})

describe('逐日升级推演', () => {
  it('叠加 V 等级和超影丰饶加成并向下取整', () => {
    expect(simulateUpgrade(baseConfig).firstDay?.bountyExp).toBe(Math.floor(73_410 * 1.2))
    expect(simulateUpgrade({ ...baseConfig, vipLevel: 14 }).firstDay?.bountyExp).toBe(Math.floor(73_410 * 1.3))
    expect(simulateUpgrade({ ...baseConfig, superKage: true }).firstDay?.bountyExp).toBe(Math.floor(73_410 * 1.5))
    expect(simulateUpgrade({ ...baseConfig, vipLevel: 14, superKage: true }).firstDay?.bountyExp).toBe(
      Math.floor(73_410 * 1.6),
    )
  })

  it.each([
    [0, 438, 43, 0, 8],
    [3, 588, 58, 0, 8],
    [6, 738, 65, 4, 8],
    [9, 888, 65, 11, 18],
  ] as const)('每日 %i 体时优先精英再刷修罗', (staminaBodies, stamina, elite, shura, remaining) => {
    const day = simulateUpgrade({ ...baseConfig, staminaBodies }).firstDay
    expect(day).toMatchObject({
      addedStamina: stamina,
      eliteRuns: elite,
      shuraRuns: shura,
      remainingStamina: remaining,
    })
  })

  it('每周礼包按偏移日加入 150 体力', () => {
    const today = simulateUpgrade({ ...baseConfig, weeklyPack: true, packOffset: 0 }).firstDay
    const tomorrow = simulateUpgrade({ ...baseConfig, weeklyPack: true, packOffset: 1 }).firstDay
    expect(today?.addedStamina).toBe(738)
    expect(tomorrow?.addedStamina).toBe(588)
  })

  it('只差一点经验时当天完成', () => {
    const result = simulateUpgrade({ ...baseConfig, currentExp: 10_035_497 })
    expect(result.days).toBe(1)
    expect(result.milestones[0].dateReached).toEqual(new Date(2026, 6, 29, 12))
  })

  it('兼容未提供买体选项的旧配置并默认三体', () => {
    const { staminaBodies: _staminaBodies, ...legacy } = baseConfig
    expect(simulateUpgrade(legacy).firstDay?.addedStamina).toBe(588)
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
    expect(() => simulateUpgrade({ ...baseConfig, packOffset: 7 })).toThrow('0 到 6')
  })

  it('超过逐日推演安全上限时停止计算', () => {
    expect(() => simulateUpgrade(baseConfig, 0)).toThrow('20,000 天安全上限')
  })
})
