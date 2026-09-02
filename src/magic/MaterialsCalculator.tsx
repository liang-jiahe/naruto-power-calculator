import { useState } from 'react'
import { PackageSearch } from 'lucide-react'
import { ThemedSelect } from '../ThemedSelect'
import { formatNumber } from '../components'
import { calculateMaterials, createMaterialQuery, normalizeMaterialQuery } from './calculator'
import { MATERIAL_DATA, type MaterialSeriesName } from './materials-data'
import './magic.css'

const materialFields = [
  ['greenWater', '绿水', 'mint'],
  ['purpleStar', '紫星', 'lavender'],
  ['protectionCharm', '保护符', 'peach'],
] as const
const format = (value: number) => formatNumber(value, 0)

export function MaterialsCalculator() {
  const [query, setQuery] = useState(createMaterialQuery)
  const result = calculateMaterials(query)
  const levels = Array.from({ length: result.series.maxLevel + 1 }, (_, level) => ({ value: level, label: `+${level}` }))

  return (
    <div className="magic-workspace" id="materials-top">
      <header className="magic-heading">
        <div>
          <h1>强化材料查询</h1>
          <p>选择饰品系列和强化区间，查清每级与累计需要的绿水、紫星和保护符。</p>
        </div>
        <img src={`${import.meta.env.BASE_URL}stickers/peek-cat.png`} alt="" aria-hidden="true" />
      </header>

      <section className="magic-card" aria-label="材料查询">
        <div className="magic-material-controls">
          <ThemedSelect<MaterialSeriesName>
            label="饰品系列" value={query.series}
            options={Object.values(MATERIAL_DATA).map((series) => ({ value: series.name as MaterialSeriesName, label: series.name, hint: `最高 +${series.maxLevel}` }))}
            onChange={(series) => setQuery({ series, current: 0, target: 1 })}
          />
          <ThemedSelect label="当前强化等级" value={query.current} options={levels}
            onChange={(current) => setQuery((previous) => normalizeMaterialQuery({ ...previous, current }))} />
          <ThemedSelect label="目标强化等级" value={query.target} options={levels.filter((level) => level.value >= query.current)}
            onChange={(target) => setQuery((previous) => normalizeMaterialQuery({ ...previous, target }))} />
        </div>
        <div id="materials-results">
          <div className="magic-section-heading">
            <h2><PackageSearch size={19} />{query.series} +{result.current} → +{result.target}</h2>
            <span className="magic-badge">{result.levelCount ? `累计 ${result.levelCount} 级` : '无需材料'}</span>
          </div>
          <div className="magic-summary" aria-label="区间材料总消耗" aria-live="polite">
            {materialFields.map(([key, label, tone]) => <article key={key} className={`magic-metric ${tone}`} aria-label={`${label}总计`}>
              <span>{label}总计</span><strong>{format(result.totals[key])}</strong>
              <small>当前 +{result.current} 至目标 +{result.target}</small>
            </article>)}
          </div>
          <div className="magic-single-level">
            <div><strong>{result.target === 0 ? '+0 无单次消耗' : `+${result.target} 单次强化`}</strong><small>从前一级强化到目标等级</small></div>
            <div className="magic-material-chips" aria-label="目标等级单次材料">
              {materialFields.map(([key, label]) => <span key={key}>{label} <b>{format(result.targetCost[key])}</b></span>)}
            </div>
          </div>
        </div>
        <p className="magic-footnote">区间总计累加“当前等级 + 1”至目标等级的每一级材料。当前等级与目标等级相同时无需材料。</p>
      </section>

      <section className="magic-card" id="materials-reference" aria-labelledby="materials-table-title">
        <div className="magic-section-heading"><h2 id="materials-table-title">{query.series}每级材料表</h2><span className="magic-badge">+1 至 +{result.series.maxLevel}</span></div>
        <div className="magic-table-scroll" role="region" aria-label="每级强化材料表" tabIndex={0}>
          <table className="magic-table magic-material-table">
            <thead>
              <tr>
                <th rowSpan={2} scope="col">强化到</th>
                <th colSpan={3} scope="colgroup" className="magic-group-heading">单次消耗</th>
                <th colSpan={3} scope="colgroup" className="magic-group-heading cumulative">此前累计消耗</th>
              </tr>
              <tr>{[false, true].flatMap((cumulative) => materialFields.map(([key, label], index) => <th
                key={`${cumulative}-${key}`} scope="col" className={cumulative && index === 0 ? 'magic-cumulative-start magic-numeric' : 'magic-numeric'}
                title={cumulative ? `强化到该等级前已使用的${label}` : `强化到该等级单次消耗的${label}`}
              >{label}</th>))}</tr>
            </thead>
            <tbody>{result.rows.map((row) => <tr
              key={row.level} className={row.isTarget ? 'magic-target-row' : row.inRange ? 'magic-current-row' : ''}
              aria-current={row.isTarget ? 'step' : undefined}
            >
              <th scope="row">+{row.level} {row.isTarget && <span className="magic-status target">目标</span>}</th>
              {materialFields.map(([key]) => <td className="magic-numeric" key={key}>{format(row[key])}</td>)}
              {materialFields.map(([key], index) => <td className={index === 0 ? 'magic-numeric magic-cumulative-start' : 'magic-numeric'} key={`prior-${key}`}>{format(row.priorCost[key])}</td>)}
            </tr>)}</tbody>
          </table>
        </div>
        <p className="magic-footnote">“此前累计消耗”不含当前行单次消耗。例如 +1 的此前累计为 0，+2 的此前累计为 +1 的单次材料。</p>
      </section>
    </div>
  )
}
