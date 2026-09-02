import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BarChart3,
  BookOpenText,
  Cat,
  Clock3,
  ChevronRight,
  CircleHelp,
  Download,
  FileDown,
  House,
  Menu,
  PackageSearch,
  PawPrint,
  Printer,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Swords,
  Upload,
  X,
} from 'lucide-react'
import {
  AttributeEditor,
  BreakdownStrip,
  CoreEditor,
  ElementEditor,
  FormulaCard,
  formatNumber,
  ModeSwitch,
  NumberField,
  SectionCard,
} from './components'
import { ThemedSelect } from './ThemedSelect'
import { UpgradeCalculator } from './upgrade/UpgradeCalculator'
import { MagicCalculator } from './magic/MagicCalculator'
import { MaterialsCalculator } from './magic/MaterialsCalculator'
import { HomePage, type NavigateLink } from './home/HomePage'
import {
  POWER_NAV_ITEMS as navItems,
  WORKSPACE_LABELS as workspaceLabels,
  createRoute,
  parseRoute,
  routeHref,
  type Workspace,
} from './navigation'
import { SUMMON_DATA } from './domain/data'
import { calculateAll } from './domain/engine'
import { buildFormulaText, resolveModuleFormulas } from './domain/formulas'
import { initialState, parsePayload, RUNE_SLOTS, sanitizeState, STORAGE_KEY } from './domain/state'
import { createPowerReportPdf } from './export/powerReportPdf'
import type {
  AttributeStats,
  CalculatorState,
  CoreStats,
  ElementKey,
  PowerBreakdown,
  SimpleModuleKey,
} from './domain/types'

const sectionLabels: Record<string, string> = {
  level: '等级',
  soul: '忍魂',
  talent: '天赋',
  equipment: '装备',
  magatama: '勾玉',
  accessories: '饰品',
  artifact: '神器',
  summoning: '通灵',
  toolPanel: '忍具穿戴',
  toolReforge: '重铸',
  toolMuseum: '藏馆',
  toolTreasure: '珍品阁',
  scroll: '秘卷',
  outfit: '装扮',
  title: '称号',
  avatar: '头像框',
}

const sectionColors = [
  '#ff7a1a',
  '#ffc857',
  '#48cae4',
  '#8ecae6',
  '#b8de6f',
  '#c77dff',
  '#ff6b6b',
  '#4dd4ac',
  '#6c8cff',
  '#a68bff',
  '#74b9ff',
  '#f7b731',
  '#82d4bb',
  '#f8a5c2',
  '#81ecec',
  '#e1b12c',
]

const slotLabels: Record<string, string> = {
  earrings: '耳环',
  necklace: '项链',
  bracelet: '手镯',
  ring: '戒指',
  badge: '徽章',
  belt: '腰带',
}

const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? sanitizeState(JSON.parse(saved)) : initialState()
  } catch {
    return initialState()
  }
}

const downloadText = (name: string, content: string, type: string) => {
  downloadBlob(name, new Blob([content], { type }))
}

const downloadBlob = (name: string, blob: Blob) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

const stickerAsset = (name: string) => `${import.meta.env.BASE_URL}stickers/${name}`

function SummonPowerCard({
  title,
  badge,
  data,
  tone,
}: {
  title: string
  badge: string
  data: PowerBreakdown
  tone: 'cultivate' | 'advance'
}) {
  return (
    <article className={`summon-power-card ${tone}`}>
      <div className="summon-power-title">
        <div><span>{title}</span><small>{badge}</small></div>
        <strong>{formatNumber(data.total)}</strong>
      </div>
      <div className="summon-power-stats">
        <div><span>生命战力</span><b>{formatNumber(data.hp)}</b></div>
        <div><span>攻击战力</span><b>{formatNumber(data.atk)}</b></div>
        <div><span>防御战力</span><b>{formatNumber(data.def)}</b></div>
      </div>
    </article>
  )
}

function App() {
  const [state, setState] = useState<CalculatorState>(loadState)
  const [menuOpen, setMenuOpen] = useState(false)
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  const activeWorkspace = route.workspace
  const [powerNavOpen, setPowerNavOpen] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [toast, setToast] = useState('已载入本机数据')
  const fileInput = useRef<HTMLInputElement>(null)
  const result = useMemo(() => calculateAll(state), [state])
  const formulas = useMemo(() => resolveModuleFormulas(state.bonuses), [state.bonuses])

  useEffect(() => {
    const syncLocation = () => {
      setRoute(parseRoute(window.location.hash))
      setMenuOpen(false)
    }
    window.addEventListener('hashchange', syncLocation)
    window.addEventListener('popstate', syncLocation)
    return () => {
      window.removeEventListener('hashchange', syncLocation)
      window.removeEventListener('popstate', syncLocation)
    }
  }, [])

  useEffect(() => {
    if (route.workspace === 'power') setPowerNavOpen(true)
    if (route.workspace === 'home') setPowerNavOpen(false)
    document.title = `${workspaceLabels[route.workspace]} · 火影战力计算器 · 繁星の猫猫星`
    let scrollFrame = 0
    const renderFrame = window.requestAnimationFrame(() => {
      scrollFrame = window.requestAnimationFrame(() => {
        const target = document.getElementById(route.section)
        if (!target) return
        target.scrollIntoView({ block: 'start' })
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
        target.focus({ preventScroll: true })
      })
    })
    return () => {
      window.cancelAnimationFrame(renderFrame)
      window.cancelAnimationFrame(scrollFrame)
    }
  }, [route])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      setToast('已自动保存在本机')
    }, 250)
    return () => window.clearTimeout(timer)
  }, [state])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const updateSimple = (module: SimpleModuleKey, key: keyof CoreStats, value: number) =>
    setState((current) => ({
      ...current,
      simple: { ...current.simple, [module]: { ...current.simple[module], [key]: value } },
    }))

  const updateAttribute = (
    target: 'panel' | 'reforge' | 'museumStats' | 'accessories',
    update: (current: AttributeStats) => AttributeStats,
  ) =>
    setState((current) => {
      if (target === 'accessories') {
        return { ...current, accessories: { ...current.accessories, stats: update(current.accessories.stats) } }
      }
      return { ...current, tools: { ...current.tools, [target]: update(current.tools[target]) } }
    })

  const attrHandlers = (target: 'panel' | 'reforge' | 'museumStats' | 'accessories') => ({
    onCore: (key: keyof CoreStats, value: number) =>
      updateAttribute(target, (current) => ({ ...current, [key]: value })),
    onSpecial: (key: 'crit' | 'antiCrit', value: number) =>
      updateAttribute(target, (current) => ({ ...current, [key]: value })),
    onElement: (group: 'elementAtk' | 'elementDef', key: ElementKey, value: number) =>
      updateAttribute(target, (current) => ({
        ...current,
        [group]: { ...current[group], [key]: value },
      })),
  })

  const exportPdf = async () => {
    if (exportingPdf) return
    setExportingPdf(true)
    setToast('正在生成 PDF 文件…')
    try {
      const blob = await createPowerReportPdf(state, result)
      downloadBlob(`火影战力报告_${new Date().toISOString().slice(0, 10)}.pdf`, blob)
      setToast('PDF 文件已下载')
    } catch (error) {
      setToast(error instanceof Error ? `PDF 导出失败：${error.message}` : 'PDF 导出失败')
    } finally {
      setExportingPdf(false)
    }
  }

  const importJson = async (file?: File) => {
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      setState(parsePayload(parsed))
      setToast('数据导入成功')
    } catch (error) {
      setToast(error instanceof Error ? `导入失败：${error.message}` : '导入失败')
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const reset = () => {
    if (!window.confirm('确定清空战力计算器的全部输入并恢复默认值吗？')) return
    localStorage.removeItem(STORAGE_KEY)
    setState(initialState())
    setToast('战力计算器已恢复默认值')
  }

  const switchWorkspace = (workspace: Workspace, target?: string) => {
    const href = routeHref(workspace, target)
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== href) {
      window.history.pushState(null, '', href)
    }
    setRoute(createRoute(workspace, target))
    setMenuOpen(false)
  }

  const scrollToSection = (id: string) => switchWorkspace(activeWorkspace, id)

  const navigateLink: NavigateLink = (event, workspace, section) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    switchWorkspace(workspace, section)
  }

  const chartData = Object.entries(result.sections)
    .map(([key, data], index) => ({ key, label: sectionLabels[key], value: data.total, color: sectionColors[index] }))
    .sort((a, b) => b.value - a.value)
  const chartMax = Math.max(1, ...chartData.map((item) => item.value))

  return (
    <>
      {activeWorkspace === 'home' && <HomePage onNavigate={navigateLink} />}
      {/* Keep tool instances mounted so returning through home preserves their inputs. */}
      <div className="app-shell" hidden={activeWorkspace === 'home'}>
        <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="打开导航" type="button">
          <Menu size={20} />
        </button>
        {menuOpen && <button className="sidebar-overlay" aria-label="关闭导航" onClick={() => setMenuOpen(false)} />}
        <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
          <div className="brand">
            <div className="brand-mark"><Cat size={25} /></div>
            <div><strong>火影战力计算器</strong><span>NEKO POWER LAB · V1</span></div>
            <button onClick={() => setMenuOpen(false)} className="sidebar-close" aria-label="关闭导航"><X size={20} /></button>
          </div>
          <nav aria-label="页面导航">
            <button
              className="workspace-nav-button home-nav-button"
              type="button"
              onClick={() => switchWorkspace('home')}
            >
              <House size={15} /><span>首页</span>
            </button>
            <button
              className={activeWorkspace === 'power' ? 'nav-group-trigger active' : 'nav-group-trigger'}
              type="button"
              aria-expanded={powerNavOpen}
              aria-controls="power-nav-items"
              onClick={() => setPowerNavOpen((current) => !current)}
            >
              <span><BarChart3 size={15} />战力计算器</span>
              <ChevronRight className={powerNavOpen ? 'nav-arrow open' : 'nav-arrow'} size={15} />
            </button>
            <div className="nav-subitems" id="power-nav-items" hidden={!powerNavOpen}>
              {navItems.map(([id, label]) => (
                <a
                  key={id}
                  href={routeHref('power', id)}
                  aria-current={activeWorkspace === 'power' && route.section === id ? 'location' : undefined}
                  onClick={(event) => navigateLink(event, 'power', id)}
                >
                  <ChevronRight size={13} /><span>{label}</span>
                </a>
              ))}
            </div>
            <button
              className={activeWorkspace === 'upgrade' ? 'workspace-nav-button active' : 'workspace-nav-button'}
              type="button"
              aria-current={activeWorkspace === 'upgrade' ? 'page' : undefined}
              onClick={() => switchWorkspace('upgrade')}
            >
              <Clock3 size={15} /><span>升级时间计算</span>
            </button>
            <button
              className={activeWorkspace === 'magic' ? 'workspace-nav-button active' : 'workspace-nav-button'}
              type="button"
              aria-current={activeWorkspace === 'magic' ? 'page' : undefined}
              onClick={() => switchWorkspace('magic')}
            >
              <ShieldCheck size={15} /><span>抗魔计算器</span>
            </button>
            <button
              className={activeWorkspace === 'materials' ? 'workspace-nav-button active' : 'workspace-nav-button'}
              type="button"
              aria-current={activeWorkspace === 'materials' ? 'page' : undefined}
              onClick={() => switchWorkspace('materials')}
            >
              <PackageSearch size={15} /><span>消耗材料查询</span>
            </button>
          </nav>
          <img
            className="sidebar-cat-sticker"
            src={stickerAsset('sleep-cat.png')}
            alt=""
            aria-hidden="true"
          />
          <div className="sidebar-note">
            <ShieldCheck size={17} />
            <p>数据仅保存在当前浏览器。本工具为非官方同人项目。</p>
          </div>
        </aside>

        <main className="calculator-main">
          <header className="topbar">
            <div className="save-state">
              <Save size={15} />
              {activeWorkspace === 'power' ? (toast || '本机自动保存已开启') : `${workspaceLabels[activeWorkspace]}配置仅在本次会话保留`}
            </div>
            <div className="toolbar">
              {activeWorkspace === 'power' && (
                <>
                  <button onClick={exportPdf} disabled={exportingPdf} title="直接下载 PDF 文本报告">
                    <Download size={16} />{exportingPdf ? '生成中…' : '下载 PDF'}
                  </button>
                  <button onClick={() => fileInput.current?.click()} disabled title="暂未开放"><Upload size={16} />导入</button>
                  <button onClick={() => downloadText('火影战力公式.txt', buildFormulaText(formulas), 'text/plain;charset=utf-8')} disabled title="暂未开放">
                    <FileDown size={16} />公式
                  </button>
                  <button onClick={() => window.print()} disabled title="暂未开放"><Printer size={16} />PDF</button>
                  <button className="danger" onClick={reset}><RotateCcw size={16} />清空</button>
                  <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={(e) => importJson(e.target.files?.[0])} />
                </>
              )}
              <div className="creator-signature" aria-label="署名：繁星の猫猫星">
                <Cat size={17} aria-hidden="true" />
                <span>繁星の猫猫星</span>
              </div>
            </div>
          </header>

          <div className="content workspace-view" hidden={activeWorkspace !== 'power'}>
            <section className="hero" id="overview">
              <img
                className="hero-cat-sticker"
                src={stickerAsset('calculator-cat.png')}
                alt=""
                aria-hidden="true"
              />
              <div className="hero-copy">
                <div className="hero-brandline">
                  <span className="hero-kicker"><PawPrint size={15} />火影战力计算器</span>
                  <span className="hero-byline" aria-label="繁星の猫猫星 制作"><Cat size={14} />繁星の猫猫星 制作</span>
                </div>
                <h1>把每一点属性，<br /><em>算得明明白白。</em></h1>
                <p>完整拆解等级、装备、忍具、通灵与符文收益。所有算法在本机执行，实时联动，不上传数据。</p>
                <div className="hero-pills"><span>16 个战力模块</span><span>精确到 0.01</span><span>离线可用</span></div>
              </div>
              <div className="power-orb">
                <div className="orb-ring" />
                <span>综合战力</span>
                <strong>{formatNumber(result.grandTotal)}</strong>
                <small>未归属面板 {formatNumber(result.unattributedPower)}</small>
              </div>
            </section>

            <section className="dashboard-grid">
              <article className="panel chart-panel">
                <div className="panel-title"><div><BarChart3 size={19} /><h2>战力分布</h2></div><span>由高到低</span></div>
                <div className="power-chart">
                  {chartData.map((item) => (
                    <div className="chart-row" key={item.key}>
                      <span>{item.label}</span>
                      <div className="track"><i style={{ width: `${item.value / chartMax * 100}%`, background: item.color }} /></div>
                      <b>{item.value ? formatNumber(item.value, 0) : '—'}</b>
                    </div>
                  ))}
                </div>
              </article>
              <article className="panel panel-stats">
                <div className="panel-title"><div><Swords size={19} /><h2>等效总面板</h2></div><span>仅可归属属性</span></div>
                <div className="stat-matrix">
                  {[
                    ['生命', result.panel.hp],
                    ['攻击', result.panel.atk],
                    ['防御', result.panel.def],
                    ['暴击', result.panel.crit],
                    ['抗暴', result.panel.antiCrit],
                    ['元素攻', result.panel.elementAtk],
                    ['元素防', result.panel.elementDef],
                  ].map(([label, value]) => <div key={label as string}><span>{label}</span><strong>{formatNumber(value as number)}</strong></div>)}
                </div>
                <p className="panel-footnote"><CircleHelp size={15} />符文、藏馆、珍品阁的直接战力无法反推属性，单独列入综合战力。</p>
              </article>
            </section>
            <FormulaCard formula={formulas.overview} compact />

            <section id="collection" className="bonus-panel">
              <img
                className="peek-cat-sticker"
                src={stickerAsset('peek-cat.png')}
                alt=""
                aria-hidden="true"
              />
              <div><span className="eyebrow">GLOBAL BONUS</span><h2>忍者收集加成</h2><p>修改一次，全页面所有计算立即联动。</p></div>
              <div className="bonus-fields">
                <ThemedSelect
                  label="全收集档位"
                  value={state.bonuses.collectionPct}
                  options={[
                    { value: 20.3, label: '20.3% · 五星 S', hint: '最高收集倍率' },
                    { value: 16.2, label: '16.2% · 四星 S / 五星 A' },
                    { value: 13, label: '13% · 四星 A' },
                    { value: 12.2, label: '12.2% · 三星 S' },
                  ]}
                  onChange={(collectionPct) => setState((s) => ({ ...s, bonuses: { ...s.bonuses, collectionPct } }))}
                />
                {(['hpPct', 'atkPct', 'defPct'] as const).map((key) => (
                  <NumberField key={key} label={{ hpPct: '生命百分比', atkPct: '攻击百分比', defPct: '防御百分比' }[key]}
                    value={state.bonuses[key]} step={0.1} suffix="%"
                    onChange={(value) => setState((s) => ({ ...s, bonuses: { ...s.bonuses, [key]: value } }))} />
                ))}
              </div>
              <FormulaCard formula={formulas.collection} compact />
            </section>

            <SectionCard id="level" eyebrow="LEVEL" title="等级战力" description="按 20–170 级收益表精确查表，并叠加全局收集倍率。" value={result.sections.level.total} formula={formulas.level} tone="blue">
              <div className="level-field">
                <NumberField label="当前等级" value={state.level} min={20} max={170} onChange={(level) => setState((s) => ({ ...s, level: Math.trunc(level) }))} />
              </div>
              <BreakdownStrip data={result.sections.level} />
            </SectionCard>

            <SectionCard id="soul" eyebrow="SOUL" title="忍魂" description="忍传感悟吃收集加成；羁绊升级按基础系数直接换算。" value={result.sections.soul.total} formula={formulas.soul}>
              <div className="split-editor"><div><h3>忍传感悟</h3><CoreEditor value={state.soul.insight} onChange={(key, value) => setState((s) => ({ ...s, soul: { ...s.soul, insight: { ...s.soul.insight, [key]: value } } }))} /></div>
                <div><h3>羁绊升级</h3><CoreEditor value={state.soul.bond} onChange={(key, value) => setState((s) => ({ ...s, soul: { ...s.soul, bond: { ...s.soul.bond, [key]: value } } }))} /></div></div>
              <BreakdownStrip data={result.sections.soul} />
            </SectionCard>

            <SectionCard id="talent" eyebrow="TALENT" title="天赋" description="普通天赋与修罗天赋分别计算，再汇入天赋总战力。" value={result.sections.talent.total} formula={formulas.talent} tone="purple">
              <div className="split-editor"><div><h3>普通天赋</h3><CoreEditor value={state.talent.normal} onChange={(key, value) => setState((s) => ({ ...s, talent: { ...s.talent, normal: { ...s.talent.normal, [key]: value } } }))} /></div>
                <div><h3>修罗天赋</h3><CoreEditor value={state.talent.shura} onChange={(key, value) => setState((s) => ({ ...s, talent: { ...s.talent, shura: { ...s.talent.shura, [key]: value } } }))} /></div></div>
              <BreakdownStrip data={result.sections.talent} />
            </SectionCard>

            {([
              ['equipment', 'EQUIPMENT', '装备', '装备三维属性吃全局收集倍率。', 'blue'],
              ['magatama', 'MAGATAMA', '勾玉', '勾玉生命、攻击、防御统一计算。', 'green'],
            ] as const).map(([key, eyebrow, title, description, tone]) => (
              <SectionCard key={key} id={key} eyebrow={eyebrow} title={title} description={description} value={result.sections[key].total} formula={formulas[key]} tone={tone}>
                <CoreEditor value={state.simple[key]} onChange={(field, value) => updateSimple(key, field, value)} />
                <BreakdownStrip data={result.sections[key]} />
              </SectionCard>
            ))}

            <SectionCard id="accessories" eyebrow="ACCESSORIES" title="饰品与符文" description="饰品属性、六件符文直接战力和自动匹配的共鸣属性合并计算。" value={result.sections.accessories.total} formula={formulas.accessories} tone="green">
              <AttributeEditor value={state.accessories.stats} {...attrHandlers('accessories')} elements={false} />
              <div className="rune-grid">
                {RUNE_SLOTS.map((slot) => {
                  const match = result.runes[slot]
                  return <div className="rune-card" key={slot}><div><span>{slotLabels[slot]}</span><b>{match.level} 级共鸣</b></div>
                    <NumberField label="符文战力" value={state.accessories.runes[slot].power} onChange={(power) => setState((s) => ({ ...s, accessories: { ...s.accessories, runes: { ...s.accessories.runes, [slot]: { power } } } }))} />
                    <small>生命 {match.hp} · 攻击 {match.atk} · 防御 {match.def}</small></div>
                })}
              </div>
              <BreakdownStrip data={result.sections.accessories} />
            </SectionCard>

            <SectionCard id="artifact" eyebrow="ARTIFACT" title="神器" description="神器三维属性吃全局收集倍率。" value={result.sections.artifact.total} formula={formulas.artifact} tone="purple">
              <CoreEditor value={state.simple.artifact} onChange={(key, value) => updateSimple('artifact', key, value)} /><BreakdownStrip data={result.sections.artifact} />
            </SectionCard>

            <SectionCard id="summoning" eyebrow="SUMMON" title="通灵" description="修炼属性由通灵兽、等级与强化次数查表；进阶属性由总面板扣除修炼值。" value={result.sections.summoning.total} formula={formulas.summoning}>
              <div className="summon-selects">
                <ThemedSelect
                  label="通灵兽"
                  value={state.summon.beast}
                  options={Object.keys(SUMMON_DATA).map((name) => ({ value: name, label: name }))}
                  onChange={(beast) => setState((s) => ({ ...s, summon: { ...s.summon, beast, level: Math.min(s.summon.level, SUMMON_DATA[beast].length) } }))}
                />
                <NumberField label={`修炼等级（最高 ${result.summon.maxLevel}）`} value={state.summon.level} min={1} max={result.summon.maxLevel} onChange={(level) => setState((s) => ({ ...s, summon: { ...s.summon, level: Math.trunc(level) } }))} />
                <ThemedSelect
                  label="强化次数"
                  value={state.summon.enhance}
                  options={[0, 1, 2, 3, 4].map((value) => ({ value, label: `第 ${value} 次` }))}
                  onChange={(enhance) => setState((s) => ({ ...s, summon: { ...s.summon, enhance } }))}
                />
              </div>
              <div className="split-editor"><div><h3>输入通灵总面板</h3><CoreEditor value={state.summon.total} onChange={(key, value) => setState((s) => ({ ...s, summon: { ...s.summon, total: { ...s.summon.total, [key]: value } } }))} /></div>
                <div className="summon-result"><h3>查表拆分</h3><p className="summon-progress">修炼等级：{state.summon.level} 级 · 第 {state.summon.enhance} 次强化</p><p>修炼：生命 {formatNumber(result.summon.cultivate.hp, 0)} · 攻击 {formatNumber(result.summon.cultivate.atk, 0)} · 防御 {formatNumber(result.summon.cultivate.def, 0)}</p><p>进阶：生命 {formatNumber(result.summon.advance.hp, 0)} · 攻击 {formatNumber(result.summon.advance.atk, 0)} · 防御 {formatNumber(result.summon.advance.def, 0)}</p></div></div>
              <div className="summon-power-grid">
                <SummonPowerCard title="修炼总战力" badge="吃收集加成" data={result.summon.cultivatePower} tone="cultivate" />
                <SummonPowerCard title="进阶总战力" badge="不吃收集加成" data={result.summon.advancePower} tone="advance" />
                <article className="summon-grand-total">
                  <span>通灵总战力（修炼 + 进阶）</span>
                  <strong>{formatNumber(result.sections.summoning.total)}</strong>
                  <p>{formatNumber(result.summon.cultivatePower.total)} + {formatNumber(result.summon.advancePower.total)}</p>
                </article>
              </div>
            </SectionCard>

            <section id="tools" className="section-card tone-blue">
              <header className="section-head"><div><span className="eyebrow">NINJA TOOL</span><h2>忍具系统</h2><p>穿戴、重铸、藏馆与珍品阁分项计算，避免模式混用。</p></div>
                <div className="section-total"><span>忍具总战力</span><strong>{formatNumber(result.sections.toolPanel.total + result.sections.toolReforge.total + result.sections.toolMuseum.total + result.sections.toolTreasure.total)}</strong></div></header>
              <div className="tool-block"><h3>忍具穿戴 · {formatNumber(result.sections.toolPanel.total)}</h3><FormulaCard formula={formulas.toolPanel} compact /><AttributeEditor value={state.tools.panel} {...attrHandlers('panel')} /><BreakdownStrip data={result.sections.toolPanel} /></div>
              <div className="tool-block"><h3>挂件坠饰重铸 · {formatNumber(result.sections.toolReforge.total)}</h3><FormulaCard formula={formulas.toolReforge} compact /><AttributeEditor value={state.tools.reforge} {...attrHandlers('reforge')} elements={false} /><BreakdownStrip data={result.sections.toolReforge} /></div>
              <div className="tool-block"><div className="tool-title"><h3>藏馆 · {formatNumber(result.sections.toolMuseum.total)}</h3><ModeSwitch value={state.tools.museumMode} onChange={(museumMode) => setState((s) => ({ ...s, tools: { ...s.tools, museumMode } }))} /></div>
                <FormulaCard formula={formulas.toolMuseum} compact />
                {state.tools.museumMode === 'direct' ? <NumberField label="藏馆直接战力" value={state.tools.museumDirectPower} onChange={(museumDirectPower) => setState((s) => ({ ...s, tools: { ...s.tools, museumDirectPower } }))} /> : <AttributeEditor value={state.tools.museumStats} {...attrHandlers('museumStats')} />}
                <BreakdownStrip data={result.sections.toolMuseum} /></div>
              <div className="tool-block"><div className="tool-title"><h3>珍品阁 · {formatNumber(result.sections.toolTreasure.total)}</h3><ModeSwitch value={state.tools.treasureMode} onChange={(treasureMode) => setState((s) => ({ ...s, tools: { ...s.tools, treasureMode } }))} /></div>
                <FormulaCard formula={formulas.toolTreasure} compact />
                {state.tools.treasureMode === 'direct' ? <NumberField label="珍品阁直接战力" value={state.tools.treasureDirectPower} onChange={(treasureDirectPower) => setState((s) => ({ ...s, tools: { ...s.tools, treasureDirectPower } }))} /> : <ElementEditor title="五行防御" value={state.tools.treasureElementDef} onChange={(key, value) => setState((s) => ({ ...s, tools: { ...s.tools, treasureElementDef: { ...s.tools.treasureElementDef, [key]: value } } }))} />}
                <BreakdownStrip data={result.sections.toolTreasure} /></div>
            </section>

            {([
              ['scroll', 'SCROLL', '秘卷', '秘卷三维属性吃全局收集倍率。', 'green'],
              ['outfit', 'OUTFIT', '装扮', '装扮属性按基础系数计算，不吃收集加成。', 'purple'],
              ['title', 'TITLE', '称号', '称号三维属性吃全局收集倍率。', 'orange'],
              ['avatar', 'AVATAR', '头像框', '头像框三维属性吃全局收集倍率。', 'blue'],
            ] as const).map(([key, eyebrow, title, description, tone]) => (
              <SectionCard key={key} id={key} eyebrow={eyebrow} title={title} description={description} value={result.sections[key].total} formula={formulas[key]} tone={tone}>
                <CoreEditor value={state.simple[key]} onChange={(field, value) => updateSimple(key, field, value)} />
                <BreakdownStrip data={result.sections[key]} />
              </SectionCard>
            ))}

            <footer><BookOpenText size={17} /><p>本工具为非官方同人计算项目，仅供数据分析与交流，不代表游戏官方规则或数值承诺。</p></footer>
          </div>
          <div className="workspace-view" hidden={activeWorkspace !== 'upgrade'}>
            <UpgradeCalculator resetSignal={0} />
          </div>
          <div className="workspace-view" hidden={activeWorkspace !== 'magic'}>
            <MagicCalculator />
          </div>
          <div className="workspace-view" hidden={activeWorkspace !== 'materials'}>
            <MaterialsCalculator />
          </div>
        </main>
        <nav className="mobile-bottom-nav" aria-label="手机端主导航">
          {activeWorkspace === 'power' ? (
            <>
              <button type="button" onClick={() => switchWorkspace('upgrade')}><Clock3 size={20} /><span>升级</span></button>
              <button type="button" onClick={() => scrollToSection('collection')}><BarChart3 size={20} /><span>收集</span></button>
              <button className="mobile-fab" type="button" aria-label="返回首页" onClick={() => switchWorkspace('home')}><House size={25} /></button>
              <button type="button" onClick={() => scrollToSection('tools')}><Sparkles size={20} /><span>忍具</span></button>
              <button type="button" onClick={() => scrollToSection('accessories')}><ShieldCheck size={20} /><span>符文</span></button>
            </>
          ) : activeWorkspace === 'upgrade' ? (
            <>
              <button type="button" onClick={() => switchWorkspace('power')}><House size={20} /><span>战力</span></button>
              <button type="button" onClick={() => scrollToSection('upgrade-results')}><BarChart3 size={20} /><span>结果</span></button>
              <button className="mobile-fab" type="button" aria-label="返回首页" onClick={() => switchWorkspace('home')}><House size={25} /></button>
              <button type="button" onClick={() => scrollToSection('upgrade-reference')}><BookOpenText size={20} /><span>经验表</span></button>
              <button type="button" onClick={() => scrollToSection('upgrade-top')}><Clock3 size={20} /><span>升级</span></button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => switchWorkspace('power')}><House size={20} /><span>战力</span></button>
              <button type="button" onClick={() => switchWorkspace('upgrade')}><Clock3 size={20} /><span>升级</span></button>
              <button className="mobile-fab" type="button" aria-label="返回首页" onClick={() => switchWorkspace('home')}><House size={25} /></button>
              <button type="button" aria-current={activeWorkspace === 'magic' ? 'page' : undefined} onClick={() => switchWorkspace('magic')}><ShieldCheck size={20} /><span>抗魔</span></button>
              <button type="button" aria-current={activeWorkspace === 'materials' ? 'page' : undefined} onClick={() => switchWorkspace('materials')}><PackageSearch size={20} /><span>材料</span></button>
            </>
          )}
        </nav>
      </div>
    </>
  )
}

export default App
