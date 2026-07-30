export type ElementKey = 'fire' | 'water' | 'wind' | 'thunder' | 'earth'
export type SimpleModuleKey =
  | 'equipment'
  | 'magatama'
  | 'artifact'
  | 'scroll'
  | 'outfit'
  | 'title'
  | 'avatar'

export interface CoreStats {
  hp: number
  atk: number
  def: number
}

export interface ElementStats {
  fire: number
  water: number
  wind: number
  thunder: number
  earth: number
}

export interface AttributeStats extends CoreStats {
  crit: number
  antiCrit: number
  elementAtk: ElementStats
  elementDef: ElementStats
}

export interface BonusConfig {
  collectionPct: number
  hpPct: number
  atkPct: number
  defPct: number
}

export interface RuneSlot {
  power: number
}

export interface SummonState {
  beast: string
  level: number
  enhance: number
  total: CoreStats
}

export type ToolMode = 'direct' | 'calculated'

export interface ToolState {
  panel: AttributeStats
  reforge: AttributeStats
  museumMode: ToolMode
  museumDirectPower: number
  museumStats: AttributeStats
  treasureMode: ToolMode
  treasureDirectPower: number
  treasureElementDef: ElementStats
}

export interface CalculatorState {
  bonuses: BonusConfig
  level: number
  simple: Record<SimpleModuleKey, CoreStats>
  talent: {
    normal: CoreStats
    shura: CoreStats
  }
  soul: {
    insight: CoreStats
    bond: CoreStats
  }
  summon: SummonState
  accessories: {
    stats: AttributeStats
    runes: Record<string, RuneSlot>
  }
  tools: ToolState
}

export interface PowerBreakdown {
  hp: number
  atk: number
  def: number
  crit: number
  antiCrit: number
  elementAtk: number
  elementDef: number
  direct: number
  total: number
}

export interface PanelStats extends CoreStats {
  crit: number
  antiCrit: number
  elementAtk: number
  elementDef: number
}

export interface RuneResonance extends CoreStats {
  level: number
}

export interface CalculationResult {
  sections: Record<string, PowerBreakdown>
  grandTotal: number
  panel: PanelStats
  unattributedPower: number
  summon: {
    cultivate: CoreStats
    advance: CoreStats
    maxLevel: number
  }
  runes: Record<string, RuneResonance>
}
