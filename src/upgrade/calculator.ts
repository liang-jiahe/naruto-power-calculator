export interface UpgradeLevelRow {
  level: number
  expNeeded: number | null
  bounty: number
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
  weeklyPack: boolean
  packOffset: number
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
  { level: 140, expNeeded: 10035498, bounty: 73410, activeTotal: 75074, normalExp: 788, shuraExp: 4200 },
  { level: 141, expNeeded: 11035498, bounty: 95139, activeTotal: 76517, normalExp: 803, shuraExp: 4282 },
  { level: 142, expNeeded: 12035498, bounty: 77533, activeTotal: 77914, normalExp: 818, shuraExp: 4360 },
  { level: 143, expNeeded: 13015782, bounty: 78955, activeTotal: 79342, normalExp: 833, shuraExp: 4440 },
  { level: 144, expNeeded: 15045458, bounty: 80566, activeTotal: 80980, normalExp: 850, shuraExp: 4532 },
  { level: 145, expNeeded: 16045458, bounty: 82936, activeTotal: 83362, normalExp: 875, shuraExp: 4644 },
  { level: 146, expNeeded: 16545458, bounty: 85305, activeTotal: 85724, normalExp: 900, shuraExp: 4798 },
  { level: 147, expNeeded: 17045458, bounty: 87675, activeTotal: 88105, normalExp: 925, shuraExp: 4932 },
  { level: 148, expNeeded: 17545458, bounty: 90045, activeTotal: 90507, normalExp: 950, shuraExp: 5064 },
  { level: 149, expNeeded: 18045458, bounty: 92414, activeTotal: 92889, normalExp: 975, shuraExp: 5198 },
  { level: 150, expNeeded: 18545458, bounty: 94784, activeTotal: 95271, normalExp: 1000, shuraExp: 5332 },
  { level: 151, expNeeded: 19055458, bounty: 97153, activeTotal: 97654, normalExp: 1025, shuraExp: 5464 },
  { level: 152, expNeeded: 19565458, bounty: 99523, activeTotal: 100035, normalExp: 1050, shuraExp: 5598 },
  { level: 153, expNeeded: 20075458, bounty: 101893, activeTotal: 102416, normalExp: 1075, shuraExp: 5730 },
  { level: 154, expNeeded: 20585458, bounty: 104262, activeTotal: 104798, normalExp: 1100, shuraExp: 5864 },
  { level: 155, expNeeded: 21095457, bounty: 106632, activeTotal: 107180, normalExp: 1125, shuraExp: 5998 },
  { level: 156, expNeeded: 21645458, bounty: 111608, activeTotal: 112182, normalExp: 1177, shuraExp: 6278 },
  { level: 157, expNeeded: 22195458, bounty: 111703, activeTotal: 112278, normalExp: 1178, shuraExp: 6282 },
  { level: 158, expNeeded: 22745458, bounty: 111798, activeTotal: 112372, normalExp: 1179, shuraExp: 6288 },
  { level: 159, expNeeded: 23295458, bounty: 111892, activeTotal: 112468, normalExp: 1180, shuraExp: 6294 },
  { level: 160, expNeeded: 24665458, bounty: 111987, activeTotal: 112564, normalExp: 1181, shuraExp: 6298 },
  { level: 161, expNeeded: 25485458, bounty: 112034, activeTotal: 112611, normalExp: 1182, shuraExp: 6302 },
  { level: 162, expNeeded: 26305458, bounty: 112082, activeTotal: 112658, normalExp: 1182, shuraExp: 6304 },
  { level: 163, expNeeded: 27125458, bounty: 112129, activeTotal: 112706, normalExp: 1183, shuraExp: 6308 },
  { level: 164, expNeeded: 27945458, bounty: 112177, activeTotal: 112753, normalExp: 1183, shuraExp: 6310 },
  { level: 165, expNeeded: 29135458, bounty: 112224, activeTotal: 112801, normalExp: 1184, shuraExp: 6312 },
  { level: 166, expNeeded: 30325458, bounty: 112271, activeTotal: 112848, normalExp: 1184, shuraExp: 6314 },
  { level: 167, expNeeded: 31515458, bounty: 112319, activeTotal: 112897, normalExp: 1185, shuraExp: 6318 },
  { level: 168, expNeeded: 32705458, bounty: 112366, activeTotal: 112944, normalExp: 1185, shuraExp: 6320 },
  { level: 169, expNeeded: 33895458, bounty: 112414, activeTotal: 112991, normalExp: 1186, shuraExp: 6322 },
  { level: 170, expNeeded: null, bounty: 112461, activeTotal: 113039, normalExp: 1186, shuraExp: 6326 },
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
  if (!Number.isInteger(config.packOffset) || config.packOffset < 0 || config.packOffset > 6) {
    throw new Error('距离下次礼包必须在 0 到 6 天之间。')
  }
  return parseUpgradeDate(config.startDate)
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
  const averageDailyStamina = baseStamina + (normalized.weeklyPack ? 150 / 7 : 0)
  const preciseDays = milestones.reduce((total, milestone) => {
    const row = getUpgradeLevelData(milestone.fromLevel)
    if (!row) throw new Error(`缺少 ${milestone.fromLevel} 级收益数据。`)
    const eliteStamina = Math.min(averageDailyStamina, DAILY_ELITE_STAMINA_LIMIT)
    const shuraStamina = Math.max(0, averageDailyStamina - DAILY_ELITE_STAMINA_LIMIT)
    const dungeonExp = (eliteStamina / 10) * row.normalExp * 2 + (shuraStamina / 20) * row.shuraExp
    const vipBonus = normalized.vipLevel >= 14 ? 0.3 : 0.2
    const superBonus = normalized.superKage ? 0.3 : 0
    const bountyExp = Math.round(row.bounty * (1 + vipBonus + superBonus))
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
    const packDue =
      normalized.weeklyPack &&
      dayIndex >= normalized.packOffset &&
      (dayIndex - normalized.packOffset) % 7 === 0
    const addedStamina = baseStamina + (packDue ? 150 : 0)
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
      const vipBonus = normalized.vipLevel >= 14 ? 0.3 : 0.2
      const superBonus = normalized.superKage ? 0.3 : 0
      bountyExpToday = Math.round(row.bounty * (1 + vipBonus + superBonus))
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
