import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const openPowerOverview = () => {
  const trigger = screen.getByRole('button', { name: '战力计算器' })
  if (trigger.getAttribute('aria-expanded') === 'false') fireEvent.click(trigger)
  fireEvent.click(screen.getByRole('link', { name: '战力总览' }))
}

describe('多板块导航与状态', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('战力计算器导航默认折叠并可展开，再次点击收起', () => {
    render(<App />)
    const trigger = screen.getByRole('button', { name: '战力计算器' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: '战力总览' })).not.toBeInTheDocument()

    fireEvent.click(trigger)
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

    openPowerOverview()
    fireEvent.click(screen.getByRole('button', { name: '升级时间计算' }))
    expect(screen.getByRole('spinbutton', { name: /本级已有经验/ })).toHaveValue(123)

    view.unmount()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '升级时间计算' }))
    expect(screen.getByRole('spinbutton', { name: /本级已有经验/ })).toHaveValue(0)
  })

  it.each(['升级时间计算', '抗魔计算器', '消耗材料查询'])('%s 不显示顶部导出、导入、公式与清空按钮', (workspace) => {
    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: workspace }))
    for (const name of ['下载 PDF', '导入', '公式', 'PDF', '清空']) {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument()
    }
    expect(container.querySelector('input[type="file"]')).not.toBeInTheDocument()
    openPowerOverview()
    expect(screen.getByRole('button', { name: '下载 PDF' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '清空' })).toBeVisible()
  })

  it('完整展示升级结果和经验表入口', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '升级时间计算' }))

    expect(screen.getByRole('heading', { name: '升级时间计算' })).toBeVisible()
    expect(screen.getByText('冲级路线')).toBeVisible()
    expect(screen.getByText('升级进度表')).toBeVisible()
    expect(screen.getByText('查看 140—170 级原始经验表')).toBeVisible()
  })

  it('仅启用 PDF 文本导出，其他工具按钮保持禁用', () => {
    render(<App />)

    const exportButton = screen.getByRole('button', { name: '下载 PDF' })
    expect(exportButton).toBeEnabled()
    expect(screen.getByRole('button', { name: '导入' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '公式' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'PDF' })).toBeDisabled()
  })

  it('侧边栏可进入抗魔与材料板块，切换后保留输入和更换标记', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '抗魔计算器' }))
    expect(screen.getByRole('heading', { name: '抗魔计算器' })).toBeVisible()
    expect(screen.getByRole('button', { name: '抗魔计算器' })).toHaveAttribute('aria-current', 'page')
    fireEvent.change(screen.getByRole('spinbutton', { name: '耳环基础抗魔' }), { target: { value: '4111' } })
    fireEvent.click(screen.getByRole('button', { name: '切换耳环是否更换' }))
    expect(screen.queryByRole('button', { name: '下载 PDF' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '消耗材料查询' }))
    expect(screen.getByRole('heading', { name: '强化材料查询' })).toBeVisible()
    fireEvent.click(screen.getByRole('combobox', { name: '目标强化等级' }))
    fireEvent.click(screen.getByRole('option', { name: '+3' }))
    fireEvent.click(screen.getByRole('button', { name: '抗魔计算器' }))
    expect(screen.getByRole('spinbutton', { name: '耳环基础抗魔' })).toHaveValue(4111)
    expect(screen.getByRole('button', { name: '切换耳环是否更换' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: '消耗材料查询' }))
    expect(screen.getByRole('combobox', { name: '目标强化等级' })).toHaveTextContent('+3')
  }, 15000)

  it('抗魔内置重置与战力清空相互独立，不影响升级和材料配置', () => {
    render(<App />)
    fireEvent.change(screen.getByRole('spinbutton', { name: '当前等级' }), { target: { value: '60' } })
    fireEvent.click(screen.getByRole('button', { name: '升级时间计算' }))
    fireEvent.change(screen.getByRole('spinbutton', { name: /本级已有经验/ }), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: '消耗材料查询' }))
    fireEvent.click(screen.getByRole('combobox', { name: '目标强化等级' }))
    fireEvent.click(screen.getByRole('option', { name: '+3' }))
    fireEvent.click(screen.getByRole('button', { name: '抗魔计算器' }))
    fireEvent.change(screen.getByRole('spinbutton', { name: '耳环基础抗魔' }), { target: { value: '999' } })
    fireEvent.click(screen.getByRole('button', { name: '重置默认值' }))
    expect(screen.getByRole('spinbutton', { name: '耳环基础抗魔' })).toHaveValue(0)
    fireEvent.change(screen.getByRole('spinbutton', { name: '耳环基础抗魔' }), { target: { value: '222' } })
    fireEvent.click(screen.getByRole('button', { name: '消耗材料查询' }))
    expect(screen.getByRole('combobox', { name: '目标强化等级' })).toHaveTextContent('+3')
    openPowerOverview()
    expect(screen.getByRole('spinbutton', { name: '当前等级' })).toHaveValue(60)
    vi.mocked(window.confirm).mockReturnValueOnce(false)
    fireEvent.click(screen.getByRole('button', { name: '清空' }))
    expect(screen.getByRole('spinbutton', { name: '当前等级' })).toHaveValue(60)
    fireEvent.click(screen.getByRole('button', { name: '清空' }))
    expect(window.confirm).toHaveBeenLastCalledWith('确定清空战力计算器的全部输入并恢复默认值吗？')
    fireEvent.click(screen.getByRole('button', { name: '抗魔计算器' }))
    expect(screen.getByRole('spinbutton', { name: '耳环基础抗魔' })).toHaveValue(222)
    fireEvent.click(screen.getByRole('button', { name: '升级时间计算' }))
    expect(screen.getByRole('spinbutton', { name: /本级已有经验/ })).toHaveValue(123)
    fireEvent.click(screen.getByRole('button', { name: '消耗材料查询' }))
    expect(screen.getByRole('combobox', { name: '目标强化等级' })).toHaveTextContent('+3')
  }, 15000)

  it('移动导航打开新板块后关闭侧栏，底部导航可在抗魔和材料间切换', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '打开导航' }))
    expect(document.querySelector('.sidebar')).toHaveClass('open')
    fireEvent.click(screen.getByRole('button', { name: '抗魔计算器' }))
    expect(document.querySelector('.sidebar')).not.toHaveClass('open')
    fireEvent.change(screen.getByRole('spinbutton', { name: '耳环基础抗魔' }), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: '材料' }))
    expect(screen.getByRole('heading', { name: '强化材料查询' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '抗魔' }))
    expect(screen.getByRole('spinbutton', { name: '耳环基础抗魔' })).toHaveValue(123)
  }, 15000)
})
