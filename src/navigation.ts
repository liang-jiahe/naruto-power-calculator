export const POWER_NAV_ITEMS = [
  ['overview', '战力总览'],
  ['collection', '忍者收集'],
  ['level', '等级战力'],
  ['soul', '忍魂'],
  ['talent', '天赋'],
  ['equipment', '装备'],
  ['magatama', '勾玉'],
  ['accessories', '饰品符文'],
  ['artifact', '神器'],
  ['summoning', '通灵'],
  ['tools', '忍具'],
  ['scroll', '秘卷'],
  ['outfit', '装扮'],
  ['title', '称号'],
  ['avatar', '头像框'],
] as const

export const WORKSPACE_LABELS = {
  home: '工具首页',
  power: '战力计算器',
  upgrade: '升级时间计算',
  magic: '抗魔计算器',
  materials: '消耗材料查询',
} as const

export type Workspace = keyof typeof WORKSPACE_LABELS
export type AppRoute = { workspace: Workspace; section: string }

export const WORKSPACE_TARGETS: Record<Workspace, string> = {
  home: 'home-top', power: 'overview', upgrade: 'upgrade-top', magic: 'magic-top', materials: 'materials-top',
}

const routeTargets: Record<Workspace, readonly string[]> = {
  home: ['home-top'],
  power: POWER_NAV_ITEMS.map(([id]) => id),
  upgrade: ['upgrade-top', 'upgrade-results', 'upgrade-reference'],
  magic: ['magic-top', 'magic-tiers'],
  materials: ['materials-top', 'materials-results', 'materials-reference'],
}

export function createRoute(workspace: Workspace, section?: string): AppRoute {
  return { workspace, section: section && routeTargets[workspace].includes(section) ? section : WORKSPACE_TARGETS[workspace] }
}

// Hash routes work on GitHub Pages without server-side SPA rewrites.
// Keep old section anchors such as #title and #upgrade-results working too.
export function parseRoute(hash: string): AppRoute {
  const home = createRoute('home')
  let value: string
  try {
    value = decodeURIComponent(hash.replace(/^#/, ''))
  } catch {
    return home
  }
  if (!value || value === '/' || value === '/home') return home

  if (!value.startsWith('/')) {
    const workspace = (Object.keys(routeTargets) as Workspace[]).find((key) => routeTargets[key].includes(value))
    return workspace ? createRoute(workspace, value) : home
  }

  const [workspaceName, sectionName, ...extra] = value.slice(1).split('/')
  if (!Object.hasOwn(WORKSPACE_LABELS, workspaceName) || extra.length) return home
  const workspace = workspaceName as Workspace
  const section = sectionName
    ? (workspace === 'power' ? sectionName : `${workspace}-${sectionName}`)
    : WORKSPACE_TARGETS[workspace]
  return routeTargets[workspace].includes(section) ? createRoute(workspace, section) : home
}

export function routeHref(workspace: Workspace, section?: string) {
  const route = createRoute(workspace, section)
  if (workspace === 'home') return import.meta.env.BASE_URL
  const suffix = route.section === WORKSPACE_TARGETS[workspace]
    ? ''
    : `/${route.section.replace(new RegExp(`^${workspace}-`), '')}`
  return `${import.meta.env.BASE_URL}#/${workspace}${suffix}`
}
