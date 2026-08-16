export interface UpgradeLevelRow {
  level: number
  expNeeded: number | null
  bountyV10: number
  bountyV14: number
  activeTotal: number
  normalExp: number
  shuraExp: number
}

export type StaminaBodies = 0 | 3 | 6 | 9

export const DAILY_STAMINA_SOURCES = {
  natural: 240,
  ramen: 150,
  friendGift: 50,
} as const

export const BASE_DAILY_STAMINA =
  DAILY_STAMINA_SOURCES.natural + DAILY_STAMINA_SOURCES.ramen + DAILY_STAMINA_SOURCES.friendGift

export interface UpgradeConfig {
  currentLevel: number
  currentExp: number
  targetLevel: number
  vipLevel: number
  superKage: boolean
  staminaBodies: StaminaBodies
  otherWeeklyStamina: number
  startDate: string
}

export interface UpgradeMilestone {
  fromLevel: number
  toLevel: number
  required: number
  deducted: number
  remaining: number
  dateReached: Date | null
}

export interface UpgradeDaySummary {
  date: Date
  addedStamina: number
  eliteRuns: number
  shuraRuns: number
  dungeonExp: number
  activeExp: number
  bountyExp: number
  remainingStamina: number
}

export interface UpgradeResult {
  days: number
  preciseDays: number
  completionDate: Date
  baseStamina: number
  remainingStamina: number
  milestones: UpgradeMilestone[]
  firstDay: UpgradeDaySummary | null
  totals: {
    dungeonExp: number
    activeExp: number
    bountyExp: number
    eliteRuns: number
    shuraRuns: number
  }
}

export const UPGRADE_LEVEL_DATA: readonly UpgradeLevelRow[] = [
  { level: 140, expNeeded: 10035498, bountyV10: 112033.9, bountyV14: 119502.8792, activeTotal: 75087.8896, normalExp: 788, shuraExp: 4201.616 },
  { level: 141, expNeeded: 11035498, bountyV10: 114166.525, bountyV14: 121777.6802, activeTotal: 76517.2276, normalExp: 803, shuraExp: 4281.596 },
  { level: 142, expNeeded: 12035498, bountyV10: 116299.15, bountyV14: 124052.4812, activeTotal: 77946.5656, normalExp: 818, shuraExp: 4361.576 },
  { level: 143, expNeeded: 13015782, bountyV10: 118431.775, bountyV14: 126327.2822, activeTotal: 79375.9036, normalExp: 833, shuraExp: 4441.556 },
  { level: 144, expNeeded: 15045458, bountyV10: 120848.75, bountyV14: 128905.39, activeTotal: 80995.82, normalExp: 850, shuraExp: 4532.2 },
  { level: 145, expNeeded: 16045458, bountyV10: 124403.125, bountyV14: 132696.725, activeTotal: 83378.05, normalExp: 875, shuraExp: 4665.5 },
  { level: 146, expNeeded: 16545458, bountyV10: 127957.5, bountyV14: 136488.06, activeTotal: 85760.28, normalExp: 900, shuraExp: 4798.8 },
  { level: 147, expNeeded: 17045458, bountyV10: 131511.875, bountyV14: 140279.395, activeTotal: 88142.51, normalExp: 925, shuraExp: 4932.1 },
  { level: 148, expNeeded: 17545458, bountyV10: 135066.25, bountyV14: 144070.73, activeTotal: 90524.74, normalExp: 950, shuraExp: 5065.4 },
  { level: 149, expNeeded: 18045458, bountyV10: 138620.625, bountyV14: 147862.065, activeTotal: 92906.97, normalExp: 975, shuraExp: 5198.7 },
  { level: 150, expNeeded: 18545458, bountyV10: 142175, bountyV14: 151653.4, activeTotal: 95289.2, normalExp: 1000, shuraExp: 5332 },
  { level: 151, expNeeded: 19055458, bountyV10: 145729.375, bountyV14: 155444.735, activeTotal: 97671.43, normalExp: 1025, shuraExp: 5465.3 },
  { level: 152, expNeeded: 19565458, bountyV10: 149283.75, bountyV14: 159236.07, activeTotal: 100053.66, normalExp: 1050, shuraExp: 5598.6 },
  { level: 153, expNeeded: 20075458, bountyV10: 152838.125, bountyV14: 163027.405, activeTotal: 102435.89, normalExp: 1075, shuraExp: 5731.9 },
  { level: 154, expNeeded: 20585458, bountyV10: 156392.5, bountyV14: 166818.74, activeTotal: 104818.12, normalExp: 1100, shuraExp: 5865.2 },
  { level: 155, expNeeded: 21095457, bountyV10: 159946.875, bountyV14: 170610.075, activeTotal: 107200.35, normalExp: 1125, shuraExp: 5998.5 },
  { level: 156, expNeeded: 21645458, bountyV10: 167411.0625, bountyV14: 178571.8785, activeTotal: 112203.033, normalExp: 1177.5, shuraExp: 6278.43 },
  { level: 157, expNeeded: 22195458, bountyV10: 167553.2375, bountyV14: 178723.5319, activeTotal: 112298.3222, normalExp: 1178.5, shuraExp: 6283.762 },
  { level: 158, expNeeded: 22745458, bountyV10: 167695.4125, bountyV14: 178875.1853, activeTotal: 112393.6114, normalExp: 1179.5, shuraExp: 6289.094 },
  { level: 159, expNeeded: 23295458, bountyV10: 167837.5875, bountyV14: 179026.8387, activeTotal: 112488.9006, normalExp: 1180.5, shuraExp: 6294.426 },
  { level: 160, expNeeded: 24665458, bountyV10: 167979.7625, bountyV14: 179178.4921, activeTotal: 112584.1898, normalExp: 1181.5, shuraExp: 6299.758 },
  { level: 161, expNeeded: 25485458, bountyV10: 168050.85, bountyV14: 179254.3188, activeTotal: 112631.8344, normalExp: 1182, shuraExp: 6302.424 },
  { level: 162, expNeeded: 26305458, bountyV10: 168121.9375, bountyV14: 179330.1455, activeTotal: 112679.479, normalExp: 1182.5, shuraExp: 6305.09 },
  { level: 163, expNeeded: 27125458, bountyV10: 168193.025, bountyV14: 179405.9722, activeTotal: 112727.1236, normalExp: 1183, shuraExp: 6307.756 },
  { level: 164, expNeeded: 27945458, bountyV10: 168264.1125, bountyV14: 179481.7989, activeTotal: 112774.7682, normalExp: 1183.5, shuraExp: 6310.422 },
  { level: 165, expNeeded: 29135458, bountyV10: 168335.2, bountyV14: 179557.6256, activeTotal: 112822.4128, normalExp: 1184, shuraExp: 6313.088 },
  { level: 166, expNeeded: 30325458, bountyV10: 168406.2875, bountyV14: 179633.4523, activeTotal: 112870.0574, normalExp: 1184.5, shuraExp: 6315.754 },
  { level: 167, expNeeded: 31515458, bountyV10: 168477.375, bountyV14: 179709.279, activeTotal: 112917.702, normalExp: 1185, shuraExp: 6318.42 },
  { level: 168, expNeeded: 32705458, bountyV10: 168548.4625, bountyV14: 179785.1057, activeTotal: 112965.3466, normalExp: 1185.5, shuraExp: 6321.086 },
  { level: 169, expNeeded: 33895458, bountyV10: 168619.55, bountyV14: 179860.9324, activeTotal: 113012.9912, normalExp: 1186, shuraExp: 6323.752 },
  { level: 170, expNeeded: null, bountyV10: 0, bountyV14: 0, activeTotal: 113039, normalExp: 1186, shuraExp: 6326 },
]

const LEVEL_MAP = new Map(UPGRADE_LEVEL_DATA.map((row) => [row.level, row]))
const VALID_STAMINA_BODIES = new Set<number>([0, 3, 6, 9])
const MAX_SIMULATION_DAYS = 20_000
const DAILY_ELITE_STAMINA_LIMIT = 750

export const getUpgradeLevelData = (level: number) => LEVEL_MAP.get(level)

export function localDateInputValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseUpgradeDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('请选择有效的开始计算日期。')
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error('请选择有效的开始计算日期。')
  }
  return date
}

export function formatUpgradeDate(value: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function validateLevels(currentLevel: number, targetLevel: number) {
  if (!LEVEL_MAP.has(currentLevel) || !LEVEL_MAP.has(targetLevel)) {
    throw new Error('等级必须在 140 到 170 之间。')
  }
  if (targetLevel < currentLevel) throw new Error('目标等级不能低于当前等级。')
}

function validateCurrentExperience(currentLevel: number, currentExp: number) {
  const threshold = getUpgradeLevelData(currentLevel)?.expNeeded
  if (!Number.isFinite(currentExp) || currentExp < 0) {
    throw new Error('当前经验必须是非负有限数字。')
  }
  if (threshold === null && currentExp !== 0) throw new Error('满级时当前经验只能为 0。')
  if (threshold !== null && threshold !== undefined && currentExp >= threshold) {
    throw new Error(`当前经验应在 0 到 ${Math.max(0, threshold - 1)} 之间。`)
  }
}

export function totalRemainingExperience(currentLevel: number, currentExp: number, targetLevel: number) {
  validateLevels(currentLevel, targetLevel)
  validateCurrentExperience(currentLevel, currentExp)
  if (targetLevel === currentLevel) return 0

  let total = -currentExp
  for (let level = currentLevel; level < targetLevel; level += 1) {
    const row = getUpgradeLevelData(level)
    if (!row || row.expNeeded === null) throw new Error(`缺少 ${level} 级升级经验。`)
    total += row.expNeeded
  }
  return Math.max(0, total)
}

function validateConfig(config: UpgradeConfig) {
  validateLevels(config.currentLevel, config.targetLevel)
  validateCurrentExperience(config.currentLevel, config.currentExp)
  if (!Number.isInteger(config.vipLevel) || config.vipLevel < 10 || config.vipLevel > 15) {
    throw new Error('V 特权等级必须在 V10 到 V15 之间。')
  }
  if (!VALID_STAMINA_BODIES.has(config.staminaBodies)) {
    throw new Error('每日买体必须选择不买、三体、六体或九体。')
  }
  if (!Number.isFinite(config.otherWeeklyStamina) || config.otherWeeklyStamina < 0) {
    throw new Error('其他每周体力必须是非负有限数字。')
  }
  return parseUpgradeDate(config.startDate)
}

function calculateBountyExperience(row: UpgradeLevelRow, vipLevel: number, superKage: boolean) {
  const vipBounty = vipLevel >= 14 ? row.bountyV14 : row.bountyV10
  const baseBounty = row.bountyV10 / 1.2
  return Math.round(vipBounty + (superKage ? baseBounty * 0.3 : 0))
}

type LegacyUpgradeConfig = Omit<UpgradeConfig, 'staminaBodies' | 'otherWeeklyStamina'> & {
  staminaBodies?: StaminaBodies
  otherWeeklyStamina?: number
}

export function simulateUpgrade(config: LegacyUpgradeConfig, maxDays = MAX_SIMULATION_DAYS): UpgradeResult {
  const normalized: UpgradeConfig = {
    ...config,
    staminaBodies: config.staminaBodies ?? 3,
    otherWeeklyStamina: config.otherWeeklyStamina ?? 0,
  }
  const startDate = validateConfig(normalized)
  const baseStamina =
    BASE_DAILY_STAMINA +
    (normalized.superKage ? 150 : 0) +
    normalized.staminaBodies * 50 +
    normalized.otherWeeklyStamina / 7
  const milestones: UpgradeMilestone[] = []

  for (let level = normalized.currentLevel; level < normalized.targetLevel; level += 1) {
    const row = getUpgradeLevelData(level)
    if (!row || row.expNeeded === null) throw new Error(`缺少 ${level} 级升级经验。`)
    const deducted = level === normalized.currentLevel ? normalized.currentExp : 0
    milestones.push({
      fromLevel: level,
      toLevel: level + 1,
      required: row.expNeeded,
      deducted,
      remaining: row.expNeeded - deducted,
      dateReached: null,
    })
  }

  const totals = { dungeonExp: 0, activeExp: 0, bountyExp: 0, eliteRuns: 0, shuraRuns: 0 }
  const averageDailyStamina = baseStamina
  const preciseDays = milestones.reduce((total, milestone) => {
    const row = getUpgradeLevelData(milestone.fromLevel)
    if (!row) throw new Error(`缺少 ${milestone.fromLevel} 级收益数据。`)
    const eliteStamina = Math.min(averageDailyStamina, DAILY_ELITE_STAMINA_LIMIT)
    const shuraStamina = Math.max(0, averageDailyStamina - DAILY_ELITE_STAMINA_LIMIT)
    const dungeonExp = (eliteStamina / 10) * row.normalExp * 2 + (shuraStamina / 20) * row.shuraExp
    const bountyExp = calculateBountyExperience(row, normalized.vipLevel, normalized.superKage)
    return total + milestone.remaining / (dungeonExp + row.activeTotal + bountyExp)
  }, 0)

  if (normalized.targetLevel === normalized.currentLevel) {
    return {
      days: 0,
      preciseDays: 0,
      completionDate: startDate,
      baseStamina,
      remainingStamina: 0,
      milestones,
      firstDay: null,
      totals,
    }
  }

  let level = normalized.currentLevel
  let experience = normalized.currentExp
  let stamina = 0
  let dayIndex = 0
  let firstDay: UpgradeDaySummary | null = null

  const applyExperience = (amount: number, date: Date) => {
    experience += amount
    while (level < normalized.targetLevel) {
      const row = getUpgradeLevelData(level)
      if (!row || row.expNeeded === null || experience < row.expNeeded) break
      experience -= row.expNeeded
      const milestone = milestones.find((item) => item.fromLevel === level)
      if (milestone) milestone.dateReached = new Date(date)
      level += 1
    }
  }

  while (level < normalized.targetLevel && dayIndex < maxDays) {
    const date = addDays(startDate, dayIndex)
    const addedStamina = baseStamina
    stamina += addedStamina

    let eliteRunsToday = 0
    let shuraRunsToday = 0
    let dungeonExpToday = 0
    let activeExpToday = 0
    let bountyExpToday = 0

    while (level < normalized.targetLevel && eliteRunsToday < DAILY_ELITE_STAMINA_LIMIT / 10 && stamina >= 10) {
      const row = getUpgradeLevelData(level)
      if (!row) throw new Error(`缺少 ${level} 级精英副本经验。`)
      const reward = row.normalExp * 2
      stamina -= 10
      eliteRunsToday += 1
      totals.eliteRuns += 1
      totals.dungeonExp += reward
      dungeonExpToday += reward
      applyExperience(reward, date)
    }

    while (level < normalized.targetLevel && stamina >= 20) {
      const row = getUpgradeLevelData(level)
      if (!row) throw new Error(`缺少 ${level} 级修罗副本经验。`)
      const reward = row.shuraExp
      stamina -= 20
      shuraRunsToday += 1
      totals.shuraRuns += 1
      totals.dungeonExp += reward
      dungeonExpToday += reward
      applyExperience(reward, date)
    }

    if (level < normalized.targetLevel) {
      const row = getUpgradeLevelData(level)
      if (!row) throw new Error(`缺少 ${level} 级活跃经验。`)
      activeExpToday = row.activeTotal
      totals.activeExp += activeExpToday
      applyExperience(activeExpToday, date)
    }

    if (level < normalized.targetLevel) {
      const row = getUpgradeLevelData(level)
      if (!row) throw new Error(`缺少 ${level} 级丰饶经验。`)
      bountyExpToday = calculateBountyExperience(row, normalized.vipLevel, normalized.superKage)
      totals.bountyExp += bountyExpToday
      applyExperience(bountyExpToday, date)
    }

    if (dayIndex === 0) {
      firstDay = {
        date,
        addedStamina,
        eliteRuns: eliteRunsToday,
        shuraRuns: shuraRunsToday,
        dungeonExp: dungeonExpToday,
        activeExp: activeExpToday,
        bountyExp: bountyExpToday,
        remainingStamina: stamina,
      }
    }
    dayIndex += 1
  }

  if (level < normalized.targetLevel) throw new Error('计算天数超过 20,000 天安全上限。')

  return {
    days: dayIndex,
    preciseDays,
    completionDate: addDays(startDate, dayIndex - 1),
    baseStamina,
    remainingStamina: stamina,
    milestones,
    firstDay,
    totals,
  }
}
