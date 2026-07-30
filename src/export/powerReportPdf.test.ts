import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { calculateAll } from '../domain/engine'
import { initialState } from '../domain/state'
import { createPowerReportPdf } from './powerReportPdf'

describe('PDF 文本报告导出', () => {
  it('生成可下载的有效 PDF 文件', async () => {
    const state = initialState()
    const font = new Uint8Array(
      await readFile(join(process.cwd(), 'public', 'fonts', 'NotoSansSC-Regular.ttf')),
    )
    const blob = await createPowerReportPdf(state, calculateAll(state), font)
    const bytes = new Uint8Array(await blob.arrayBuffer())

    expect(blob.type).toBe('application/pdf')
    expect(bytes.length).toBeGreaterThan(20_000)
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-')
  }, 30_000)
})
