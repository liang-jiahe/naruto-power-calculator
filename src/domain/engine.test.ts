import { describe, expect, it } from 'vitest'
import {
  calculateAll,
  calculateCore,
  collectionMultiplier,
  getRuneResonance,
  getSummonCultivate,
} from './engine'
import { initialState } from './state'

describe('基础战力引擎', () => {
  it('使用正确的收集倍率结构', () => {
    expect(collectionMultiplier(20.3, 10)).toBeCloseTo(1.2233, 10)
  })

  it('按生命1、攻击3.5、防御11.6换算', () => {
    const result = calculateCore(
      { hp: 100, atk: 100, def: 100 },
      { collectionPct: 0, hpPct: 0, atkPct: 0, defPct: 0 },
      false,
    )
    expect(result.hp).toBe(100)
    expect(result.atk).toBe(350)
    expect(result.def).toBe(1160)
    expect(result.total).toBe(1610)
  })

  it('只在指定模块应用收集倍率', () => {
    const bonuses = { collectionPct: 20, hpPct: 10, atkPct: 0, defPct: 0 }
    expect(calculateCore({ hp: 100, atk: 0, def: 0 }, bonuses, true).total).toBeCloseTo(122)
    expect(calculateCore({ hp: 100, atk: 0, def: 0 }, bonuses, false).total).toBe(100)
  })
})

describe('查表边界', () => {
  it('覆盖符文阈值前、等于阈值和最高档', () => {
    expect(getRuneResonance(13_499).level).toBe(0)
    expect(getRuneResonance(13_500)).toEqual({ level: 1, hp: 600, atk: 200, def: 60 })
    expect(getRuneResonance(99_999).level).toBe(11)
  })

  it('1级第0次为0，跨级第0次等于上一级第4次', () => {
    expect(getSummonCultivate('忍犬', 1, 0).stats).toEqual({ hp: 0, atk: 0, def: 0 })
    expect(getSummonCultivate('忍犬', 2, 0).stats).toEqual(getSummonCultivate('忍犬', 1, 4).stats)
  })

  it('通灵等级超过上限时按上限计算', () => {
    const capped = getSummonCultivate('忍犬', 50, 4)
    const overflow = getSummonCultivate('忍犬', 999, 4)
    expect(overflow.maxLevel).toBe(50)
    expect(overflow.stats).toEqual(capped.stats)
  })
})

describe('组合计算', () => {
  it('等级20和170均有战力，异常等级没有等级战力', () => {
    const low = initialState()
    low.level = 20
    const high = initialState()
    high.level = 170
    const invalid = initialState()
    invalid.level = 171
    expect(calculateAll(low).sections.level.total).toBeGreaterThan(0)
    expect(calculateAll(high).sections.level.total).toBeGreaterThan(calculateAll(low).sections.level.total)
    expect(calculateAll(invalid).sections.level.total).toBe(0)
  })

  it('通灵进阶属性不会小于0', () => {
    const state = initialState()
    state.summon.level = 20
    state.summon.enhance = 4
    state.summon.total = { hp: 1, atk: 1, def: 1 }
    expect(calculateAll(state).summon.advance).toEqual({ hp: 0, atk: 0, def: 0 })
  })

  it('直接战力进入总战力但不进入面板属性', () => {
    const state = initialState()
    state.level = 171
    state.accessories.runes.earrings.power = 20_000
    state.tools.museumDirectPower = 5_000
    state.tools.treasureDirectPower = 3_000
    const result = calculateAll(state)
    expect(result.unattributedPower).toBe(28_000)
    expect(result.grandTotal).toBeGreaterThan(28_000)
    expect(result.panel.hp).toBeGreaterThan(0)
  })

  it('藏馆模式只采用当前模式的数据', () => {
    const state = initialState()
    state.level = 171
    state.tools.museumDirectPower = 1_000
    state.tools.museumStats.hp = 2_000
    expect(calculateAll(state).sections.toolMuseum.total).toBe(1_000)
    state.tools.museumMode = 'calculated'
    expect(calculateAll(state).sections.toolMuseum.total).toBe(2_000)
  })

  it('综合战力等于全部16项之和且保持高精度', () => {
    const state = initialState()
    state.simple.equipment = { hp: 1.111, atk: 2.222, def: 3.333 }
    state.simple.outfit = { hp: 4.444, atk: 5.555, def: 6.666 }
    const result = calculateAll(state)
    const sum = Object.values(result.sections).reduce((total, item) => total + item.total, 0)
    expect(Object.keys(result.sections)).toHaveLength(16)
    expect(result.grandTotal).toBeCloseTo(sum, 10)
  })
})
