import type { MouseEvent } from 'react'
import { BarChart3, Cat, Clock3, PackageSearch, ShieldCheck } from 'lucide-react'
import { routeHref, type Workspace } from '../navigation'
import './home.css'

const tools = [
  {
    workspace: 'power', title: '战力计算器', icon: BarChart3,
    description: '拆解每一点属性，查看综合战力、面板与各模块收益。',
  },
  {
    workspace: 'upgrade', title: '升级时间计算', icon: Clock3,
    description: '按每日体力与经验来源，推演到达目标等级需要多久。',
  },
  {
    workspace: 'magic', title: '抗魔计算器', icon: ShieldCheck,
    description: '汇总六件饰品的强化抗魔，看看离目标掉落门槛还有多远。',
  },
  {
    workspace: 'materials', title: '消耗材料查询', icon: PackageSearch,
    description: '选择饰品与强化区间，一次查清绿水、紫星和保护符。',
  },
] as const

export type NavigateLink = (event: MouseEvent<HTMLAnchorElement>, workspace: Workspace, section?: string) => void

export function HomePage({ onNavigate }: { onNavigate: NavigateLink }) {
  return (
    <main className="home-workspace" id="home-top" aria-labelledby="home-title" tabIndex={-1}>
      <header className="home-heading">
        <span className="home-category-icon"><Cat size={23} aria-hidden="true" /></span>
        <h1 id="home-title">工具箱<span>（{tools.length} 个工具）</span></h1>
      </header>

      <section className="home-tool-grid" aria-label="工具快捷入口">
        {tools.map(({ workspace, title, icon: Icon, description }) => (
          <a
            key={workspace} className="home-tool-card" href={routeHref(workspace)}
            aria-label={`进入${title}`} aria-describedby={`home-${workspace}-description`}
            onClick={(event) => onNavigate(event, workspace)}
          >
            <span className="home-tool-icon"><Icon size={23} aria-hidden="true" /></span>
            <div className="home-tool-copy">
              <h2>{title}</h2>
              <p id={`home-${workspace}-description`}>{description}</p>
            </div>
          </a>
        ))}
      </section>
    </main>
  )
}
