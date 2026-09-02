import type { MouseEvent } from 'react'
import { ArrowRight, BarChart3, Clock3, PackageSearch, PawPrint, ShieldCheck } from 'lucide-react'
import { POWER_NAV_ITEMS, routeHref, type Workspace } from '../navigation'
import './home.css'

const tools = [
  {
    workspace: 'power', title: '战力计算器', icon: BarChart3, tone: 'mint',
    description: '拆解每一点属性，查看综合战力、面板与各模块收益。',
    tags: ['16 个战力模块', '本机自动保存'], action: '计算我的战力',
  },
  {
    workspace: 'upgrade', title: '升级时间计算', icon: Clock3, tone: 'lavender',
    description: '按每日体力与经验来源，推演到达目标等级需要多久。',
    tags: ['140—170 级', '逐日升级推演'], action: '规划升级进度',
  },
  {
    workspace: 'magic', title: '抗魔计算器', icon: ShieldCheck, tone: 'peach',
    description: '汇总六件饰品的强化抗魔，看看离目标掉落门槛还有多远。',
    tags: ['6 个饰品部位', '10 个掉落品级'], action: '查看抗魔差距',
  },
  {
    workspace: 'materials', title: '消耗材料查询', icon: PackageSearch, tone: 'blue',
    description: '选择饰品与强化区间，一次查清绿水、紫星和保护符。',
    tags: ['5 套材料数据', '单次与累计消耗'], action: '查询强化材料',
  },
] as const

export type NavigateLink = (event: MouseEvent<HTMLAnchorElement>, workspace: Workspace, section?: string) => void

export function HomePage({ onNavigate }: { onNavigate: NavigateLink }) {
  return (
    <div className="home-workspace" id="home-top">
      <header className="home-heading">
        <span className="home-kicker"><PawPrint size={15} />NEKO POWER LAB</span>
        <h1>火影工具首页</h1>
        <p>今天，想算点什么？选一个工具，马上开始。</p>
      </header>

      <section className="home-tool-grid" aria-label="工具快捷入口">
        {tools.map(({ workspace, title, icon: Icon, tone, description, tags, action }) => (
          <a
            key={workspace} className={`home-tool-card ${tone}`} href={routeHref(workspace)}
            aria-label={`进入${title}`} onClick={(event) => onNavigate(event, workspace)}
          >
            <div className="home-tool-top"><span className="home-tool-icon"><Icon size={25} aria-hidden="true" /></span><ArrowRight className="home-tool-arrow" size={21} aria-hidden="true" /></div>
            <h2>{title}</h2>
            <p>{description}</p>
            <div className="home-tool-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <span className="home-tool-action">{action}<ArrowRight size={15} aria-hidden="true" /></span>
          </a>
        ))}
      </section>

      <section className="home-shortcuts" aria-labelledby="home-shortcuts-title">
        <div className="home-section-heading">
          <div><h2 id="home-shortcuts-title">战力分项直达</h2><p>已知道要算哪一项？直接打开对应输入区。</p></div>
          <span><BarChart3 size={16} />与侧边栏同步</span>
        </div>
        <nav className="home-shortcut-grid" aria-label="战力分项快捷入口">
          {POWER_NAV_ITEMS.map(([id, label]) => (
            <a key={id} href={routeHref('power', id)} aria-label={`直达${label}`} onClick={(event) => onNavigate(event, 'power', id)}>
              <span>{label}</span><ArrowRight size={15} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </section>

      <div className="home-local-note"><ShieldCheck size={18} aria-hidden="true" /><p>所有计算都在本机完成。战力数据自动保存；其他工具的输入在本次页面会话内保留，来回切换不会清空。</p></div>
    </div>
  )
}
