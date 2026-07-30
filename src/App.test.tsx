import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('双板块导航与状态', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('战力计算器导航默认展开并可折叠', () => {
    render(<App />)
    const trigger = screen.getByRole('button', { name: '战力计算器' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: '战力总览' })).toBeVisible()

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: '战力总览' })).not.toBeInTheDocument()
  })

  it('切换板块时保留升级输入，重新挂载后恢复默认', () => {
    const view = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '升级时间计算' }))
    const currentExp = screen.getByRole('spinbutton', { name: /本级已有经验/ })
    fireEvent.change(currentExp, { target: { value: '123' } })

    fireEvent.click(screen.getByRole('link', { name: '战力总览' }))
    fireEvent.click(screen.getByRole('button', { name: '升级时间计算' }))
    expect(screen.getByRole('spinbutton', { name: /本级已有经验/ })).toHaveValue(123)

    view.unmount()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '升级时间计算' }))
    expect(screen.getByRole('spinbutton', { name: /本级已有经验/ })).toHaveValue(0)
  })

  it('清空按钮只重置当前升级板块', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '升级时间计算' }))
    fireEvent.change(screen.getByRole('spinbutton', { name: /本级已有经验/ }), { target: { value: '456' } })
    fireEvent.click(screen.getByRole('button', { name: '清空' }))

    await waitFor(() => expect(screen.getByRole('spinbutton', { name: /本级已有经验/ })).toHaveValue(0))
    expect(window.confirm).toHaveBeenCalledWith('确定清空升级时间计算的全部输入并恢复默认值吗？')
  })

  it('完整展示升级结果和经验表入口', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '升级时间计算' }))

    expect(screen.getByRole('heading', { name: '升级时间计算' })).toBeVisible()
    expect(screen.getByText('冲级路线')).toBeVisible()
    expect(screen.getByText('升级进度表')).toBeVisible()
    expect(screen.getByText('查看 140—170 级原始经验表')).toBeVisible()
  })
})
