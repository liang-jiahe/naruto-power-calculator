import { SUMMON_DATA } from './data'
import { zeroAttributes, zeroCore, zeroElements } from './engine'
import type { CalculatorState, CoreStats, ElementStats, ToolMode } from './types'

export const STORAGE_KEY = 'ninja-power-calculator-v1'
export const STATE_VERSION = 1
export const RUNE_SLOTS = ['earrings', 'necklace', 'bracelet', 'ring', 'badge', 'belt'] as const

export const initialState = (): CalculatorState => ({
  bonuses: { collectionPct: 20.3, hpPct: 0, atkPct: 0, defPct: 0 },
  level: 100,
  simple: {
    equipment: zeroCore(),
    magatama: zeroCore(),
    artifact: zeroCore(),
    scroll: zeroCore(),
    outfit: zeroCore(),
    title: zeroCore(),
    avatar: zeroCore(),
  },
  talent: { normal: zeroCore(), shura: zeroCore() },
  soul: { insight: zeroCore(), bond: zeroCore() },
  summon: { beast: Object.keys(SUMMON_DATA)[0], level: 1, enhance: 0, total: zeroCore() },
  accessories: {
    stats: zeroAttributes(),
    runes: Object.fromEntries(RUNE_SLOTS.map((slot) => [slot, { power: 0 }])),
  },
  tools: {
    panel: zeroAttributes(),
    reforge: zeroAttributes(),
    museumMode: 'direct',
    museumDirectPower: 0,
    museumStats: zeroAttributes(),
    treasureMode: 'direct',
    treasureDirectPower: 0,
    treasureElementDef: zeroElements(),
  },
})

const number = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
const mode = (value: unknown): ToolMode => (value === 'calculated' ? 'calculated' : 'direct')

const core = (value: unknown, fallback: CoreStats): CoreStats => {
  const item = object(value)
  return {
    hp: number(item.hp, fallback.hp),
    atk: number(item.atk, fallback.atk),
    def: number(item.def, fallback.def),
  }
}

const elements = (value: unknown, fallback: ElementStats): ElementStats => {
  const item = object(value)
  return {
    fire: number(item.fire, fallback.fire),
    water: number(item.water, fallback.water),
    wind: number(item.wind, fallback.wind),
    thunder: number(item.thunder, fallback.thunder),
    earth: number(item.earth, fallback.earth),
  }
}

const attributes = (value: unknown, fallback: ReturnType<typeof zeroAttributes>) => {
  const item = object(value)
  return {
    ...core(item, fallback),
    crit: number(item.crit, fallback.crit),
    antiCrit: number(item.antiCrit, fallback.antiCrit),
    elementAtk: elements(item.elementAtk, fallback.elementAtk),
    elementDef: elements(item.elementDef, fallback.elementDef),
  }
}

export function sanitizeState(value: unknown): CalculatorState {
  const fallback = initialState()
  const root = object(value)
  const bonuses = object(root.bonuses)
  const simple = object(root.simple)
  const talent = object(root.talent)
  const soul = object(root.soul)
  const summon = object(root.summon)
  const accessories = object(root.accessories)
  const runes = object(accessories.runes)
  const tools = object(root.tools)
  const requestedBeast = typeof summon.beast === 'string' ? summon.beast : fallback.summon.beast
  const beast = requestedBeast in SUMMON_DATA ? requestedBeast : fallback.summon.beast

  return {
    bonuses: {
      collectionPct: number(bonuses.collectionPct, fallback.bonuses.collectionPct),
      hpPct: number(bonuses.hpPct),
      atkPct: number(bonuses.atkPct),
      defPct: number(bonuses.defPct),
    },
    level: Math.min(170, Math.max(20, Math.trunc(number(root.level, fallback.level)))),
    simple: {
      equipment: core(simple.equipment, fallback.simple.equipment),
      magatama: core(simple.magatama, fallback.simple.magatama),
      artifact: core(simple.artifact, fallback.simple.artifact),
      scroll: core(simple.scroll, fallback.simple.scroll),
      outfit: core(simple.outfit, fallback.simple.outfit),
      title: core(simple.title, fallback.simple.title),
      avatar: core(simple.avatar, fallback.simple.avatar),
    },
    talent: {
      normal: core(talent.normal, fallback.talent.normal),
      shura: core(talent.shura, fallback.talent.shura),
    },
    soul: {
      insight: core(soul.insight, fallback.soul.insight),
      bond: core(soul.bond, fallback.soul.bond),
    },
    summon: {
      beast,
      level: Math.min(SUMMON_DATA[beast].length, Math.max(1, Math.trunc(number(summon.level, 1)))),
      enhance: Math.min(4, Math.max(0, Math.trunc(number(summon.enhance)))),
      total: core(summon.total, fallback.summon.total),
    },
    accessories: {
      stats: attributes(accessories.stats, fallback.accessories.stats),
      runes: Object.fromEntries(
        RUNE_SLOTS.map((slot) => [slot, { power: number(object(runes[slot]).power) }]),
      ),
    },
    tools: {
      panel: attributes(tools.panel, fallback.tools.panel),
      reforge: attributes(tools.reforge, fallback.tools.reforge),
      museumMode: mode(tools.museumMode),
      museumDirectPower: number(tools.museumDirectPower),
      museumStats: attributes(tools.museumStats, fallback.tools.museumStats),
      treasureMode: mode(tools.treasureMode),
      treasureDirectPower: number(tools.treasureDirectPower),
      treasureElementDef: elements(tools.treasureElementDef, fallback.tools.treasureElementDef),
    },
  }
}

export function exportPayload(state: CalculatorState) {
  return {
    app: '忍界战力计算器',
    version: STATE_VERSION,
    savedAt: new Date().toISOString(),
    state,
  }
}

export function parsePayload(value: unknown): CalculatorState {
  const payload = object(value)
  if (payload.version !== STATE_VERSION || !payload.state || typeof payload.state !== 'object') {
    throw new Error('文件版本或结构不受支持')
  }
  return sanitizeState(payload.state)
}
