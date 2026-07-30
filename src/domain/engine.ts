import { LEVEL_DATA, RUNE_RESONANCE_TABLE, SUMMON_DATA } from './data'
import type {
  AttributeStats,
  BonusConfig,
  CalculationResult,
  CalculatorState,
  CoreStats,
  ElementStats,
  PanelStats,
  PowerBreakdown,
  RuneResonance,
} from './types'

export const COEFFICIENTS = {
  hp: 1,
  atk: 3.5,
  def: 11.6,
  crit: 6,
  antiCrit: 10,
  elementAtk: 6,
  elementDef: 10,
} as const

const emptyBreakdown = (): PowerBreakdown => ({
  hp: 0,
  atk: 0,
  def: 0,
  crit: 0,
  antiCrit: 0,
  elementAtk: 0,
  elementDef: 0,
  direct: 0,
  total: 0,
})

const finite = (value: number) => (Number.isFinite(value) && value >= 0 ? value : 0)
const sumElements = (values: ElementStats) =>
  finite(values.fire) + finite(values.water) + finite(values.wind) + finite(values.thunder) + finite(values.earth)

export const collectionMultiplier = (collectionPct: number, attributePct: number) =>
  1 + finite(collectionPct) / 100 * (1 + finite(attributePct) / 100)

export function calculateCore(stats: CoreStats, bonuses: BonusConfig, withCollection: boolean): PowerBreakdown {
  const hpMultiplier = withCollection ? collectionMultiplier(bonuses.collectionPct, bonuses.hpPct) : 1
  const atkMultiplier = withCollection ? collectionMultiplier(bonuses.collectionPct, bonuses.atkPct) : 1
  const defMultiplier = withCollection ? collectionMultiplier(bonuses.collectionPct, bonuses.defPct) : 1
  const result = emptyBreakdown()
  result.hp = finite(stats.hp) * COEFFICIENTS.hp * hpMultiplier
  result.atk = finite(stats.atk) * COEFFICIENTS.atk * atkMultiplier
  result.def = finite(stats.def) * COEFFICIENTS.def * defMultiplier
  result.total = result.hp + result.atk + result.def
  return result
}

export function calculateAttributes(
  stats: AttributeStats,
  bonuses: BonusConfig,
  withCollection: boolean,
): PowerBreakdown {
  const result = calculateCore(stats, bonuses, withCollection)
  result.crit = finite(stats.crit) * COEFFICIENTS.crit
  result.antiCrit = finite(stats.antiCrit) * COEFFICIENTS.antiCrit
  result.elementAtk = sumElements(stats.elementAtk) * COEFFICIENTS.elementAtk
  result.elementDef = sumElements(stats.elementDef) * COEFFICIENTS.elementDef
  result.total += result.crit + result.antiCrit + result.elementAtk + result.elementDef
  return result
}

export function combineBreakdowns(...items: PowerBreakdown[]): PowerBreakdown {
  const result = emptyBreakdown()
  for (const item of items) {
    result.hp += item.hp
    result.atk += item.atk
    result.def += item.def
    result.crit += item.crit
    result.antiCrit += item.antiCrit
    result.elementAtk += item.elementAtk
    result.elementDef += item.elementDef
    result.direct += item.direct
  }
  result.total =
    result.hp +
    result.atk +
    result.def +
    result.crit +
    result.antiCrit +
    result.elementAtk +
    result.elementDef +
    result.direct
  return result
}

export function directPower(power: number): PowerBreakdown {
  const result = emptyBreakdown()
  result.direct = finite(power)
  result.total = result.direct
  return result
}

export function getRuneResonance(power: number): RuneResonance {
  let result: RuneResonance = { level: 0, hp: 0, atk: 0, def: 0 }
  for (let index = 0; index < RUNE_RESONANCE_TABLE.length; index += 1) {
    const [threshold, hp, atk, def] = RUNE_RESONANCE_TABLE[index]
    if (finite(power) < threshold) break
    result = { level: index + 1, hp, atk, def }
  }
  return result
}

export function getSummonCultivate(beast: string, level: number, enhance: number) {
  const table = SUMMON_DATA[beast] ?? SUMMON_DATA[Object.keys(SUMMON_DATA)[0]]
  const maxLevel = table.length
  let safeLevel = Math.min(maxLevel, Math.max(1, Math.trunc(finite(level) || 1)))
  let safeEnhance = Math.min(4, Math.max(0, Math.trunc(finite(enhance))))
  if (safeEnhance === 0) {
    if (safeLevel === 1) return { stats: { hp: 0, atk: 0, def: 0 }, maxLevel }
    safeLevel -= 1
    safeEnhance = 4
  }
  const row = table[safeLevel - 1]
  const offset = (safeEnhance - 1) * 3
  return {
    stats: {
      atk: row[offset],
      def: row[offset + 1],
      hp: row[offset + 2],
    },
    maxLevel,
  }
}

export function calculateAll(state: CalculatorState): CalculationResult {
  const { bonuses } = state
  const sections: Record<string, PowerBreakdown> = {}

  const levelRow = LEVEL_DATA[String(Math.trunc(state.level))]
  sections.level = levelRow
    ? combineBreakdowns(
        calculateCore({ hp: levelRow[0], atk: levelRow[1], def: levelRow[2] }, bonuses, true),
        calculateAttributes(
          {
            hp: 0,
            atk: 0,
            def: 0,
            crit: levelRow[3],
            antiCrit: levelRow[4],
            elementAtk: zeroElements(),
            elementDef: zeroElements(),
          },
          bonuses,
          false,
        ),
      )
    : emptyBreakdown()

  sections.equipment = calculateCore(state.simple.equipment, bonuses, true)
  sections.magatama = calculateCore(state.simple.magatama, bonuses, true)
  sections.artifact = calculateCore(state.simple.artifact, bonuses, true)
  sections.scroll = calculateCore(state.simple.scroll, bonuses, true)
  sections.outfit = calculateCore(state.simple.outfit, bonuses, false)
  sections.title = calculateCore(state.simple.title, bonuses, true)
  sections.avatar = calculateCore(state.simple.avatar, bonuses, true)
  sections.talent = combineBreakdowns(
    calculateCore(state.talent.normal, bonuses, true),
    calculateCore(state.talent.shura, bonuses, true),
  )
  sections.soul = combineBreakdowns(
    calculateCore(state.soul.insight, bonuses, true),
    calculateCore(state.soul.bond, bonuses, false),
  )

  const summonLookup = getSummonCultivate(state.summon.beast, state.summon.level, state.summon.enhance)
  const advance = {
    hp: Math.max(0, finite(state.summon.total.hp) - summonLookup.stats.hp),
    atk: Math.max(0, finite(state.summon.total.atk) - summonLookup.stats.atk),
    def: Math.max(0, finite(state.summon.total.def) - summonLookup.stats.def),
  }
  sections.summoning = combineBreakdowns(
    calculateCore(summonLookup.stats, bonuses, true),
    calculateCore(advance, bonuses, false),
  )

  const runeResults: Record<string, RuneResonance> = {}
  let runeDirect = 0
  let resonance: CoreStats = { hp: 0, atk: 0, def: 0 }
  for (const [slot, rune] of Object.entries(state.accessories.runes)) {
    const match = getRuneResonance(rune.power)
    runeResults[slot] = match
    runeDirect += finite(rune.power)
    resonance = {
      hp: resonance.hp + match.hp,
      atk: resonance.atk + match.atk,
      def: resonance.def + match.def,
    }
  }
  sections.accessories = combineBreakdowns(
    calculateAttributes(state.accessories.stats, bonuses, true),
    calculateCore(resonance, bonuses, true),
    directPower(runeDirect),
  )

  sections.toolPanel = calculateAttributes(state.tools.panel, bonuses, true)
  sections.toolReforge = calculateAttributes(state.tools.reforge, bonuses, false)
  sections.toolMuseum =
    state.tools.museumMode === 'direct'
      ? directPower(state.tools.museumDirectPower)
      : calculateAttributes(state.tools.museumStats, bonuses, false)
  sections.toolTreasure =
    state.tools.treasureMode === 'direct'
      ? directPower(state.tools.treasureDirectPower)
      : (() => {
          const result = emptyBreakdown()
          result.elementDef = sumElements(state.tools.treasureElementDef) * COEFFICIENTS.elementDef
          result.total = result.elementDef
          return result
        })()

  const all = Object.values(sections)
  const combined = combineBreakdowns(...all)
  const panel: PanelStats = {
    hp: combined.hp / COEFFICIENTS.hp,
    atk: combined.atk / COEFFICIENTS.atk,
    def: combined.def / COEFFICIENTS.def,
    crit: combined.crit / COEFFICIENTS.crit,
    antiCrit: combined.antiCrit / COEFFICIENTS.antiCrit,
    elementAtk: combined.elementAtk / COEFFICIENTS.elementAtk,
    elementDef: combined.elementDef / COEFFICIENTS.elementDef,
  }

  return {
    sections,
    grandTotal: combined.total,
    panel,
    unattributedPower: combined.direct,
    summon: {
      cultivate: summonLookup.stats,
      advance,
      maxLevel: summonLookup.maxLevel,
    },
    runes: runeResults,
  }
}

export const zeroCore = (): CoreStats => ({ hp: 0, atk: 0, def: 0 })
export const zeroElements = (): ElementStats => ({ fire: 0, water: 0, wind: 0, thunder: 0, earth: 0 })
export const zeroAttributes = (): AttributeStats => ({
  ...zeroCore(),
  crit: 0,
  antiCrit: 0,
  elementAtk: zeroElements(),
  elementDef: zeroElements(),
})
