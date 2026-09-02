import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MagicCalculator } from './MagicCalculator'
import { MaterialsCalculator } from './MaterialsCalculator'

const choose = (label: string, option: string | RegExp) => {
  fireEvent.click(screen.getByRole('combobox', { name: label }))
  fireEvent.click(within(screen.getByRole('listbox', { name: label })).getByRole('option', { name: option }))
}

describe('抗魔计算器界面', () => {
  it('输入实时更新总抗魔和目标差距，名称与更换标记可独立编辑', () => {
    render(<MagicCalculator />)
    fireEvent.change(screen.getByRole('spinbutton', { name: '耳环基础抗魔' }), { target: { value: '2161' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: '耳环强化等级' }), { target: { value: '1' } })
    expect(within(screen.getByRole('article', { name: '当前总抗魔' })).getByText('2,270')).toBeVisible()
    choose('目标饰品', '落岩')
    expect(within(screen.getByRole('article', { name: '目标抗魔差距' })).getByText('15,531')).toBeVisible()
    choose('耳环饰品名称', '云迹')
    fireEvent.click(screen.getByRole('button', { name: '切换耳环是否更换' }))
    expect(screen.getByRole('button', { name: '切换耳环是否更换' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(screen.getByRole('article', { name: '当前总抗魔' })).getByText('2,270')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: '重置默认值' }))
    expect(screen.getByRole('spinbutton', { name: '耳环基础抗魔' })).toHaveValue(0)
    expect(screen.getByRole('spinbutton', { name: '耳环强化等级' })).toHaveValue(0)
    expect(screen.getByRole('combobox', { name: '耳环饰品名称' })).toHaveTextContent('落岩')
    expect(screen.getByRole('button', { name: '切换耳环是否更换' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('combobox', { name: '目标饰品' })).toHaveTextContent('曙光')
  })

  it('达到门槛后显示已达标', () => {
    render(<MagicCalculator />)
    fireEvent.change(screen.getByRole('spinbutton', { name: '耳环基础抗魔' }), { target: { value: '40841' } })
    const summary = screen.getByRole('article', { name: '目标抗魔差距' })
    expect(within(summary).getByText('✓ 已达标')).toBeVisible()
    expect(within(summary).getByText('已可掉落，超出 0')).toBeVisible()
  })
})

describe('强化材料界面', () => {
  it('显示原始默认数据，区分区间材料、单次消耗与此前累计', () => {
    render(<MaterialsCalculator />)
    expect(within(screen.getByRole('article', { name: '绿水总计' })).getByText('609')).toBeVisible()
    choose('目标强化等级', '+3')
    choose('当前强化等级', '+1')
    expect(screen.getByRole('heading', { name: '破晓 +1 → +3' })).toBeVisible()
    expect(within(screen.getByRole('article', { name: '绿水总计' })).getByText('5,672')).toBeVisible()
    expect(within(screen.getByRole('article', { name: '紫星总计' })).getByText('131')).toBeVisible()
    const table = screen.getByRole('region', { name: '每级强化材料表' })
    const row = within(table).getByRole('row', { name: '+3 目标 3,585 131 0 2,696 0 0' })
    expect(row).toHaveAttribute('aria-current', 'step')
    expect(within(table).getByRole('columnheader', { name: '此前累计消耗' })).toHaveAttribute('colspan', '3')
  })

  it('当前等级升高时同步目标，同级无需材料；更换系列重置范围', () => {
    render(<MaterialsCalculator />)
    choose('当前强化等级', '+30')
    expect(screen.getByRole('combobox', { name: '目标强化等级' })).toHaveTextContent('+30')
    expect(screen.getByText('无需材料')).toBeVisible()
    fireEvent.click(screen.getByRole('combobox', { name: '目标强化等级' }))
    expect(screen.queryByRole('option', { name: '+29' })).not.toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('combobox', { name: '目标强化等级' }), { key: 'Escape' })

    choose('饰品系列', /^云迹/)
    expect(screen.getByRole('heading', { name: '云迹 +0 → +1' })).toBeVisible()
    choose('目标强化等级', '+35')
    expect(within(screen.getByRole('article', { name: '绿水总计' })).getByText('1,535,125')).toBeVisible()
    expect(within(screen.getByRole('article', { name: '保护符总计' })).getByText('2,261')).toBeVisible()
    choose('饰品系列', /^破晓/)
    expect(screen.getByRole('heading', { name: '破晓 +0 → +1' })).toBeVisible()
    fireEvent.click(screen.getByRole('combobox', { name: '目标强化等级' }))
    expect(screen.queryByRole('option', { name: '+35' })).not.toBeInTheDocument()
  })
})
