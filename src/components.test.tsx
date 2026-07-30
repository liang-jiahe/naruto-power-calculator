import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { NumberField } from './components'

describe('数字输入框', () => {
  it('允许清空，并将空值按 0 参与计算', () => {
    function Harness() {
      const [value, setValue] = useState(7)
      return (
        <>
          <NumberField label="生命" value={value} onChange={setValue} />
          <output>{value}</output>
        </>
      )
    }

    render(<Harness />)
    const input = screen.getByRole('spinbutton', { name: '生命' })
    fireEvent.change(input, { target: { value: '' } })

    expect(input).toHaveValue(null)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('清空带最小值的等级字段时保持空白，并使用合法下限计算', () => {
    const onChange = vi.fn()
    render(<NumberField label="修炼等级" value={1} min={1} max={600} onChange={onChange} />)
    const input = screen.getByRole('spinbutton', { name: '修炼等级' })

    fireEvent.change(input, { target: { value: '' } })

    expect(input).toHaveValue(null)
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('输入有效数字后继续实时更新', () => {
    const onChange = vi.fn()
    render(<NumberField label="攻击" value={0} step={0.1} onChange={onChange} />)

    fireEvent.change(screen.getByRole('spinbutton', { name: '攻击' }), { target: { value: '12.5' } })

    expect(onChange).toHaveBeenLastCalledWith(12.5)
  })
})
