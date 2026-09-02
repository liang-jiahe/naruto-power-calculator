import { describe, expect, it } from 'vitest'
import { POWER_NAV_ITEMS, WORKSPACE_LABELS, WORKSPACE_TARGETS, createRoute, parseRoute, routeHref, type Workspace } from './navigation'

describe('首页与工具地址', () => {
  it.each(['', '#', '#/', '#/home', '#home-top'])('%s 默认解析为首页', (hash) => {
    expect(parseRoute(hash)).toEqual({ workspace: 'home', section: 'home-top' })
  })

  it.each(Object.keys(WORKSPACE_LABELS) as Workspace[])('%s 的链接在项目根路径内，并可反向解析', (workspace) => {
    const href = routeHref(workspace)
    expect(href.startsWith(import.meta.env.BASE_URL)).toBe(true)
    const url = new URL(href, 'https://example.com')
    expect(url.pathname).toBe(import.meta.env.BASE_URL)
    expect(parseRoute(url.hash)).toEqual(createRoute(workspace))
    if (workspace === 'home') expect(url.hash).toBe('')
    else expect(url.hash).toBe(`#/${workspace}`)
  })

  it.each(POWER_NAV_ITEMS)('%s 的新地址与旧锚点都定位到 %s', (section) => {
    expect(parseRoute(`#${section}`)).toEqual(createRoute('power', section))
    expect(parseRoute(new URL(routeHref('power', section), 'https://example.com').hash)).toEqual(createRoute('power', section))
  })

  it.each([
    ['upgrade', 'upgrade-results', '#/upgrade/results'],
    ['upgrade', 'upgrade-reference', '#/upgrade/reference'],
    ['magic', 'magic-tiers', '#/magic/tiers'],
    ['materials', 'materials-results', '#/materials/results'],
    ['materials', 'materials-reference', '#/materials/reference'],
  ] as const)('%s 的内部区块 %s 可以直接打开', (workspace, section, hash) => {
    expect(routeHref(workspace, section)).toBe(`${import.meta.env.BASE_URL}${hash}`)
    expect(parseRoute(hash)).toEqual({ workspace, section })
    expect(parseRoute(`#${section}`)).toEqual({ workspace, section })
  })

  it.each(['#unknown', '#/power/missing', '#/upgrade/tools', '#/power/tools/extra', '#/constructor', '#/__proto__', '#/%E0%A4%A'])('未知或损坏地址 %s 安全回到首页', (hash) => {
    expect(parseRoute(hash)).toEqual(createRoute('home'))
  })

  it('非法目标不生成越界地址', () => {
    expect(createRoute('power', 'materials-top').section).toBe(WORKSPACE_TARGETS.power)
    expect(routeHref('magic', '../power')).toBe(`${import.meta.env.BASE_URL}#/magic`)
  })
})
