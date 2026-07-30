import { describe, expect, it } from 'vitest'
import { COEFFICIENTS } from './engine'
import { FORMULA_TEXT, MODULE_FORMULAS } from './formulas'

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
})
