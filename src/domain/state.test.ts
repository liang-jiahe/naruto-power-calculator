import { describe, expect, it } from 'vitest'
import { exportPayload, initialState, parsePayload, sanitizeState } from './state'

describe('状态导入导出', () => {
  it('JSON往返保留藏馆与珍品阁模式', () => {
    const state = initialState()
    state.tools.museumMode = 'calculated'
    state.tools.treasureMode = 'calculated'
    state.accessories.runes.belt.power = 89_000
    const restored = parsePayload(JSON.parse(JSON.stringify(exportPayload(state))))
    expect(restored.tools.museumMode).toBe('calculated')
    expect(restored.tools.treasureMode).toBe('calculated')
    expect(restored.accessories.runes.belt.power).toBe(89_000)
  })

  it('拒绝不支持的文件版本', () => {
    expect(() => parsePayload({ version: 999, state: {} })).toThrow('文件版本或结构不受支持')
  })

  it('清洗负数、无穷值和越界等级', () => {
    const state = sanitizeState({
      level: 999,
      bonuses: { collectionPct: -1, hpPct: Number.POSITIVE_INFINITY },
      summon: { beast: '不存在', level: -4 },
    })
    expect(state.level).toBe(170)
    expect(state.bonuses.collectionPct).toBe(20.3)
    expect(state.bonuses.hpPct).toBe(0)
    expect(state.summon.level).toBe(1)
  })
})
