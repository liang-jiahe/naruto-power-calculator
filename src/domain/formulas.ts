import { COEFFICIENTS, collectionMultiplier } from './engine'
import type { BonusConfig } from './types'

export type FormulaSpec = {
  title: string
  lines: string[]
  note?: string
}

const coreWithCollection = [
  `P三维 = 生命 × M生命 + 攻击 × ${COEFFICIENTS.atk} × M攻击 + 防御 × ${COEFFICIENTS.def} × M防御`,
]

const coreWithoutCollection = [
  `P三维 = 生命 + 攻击 × ${COEFFICIENTS.atk} + 防御 × ${COEFFICIENTS.def}`,
]

export const MODULE_FORMULAS = {
  overview: {
    title: '综合战力',
    lines: [
      '总战力 = 等级 + 装备 + 勾玉 + 神器 + 秘卷 + 装扮 + 称号 + 头像框 + 天赋 + 忍魂 + 通灵 + 饰品符文 + 忍具穿戴 + 重铸 + 藏馆 + 珍品阁',
      '等效面板 = 各可归属属性战力 ÷ 对应基础系数',
    ],
    note: '所有分项先用未格式化精确值相加，最终显示时才保留两位小数；直接战力不反推面板属性。',
  },
  collection: {
    title: '收集倍率',
    lines: [
      'M生命 = 1 + 收集率 ÷ 100 × (1 + 生命百分比 ÷ 100)',
      'M攻击 = 1 + 收集率 ÷ 100 × (1 + 攻击百分比 ÷ 100)',
      'M防御 = 1 + 收集率 ÷ 100 × (1 + 防御百分比 ÷ 100)',
    ],
    note: '收集倍率只乘生命、攻击、防御；暴击、抗暴、元素属性和直接战力不乘收集倍率。',
  },
  level: {
    title: '等级查表战力',
    lines: [
      `P等级 = 表生命 × M生命 + 表攻击 × ${COEFFICIENTS.atk} × M攻击 + 表防御 × ${COEFFICIENTS.def} × M防御`,
      `　　　 + 表暴击 × ${COEFFICIENTS.crit} + 表抗暴 × ${COEFFICIENTS.antiCrit}`,
    ],
    note: '20–170 级按内置等级数据表精确取值。',
  },
  soul: {
    title: '忍魂战力',
    lines: [
      `P感悟 = 感悟生命 × M生命 + 感悟攻击 × ${COEFFICIENTS.atk} × M攻击 + 感悟防御 × ${COEFFICIENTS.def} × M防御`,
      `P羁绊 = 羁绊生命 + 羁绊攻击 × ${COEFFICIENTS.atk} + 羁绊防御 × ${COEFFICIENTS.def}`,
      'P忍魂 = P感悟 + P羁绊',
    ],
    note: '忍传感悟吃收集加成，羁绊升级不吃。',
  },
  talent: {
    title: '天赋战力',
    lines: [
      ...coreWithCollection,
      'P普通 = P三维（普通天赋，吃收集）',
      'P修罗 = P三维（修罗天赋，吃收集）',
      'P天赋 = P普通 + P修罗',
    ],
    note: '普通天赋与修罗天赋分别计算后相加，两部分均吃收集加成。',
  },
  equipment: {
    title: '装备战力',
    lines: coreWithCollection,
    note: '装备生命、攻击、防御均吃收集加成。',
  },
  magatama: {
    title: '勾玉战力',
    lines: coreWithCollection,
    note: '勾玉生命、攻击、防御均吃收集加成。',
  },
  accessories: {
    title: '饰品与符文战力',
    lines: [
      `P饰品 = 生命 × M生命 + 攻击 × ${COEFFICIENTS.atk} × M攻击 + 防御 × ${COEFFICIENTS.def} × M防御 + 暴击 × ${COEFFICIENTS.crit} + 抗暴 × ${COEFFICIENTS.antiCrit}`,
      'P符文 = Σ六件符文直接战力 + P三维（Σ六件共鸣属性，吃收集）',
      'P饰品符文 = P饰品 + P符文',
    ],
    note: '每件符文取不超过当前符文战力的最高共鸣阈值；饰品不计算元素攻防。',
  },
  artifact: {
    title: '神器战力',
    lines: coreWithCollection,
    note: '神器生命、攻击、防御均吃收集加成。',
  },
  summoning: {
    title: '通灵战力',
    lines: [
      '修炼属性 = 通灵兽数据表（当前等级，当前强化次数）',
      '进阶属性 = max(0，输入通灵总属性 − 查表修炼属性)',
      'P通灵 = P三维（修炼属性，吃收集）+ P三维（进阶属性，不吃收集）',
    ],
    note: '第 0 次强化按上一级第 4 次处理；1 级第 0 次为 0。',
  },
  toolPanel: {
    title: '忍具穿戴战力',
    lines: [
      `P穿戴 = 生命 × M生命 + 攻击 × ${COEFFICIENTS.atk} × M攻击 + 防御 × ${COEFFICIENTS.def} × M防御`,
      `　　　 + 暴击 × ${COEFFICIENTS.crit} + 抗暴 × ${COEFFICIENTS.antiCrit} + Σ元素攻击 × ${COEFFICIENTS.elementAtk} + Σ元素防御 × ${COEFFICIENTS.elementDef}`,
    ],
    note: '只有生命、攻击、防御吃收集加成。',
  },
  toolReforge: {
    title: '挂件坠饰重铸战力',
    lines: [
      `P重铸 = 生命 + 攻击 × ${COEFFICIENTS.atk} + 防御 × ${COEFFICIENTS.def} + 暴击 × ${COEFFICIENTS.crit} + 抗暴 × ${COEFFICIENTS.antiCrit}`,
    ],
    note: '重铸不吃收集加成，也不计算元素攻防。',
  },
  toolMuseum: {
    title: '藏馆战力',
    lines: [
      '直接战力模式：P藏馆 = 输入战力',
      `属性计算模式：P藏馆 = 生命 + 攻击 × ${COEFFICIENTS.atk} + 防御 × ${COEFFICIENTS.def} + 暴击 × ${COEFFICIENTS.crit} + 抗暴 × ${COEFFICIENTS.antiCrit} + Σ元素攻击 × ${COEFFICIENTS.elementAtk} + Σ元素防御 × ${COEFFICIENTS.elementDef}`,
    ],
    note: '藏馆属性计算不吃收集加成；直接战力不反推面板属性。',
  },
  toolTreasure: {
    title: '珍品阁战力',
    lines: [
      '直接战力模式：P珍品阁 = 输入战力',
      `属性计算模式：P珍品阁 = (火防 + 水防 + 风防 + 雷防 + 土防) × ${COEFFICIENTS.elementDef}`,
    ],
    note: '珍品阁属性模式只计算五种元素防御。',
  },
  scroll: {
    title: '秘卷战力',
    lines: coreWithCollection,
    note: '秘卷生命、攻击、防御均吃收集加成。',
  },
  outfit: {
    title: '装扮战力',
    lines: coreWithoutCollection,
    note: '装扮生命、攻击、防御不吃收集加成。',
  },
  title: {
    title: '称号战力',
    lines: coreWithCollection,
    note: '称号生命、攻击、防御均吃收集加成。',
  },
  avatar: {
    title: '头像框战力',
    lines: coreWithCollection,
    note: '头像框生命、攻击、防御均吃收集加成。',
  },
} satisfies Record<string, FormulaSpec>

const formulaLabels: Record<keyof typeof MODULE_FORMULAS, string> = {
  overview: '总览',
  collection: '忍者收集',
  level: '等级',
  soul: '忍魂',
  talent: '天赋',
  equipment: '装备',
  magatama: '勾玉',
  accessories: '饰品与符文',
  artifact: '神器',
  summoning: '通灵',
  toolPanel: '忍具穿戴',
  toolReforge: '挂件坠饰重铸',
  toolMuseum: '藏馆',
  toolTreasure: '珍品阁',
  scroll: '秘卷',
  outfit: '装扮',
  title: '称号',
  avatar: '头像框',
}

const formatMultiplier = (value: number) => Number(value.toFixed(6)).toString()

export function resolveModuleFormulas(
  bonuses: BonusConfig,
): Record<keyof typeof MODULE_FORMULAS, FormulaSpec> {
  const hpMultiplier = formatMultiplier(collectionMultiplier(bonuses.collectionPct, bonuses.hpPct))
  const atkMultiplier = formatMultiplier(collectionMultiplier(bonuses.collectionPct, bonuses.atkPct))
  const defMultiplier = formatMultiplier(collectionMultiplier(bonuses.collectionPct, bonuses.defPct))
  const replacements = [
    ['M生命', hpMultiplier],
    ['M攻击', atkMultiplier],
    ['M防御', defMultiplier],
  ] as const

  return Object.fromEntries(
    (Object.keys(MODULE_FORMULAS) as Array<keyof typeof MODULE_FORMULAS>).map((key) => {
      const formula = MODULE_FORMULAS[key]
      if (key === 'collection') {
        return [
          key,
          {
            ...formula,
            lines: [
              `生命倍率 = 1 + ${bonuses.collectionPct} ÷ 100 × (1 + ${bonuses.hpPct} ÷ 100) = ${hpMultiplier}`,
              `攻击倍率 = 1 + ${bonuses.collectionPct} ÷ 100 × (1 + ${bonuses.atkPct} ÷ 100) = ${atkMultiplier}`,
              `防御倍率 = 1 + ${bonuses.collectionPct} ÷ 100 × (1 + ${bonuses.defPct} ÷ 100) = ${defMultiplier}`,
            ],
          },
        ]
      }

      return [
        key,
        {
          ...formula,
          lines: formula.lines.map((line) =>
            replacements.reduce((resolved, [token, value]) => resolved.replaceAll(token, value), line),
          ),
        },
      ]
    }),
  ) as Record<keyof typeof MODULE_FORMULAS, FormulaSpec>
}

export function buildFormulaText(
  formulas: Record<keyof typeof MODULE_FORMULAS, FormulaSpec> = MODULE_FORMULAS,
) {
  return `忍界战力计算器 · V1 公式说明

基础系数
生命（原值计入）
攻击 × ${COEFFICIENTS.atk}
防御 × ${COEFFICIENTS.def}
暴击 / 元素攻击 × ${COEFFICIENTS.crit}
抗暴 / 元素防御 × ${COEFFICIENTS.antiCrit}

${(Object.keys(formulas) as Array<keyof typeof MODULE_FORMULAS>)
  .map((key) => {
    const formula = formulas[key]
    return `${formulaLabels[key]} · ${formula.title}
${formula.lines.join('\n')}
${formula.note ?? ''}`
  })
  .join('\n\n')}
`
}

export const FORMULA_TEXT = buildFormulaText()
