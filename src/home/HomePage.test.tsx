import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WORKSPACE_LABELS, routeHref } from '../navigation'
import { HomePage, type NavigateLink } from './HomePage'

describe('紧凑工具目录', () => {
  it.each(['power', 'upgrade', 'magic', 'materials'] as const)('%s 卡片保留原生链接与完整说明，并传递正确导航目标', (workspace) => {
    const onNavigate = vi.fn<NavigateLink>((event) => event.preventDefault())
    render(<HomePage onNavigate={onNavigate} />)
    const title = WORKSPACE_LABELS[workspace]
    const link = screen.getByRole('link', { name: `进入${title}` })
    const description = document.getElementById(`home-${workspace}-description`)
    expect(link).toHaveAttribute('href', routeHref(workspace))
    expect(link).not.toHaveAttribute('tabindex')
    expect(link).toContainElement(screen.getByRole('heading', { name: title, level: 2 }))
    expect(link).toHaveAccessibleDescription(description?.textContent ?? '')
    expect(description?.textContent?.length).toBeGreaterThan(0)
    fireEvent.click(link, { detail: 0 })
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith(expect.anything(), workspace)
  })
})
