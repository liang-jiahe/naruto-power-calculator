import { describe, expect, it } from 'vitest'
import { calculateAll, collectionMultiplier } from './engine'
import { initialState } from './state'

const bonuses = { collectionPct: 20.3, hpPct: 10, atkPct: 20, defPct: 30 }
const hpFactor = collectionMultiplier(bonuses.collectionPct, bonuses.hpPct)
const atkFactor = collectionMultiplier(bonuses.collectionPct, bonuses.atkPct)
const defFactor = collectionMultiplier(bonuses.collectionPct, bonuses.defPct)
const coreWithCollection = (hp: number, atk: number, def: number) =>
  hp * hpFactor + atk * 3.5 * atkFactor + def * 11.6 * defFactor
const coreDirect = (hp: number, atk: number, def: number) => hp + atk * 3.5 + def * 11.6

describe('参考网页逐模块公式对照', () => {
  it('装备、勾玉、神器、秘卷、称号、头像框均使用相同收集公式', () => {
    const state = initialState()
    state.bonuses = bonuses
    const expected = coreWithCollection(100, 20, 5)
    for (const key of ['equipment', 'magatama', 'artifact', 'scroll', 'title', 'avatar'] as const) {
      state.simple[key] = { hp: 100, atk: 20, def: 5 }
    }
    const result = calculateAll(state)
    for (const key of ['equipment', 'magatama', 'artifact', 'scroll', 'title', 'avatar']) {
      expect(result.sections[key].total).toBeCloseTo(expected, 10)
    }
  })

  it('装扮、忍魂羁绊不吃收集加成', () => {
    const state = initialState()
    state.bonuses = bonuses
    state.simple.outfit = { hp: 100, atk: 20, def: 5 }
    state.soul.bond = { hp: 100, atk: 20, def: 5 }
    state.soul.insight = { hp: 0, atk: 0, def: 0 }
    const expected = coreDirect(100, 20, 5)
    const result = calculateAll(state)
    expect(result.sections.outfit.total).toBeCloseTo(expected, 10)
    expect(result.sections.soul.total).toBeCloseTo(expected, 10)
  })

  it('普通与修罗天赋分别计算后相加', () => {
    const state = initialState()
    state.bonuses = bonuses
    state.talent.normal = { hp: 100, atk: 20, def: 5 }
    state.talent.shura = { hp: 200, atk: 40, def: 10 }
    expect(calculateAll(state).sections.talent.total).toBeCloseTo(
      coreWithCollection(100, 20, 5) + coreWithCollection(200, 40, 10),
      10,
    )
  })

  it('饰品只计算三维、暴击、抗暴、符文直接战力和符文共鸣', () => {
    const state = initialState()
    state.bonuses = bonuses
    state.accessories.stats = {
      hp: 100,
      atk: 20,
      def: 5,
      crit: 7,
      antiCrit: 9,
      elementAtk: { fire: 999, water: 0, wind: 0, thunder: 0, earth: 0 },
      elementDef: { fire: 999, water: 0, wind: 0, thunder: 0, earth: 0 },
    }
    state.accessories.runes.earrings.power = 13_500
    const result = calculateAll(state)
    const resonance = coreWithCollection(600, 200, 60)
    const expected = coreWithCollection(100, 20, 5) + 7 * 6 + 9 * 10 + 13_500 + resonance
    expect(result.sections.accessories.total).toBeCloseTo(expected, 10)
    expect(result.sections.accessories.elementAtk).toBe(0)
    expect(result.sections.accessories.elementDef).toBe(0)
  })

  it('忍具穿戴计算元素，重铸忽略元素，藏馆和珍品阁服从模式', () => {
    const state = initialState()
    state.bonuses = bonuses
    state.tools.panel.hp = 100
    state.tools.panel.crit = 2
    state.tools.panel.elementAtk.fire = 3
    state.tools.panel.elementDef.water = 4
    state.tools.reforge.hp = 100
    state.tools.reforge.crit = 2
    state.tools.reforge.elementAtk.fire = 999
    state.tools.museumMode = 'calculated'
    state.tools.museumStats.hp = 100
    state.tools.museumStats.elementAtk.fire = 3
    state.tools.treasureMode = 'calculated'
    state.tools.treasureElementDef.fire = 4
    const result = calculateAll(state)
    expect(result.sections.toolPanel.total).toBeCloseTo(100 * hpFactor + 2 * 6 + 3 * 6 + 4 * 10, 10)
    expect(result.sections.toolReforge.total).toBe(100 + 2 * 6)
    expect(result.sections.toolMuseum.total).toBe(100 + 3 * 6)
    expect(result.sections.toolTreasure.total).toBe(4 * 10)
  })

  it('总战力保留参考网页16个分项，且总面板包含可归属属性', () => {
    const result = calculateAll(initialState())
    expect(Object.keys(result.sections).sort()).toEqual(
      [
        'accessories',
        'artifact',
        'avatar',
        'equipment',
        'level',
        'magatama',
        'outfit',
        'scroll',
        'soul',
        'summoning',
        'talent',
        'title',
        'toolMuseum',
        'toolPanel',
        'toolReforge',
        'toolTreasure',
      ].sort(),
    )
    expect(result.panel.hp).toBeGreaterThan(0)
    expect(result.panel.atk).toBeGreaterThan(0)
    expect(result.panel.def).toBeGreaterThan(0)
  })
})
