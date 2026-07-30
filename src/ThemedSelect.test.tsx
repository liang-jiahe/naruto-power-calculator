import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ThemedSelect } from './ThemedSelect'

const options = [
  { value: 20.3, label: '20.3% · 五星 S' },
  { value: 16.2, label: '16.2% · 四星 S / 五星 A' },
  { value: 13, label: '13% · 四星 A' },
]

describe('猫咪主题选择器', () => {
  it('支持点击选择并关闭菜单', () => {
    const onChange = vi.fn()
    render(<ThemedSelect label="全收集档位" value={20.3} options={options} onChange={onChange} />)

    const trigger = screen.getByRole('combobox', { name: '全收集档位' })
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getByRole('option', { name: '16.2% · 四星 S / 五星 A' }))
    expect(onChange).toHaveBeenCalledWith(16.2)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('支持方向键、回车和 Escape', () => {
    function Harness() {
      const [value, setValue] = useState(20.3)
      return <ThemedSelect label="全收集档位" value={value} options={options} onChange={setValue} />
    }

    render(<Harness />)
    const trigger = screen.getByRole('combobox', { name: '全收集档位' })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(trigger).toHaveTextContent('16.2% · 四星 S / 五星 A')

    fireEvent.click(trigger)
    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
