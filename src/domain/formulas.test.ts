import { describe, expect, it } from 'vitest'
import { COEFFICIENTS } from './engine'
import { buildFormulaText, FORMULA_TEXT, MODULE_FORMULAS, resolveModuleFormulas } from './formulas'

describe('页面公式说明', () => {
  it('覆盖总览、收集倍率、全部模块和忍具子模块', () => {
    expect(Object.keys(MODULE_FORMULAS)).toEqual([
      'overview',
      'collection',
      'level',
      'soul',
      'talent',
      'equipment',
      'magatama',
      'accessories',
      'artifact',
      'summoning',
      'toolPanel',
      'toolReforge',
      'toolMuseum',
      'toolTreasure',
      'scroll',
      'outfit',
      'title',
      'avatar',
    ])
  })

  it('公式文案直接使用计算引擎系数', () => {
    const allFormulaLines = Object.values(MODULE_FORMULAS)
      .flatMap((formula) => [...formula.lines, formula.note ?? ''])
      .join('\n')

    expect(allFormulaLines).toContain(`攻击 × ${COEFFICIENTS.atk}`)
    expect(allFormulaLines).toContain(`防御 × ${COEFFICIENTS.def}`)
    expect(allFormulaLines).toContain(`暴击 × ${COEFFICIENTS.crit}`)
    expect(allFormulaLines).toContain(`抗暴 × ${COEFFICIENTS.antiCrit}`)
    expect(allFormulaLines).toContain(`Σ元素攻击 × ${COEFFICIENTS.elementAtk}`)
    expect(allFormulaLines).toContain(`Σ元素防御 × ${COEFFICIENTS.elementDef}`)
  })

  it('文本导出与页面公式来自同一份定义', () => {
    for (const formula of Object.values(MODULE_FORMULAS)) {
      expect(FORMULA_TEXT).toContain(formula.title)
      for (const line of formula.lines) expect(FORMULA_TEXT).toContain(line)
    }
  })

  it('把收集倍率符号解析为当前实际数字', () => {
    const formulas = resolveModuleFormulas({
      collectionPct: 20.3,
      hpPct: 0,
      atkPct: 10,
      defPct: 0,
    })

    expect(formulas.collection.lines[0]).toContain('= 1.203')
    expect(formulas.collection.lines[1]).toContain('= 1.2233')
    expect(formulas.level.lines.join('\n')).toContain('× 1.203')
    expect(formulas.level.lines.join('\n')).toContain('× 1.2233')
    expect(formulas.level.lines.join('\n')).toContain('表生命 × 1.203')
    expect(formulas.level.lines.join('\n')).not.toContain('表生命 × 1 ×')
    expect(formulas.level.lines.join('\n')).not.toContain('M生命')
    expect(formulas.level.lines.join('\n')).not.toContain('M攻击')
    expect(formulas.level.lines.join('\n')).not.toContain('M防御')
  })

  it('导出的公式文本使用当前倍率数字', () => {
    const formulas = resolveModuleFormulas({
      collectionPct: 16.2,
      hpPct: 5,
      atkPct: 0,
      defPct: 2,
    })
    const text = buildFormulaText(formulas)

    expect(text).toContain('生命倍率 = 1 + 16.2 ÷ 100 × (1 + 5 ÷ 100) = 1.1701')
    expect(text).not.toContain('生命 × 1 ×')
    expect(text).not.toContain('生命 × 1 +')
    expect(text).not.toContain('M生命')
    expect(text).not.toContain('M攻击')
    expect(text).not.toContain('M防御')
  })
})
