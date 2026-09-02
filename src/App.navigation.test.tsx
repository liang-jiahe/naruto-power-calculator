import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { POWER_NAV_ITEMS, WORKSPACE_LABELS, WORKSPACE_TARGETS, routeHref, type Workspace } from './navigation'

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, '', import.meta.env.BASE_URL)
})

afterEach(() => vi.restoreAllMocks())

describe('首页快捷导航', () => {
  it('根地址仅展示独立工具目录，不显示工具页导航、旧文案或分项入口', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '工具箱（4 个工具）', level: 1 })).toBeVisible()
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getByRole('main')).toHaveClass('home-workspace')
    expect(screen.getByRole('main').closest('.app-shell')).toBeNull()
    expect(document.querySelector('.app-shell')).not.toBeVisible()
    for (const selector of ['.sidebar', '.topbar', '.mobile-menu', '.mobile-bottom-nav']) {
      expect(document.querySelector(selector)).not.toBeVisible()
    }
    expect(screen.queryAllByRole('navigation')).toHaveLength(0)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    for (const text of ['火影工具首页', '今天，想算点什么？选一个工具，马上开始。', 'NEKO POWER LAB', '战力分项直达', '与侧边栏同步']) {
      expect(screen.queryByText(text)).not.toBeInTheDocument()
    }
    expect(document.querySelector('.home-local-note')).not.toBeInTheDocument()
    expect(document.querySelector('.home-tool-tags')).not.toBeInTheDocument()
    expect(document.querySelector('.home-tool-action')).not.toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: '工具快捷入口' })).getAllByRole('link')).toHaveLength(4)
    expect(screen.getAllByRole('link')).toHaveLength(4)
    for (const name of ['下载 PDF', '导入', '公式', 'PDF', '清空']) {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument()
    }
    expect(window.location.hash).toBe('')
  })

  it.each(['power', 'upgrade', 'magic', 'materials'] as const)('首页卡片可以进入 %s，回首页后恢复根地址', (workspace) => {
    render(<App />)
    const link = screen.getByRole('link', { name: `进入${WORKSPACE_LABELS[workspace]}` })
    expect(link).toHaveAttribute('href', routeHref(workspace))
    fireEvent.click(link)
    expect(window.location.hash).toBe(`#/${workspace}`)
    expect(document.getElementById(WORKSPACE_TARGETS[workspace])).toBeVisible()
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getByRole('main')).toHaveClass('calculator-main')
    expect(screen.getByRole('navigation', { name: '页面导航' })).toBeVisible()
    expect(document.querySelector('.topbar')).toBeVisible()
    expect(screen.queryByRole('heading', { name: '工具箱（4 个工具）', level: 1 })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '首页' }))
    expect(window.location.hash).toBe('')
    expect(window.location.pathname).toBe(import.meta.env.BASE_URL)
    expect(screen.getByRole('heading', { name: '工具箱（4 个工具）', level: 1 })).toBeVisible()
    expect(document.querySelector('.app-shell')).not.toBeVisible()
    expect(screen.queryByRole('navigation', { name: '页面导航' })).not.toBeInTheDocument()
  })

  it('工具页侧边栏仍可进入全部战力分项，定位后滚动并聚焦目标区', async () => {
    const scroll = vi.spyOn(Element.prototype, 'scrollIntoView')
    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: '进入战力计算器' }))
    for (const [id, label] of POWER_NAV_ITEMS) {
      fireEvent.click(screen.getByRole('link', { name: label }))
      expect(document.getElementById(id)).toBeVisible()
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'location')
      expect(screen.getByRole('button', { name: '战力计算器' })).toHaveAttribute('aria-expanded', 'true')
      expect(window.location.href).toContain(routeHref('power', id))
    }
    await waitFor(() => expect(document.getElementById('avatar')).toHaveFocus())
    expect(scroll.mock.contexts).toContain(document.getElementById('avatar'))
  }, 20000)

  it('经首页往返不会清空工具输入，手机底部也能回首页', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: '进入抗魔计算器' }))
    const magicInput = screen.getByRole('spinbutton', { name: '耳环基础抗魔' })
    fireEvent.change(magicInput, { target: { value: '3776' } })
    fireEvent.click(screen.getByRole('button', { name: '返回首页' }))
    expect(window.location.hash).toBe('')
    expect(magicInput).toBeInTheDocument()
    expect(magicInput).not.toBeVisible()
    expect(screen.queryByRole('navigation', { name: '手机端主导航' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: '进入消耗材料查询' }))
    fireEvent.click(screen.getByRole('combobox', { name: '目标强化等级' }))
    fireEvent.click(screen.getByRole('option', { name: '+3' }))
    fireEvent.click(screen.getByRole('button', { name: '首页' }))
    fireEvent.click(screen.getByRole('link', { name: '进入抗魔计算器' }))
    expect(screen.getByRole('spinbutton', { name: '耳环基础抗魔' })).toBe(magicInput)
    expect(screen.getByRole('spinbutton', { name: '耳环基础抗魔' })).toHaveValue(3776)
    fireEvent.click(screen.getByRole('button', { name: '首页' }))
    fireEvent.click(screen.getByRole('link', { name: '进入消耗材料查询' }))
    expect(screen.getByRole('combobox', { name: '目标强化等级' })).toHaveTextContent('+3')
  }, 15000)

  it('战力和升级输入经独立首页往返后保留，工具实例不重新挂载', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: '进入战力计算器' }))
    const level = screen.getByRole('spinbutton', { name: '当前等级' })
    fireEvent.change(level, { target: { value: '60' } })
    fireEvent.click(screen.getByRole('button', { name: '首页' }))
    fireEvent.click(screen.getByRole('link', { name: '进入升级时间计算' }))
    const experience = screen.getByRole('spinbutton', { name: /本级已有经验/ })
    fireEvent.change(experience, { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: '返回首页' }))
    expect(experience).toBeInTheDocument()
    expect(experience).not.toBeVisible()
    fireEvent.click(screen.getByRole('link', { name: '进入战力计算器' }))
    expect(screen.getByRole('spinbutton', { name: '当前等级' })).toBe(level)
    expect(level).toHaveValue(60)
    fireEvent.click(screen.getByRole('button', { name: '首页' }))
    fireEvent.click(screen.getByRole('link', { name: '进入升级时间计算' }))
    expect(screen.getByRole('spinbutton', { name: /本级已有经验/ })).toBe(experience)
    expect(experience).toHaveValue(123)
  }, 15000)

  it('无鼠标激活卡片后聚焦工具，关闭侧栏返回首页时聚焦独立主内容', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByRole('main')).toHaveFocus())
    const link = screen.getByRole('link', { name: '进入升级时间计算' })
    link.focus()
    expect(link).toHaveFocus()
    fireEvent.click(link, { detail: 0 })
    await waitFor(() => expect(document.getElementById('upgrade-top')).toHaveFocus())
    fireEvent.click(screen.getByRole('button', { name: '打开导航' }))
    expect(document.querySelector('.sidebar')).toHaveClass('open')
    fireEvent.click(screen.getByRole('button', { name: '首页' }))
    await waitFor(() => expect(screen.getByRole('main')).toHaveFocus())
    expect(document.querySelector('.sidebar-overlay')).not.toBeInTheDocument()
    expect(document.querySelector('.sidebar')).not.toHaveClass('open')
    expect(document.querySelector('.app-shell')).not.toBeVisible()
  })
})

describe('地址恢复与历史导航', () => {
  it.each([
    ['#/power/accessories', 'power', 'accessories'],
    ['#/upgrade', 'upgrade', 'upgrade-top'],
    ['#/magic', 'magic', 'magic-top'],
    ['#/materials/reference', 'materials', 'materials-reference'],
    ['#title', 'power', 'title'],
    ['#upgrade-results', 'upgrade', 'upgrade-results'],
  ] as const)('直接打开或刷新 %s 时恢复目标板块', (hash, workspace, section) => {
    window.history.replaceState(null, '', `${import.meta.env.BASE_URL}${hash}`)
    const view = render(<App />)
    expect(document.getElementById(section)).toBeVisible()
    expect(document.title).toContain(WORKSPACE_LABELS[workspace as Workspace])
    view.unmount()
    render(<App />)
    expect(document.getElementById(section)).toBeVisible()
    expect(screen.queryByRole('heading', { name: '工具箱（4 个工具）', level: 1 })).not.toBeInTheDocument()
  })

  it('浏览器后退和前进会同步可见板块与地址', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: '进入升级时间计算' }))
    fireEvent.click(screen.getByRole('button', { name: '消耗材料查询' }))
    act(() => window.history.back())
    await waitFor(() => expect(document.getElementById('upgrade-top')).toBeVisible())
    expect(window.location.hash).toBe('#/upgrade')
    act(() => window.history.back())
    await waitFor(() => expect(screen.getByRole('heading', { name: '工具箱（4 个工具）', level: 1 })).toBeVisible())
    expect(window.location.hash).toBe('')
    act(() => window.history.forward())
    await waitFor(() => expect(document.getElementById('upgrade-top')).toBeVisible())
    expect(window.location.hash).toBe('#/upgrade')
  })

  it('手动变更旧锚点也切换到相应页面，未知地址回到首页', async () => {
    render(<App />)
    act(() => { window.location.hash = '#tools' })
    await waitFor(() => expect(screen.getByRole('link', { name: '忍具' })).toHaveAttribute('aria-current', 'location'))
    expect(document.getElementById('tools')).toBeVisible()
    act(() => { window.location.hash = '#/not-a-tool' })
    await waitFor(() => expect(screen.getByRole('heading', { name: '工具箱（4 个工具）', level: 1 })).toBeVisible())
  })
})
