import { useState } from 'react'
import { Check, PawPrint, RotateCcw, ShieldCheck, X } from 'lucide-react'
import { NumberField, formatNumber } from '../components'
import { ThemedSelect } from '../ThemedSelect'
import {
  DEFAULT_MAGIC_TARGET,
  MAGIC_SLOTS,
  MAGIC_TIERS,
  MAX_MAGIC_LEVEL,
  calculateMagic,
  createMagicPieces,
  nonNegativeInteger,
  type MagicPiece,
  type MagicTierName,
} from './calculator'
import './magic.css'

const format = (value: number) => formatNumber(value, 0)
const tierOptions = MAGIC_TIERS.map((tier) => ({ value: tier.name, label: tier.name }))

export function MagicCalculator() {
  const [pieces, setPieces] = useState(createMagicPieces)
  const [target, setTarget] = useState<MagicTierName>(DEFAULT_MAGIC_TARGET)
  const result = calculateMagic(pieces, target)

  const updatePiece = (index: number, update: Partial<MagicPiece>) =>
    setPieces((current) => current.map((piece, i) => i === index ? { ...piece, ...update } : piece))

  const reset = () => {
    setPieces(createMagicPieces())
    setTarget(DEFAULT_MAGIC_TARGET)
  }

  return (
    <div className="magic-workspace" id="magic-top">
      <header className="magic-heading">
        <div>
          <span className="magic-kicker"><PawPrint size={15} />MAGIC CHECK</span>
          <h1>抗魔计算器</h1>
          <p>输入六件饰品的基础抗魔和强化等级，看看离目标饰品还有多远。</p>
        </div>
        <img src={`${import.meta.env.BASE_URL}stickers/calculator-cat.png`} alt="" aria-hidden="true" />
      </header>

      <section className="magic-card" aria-label="抗魔计算">
        <div className="magic-summary" aria-label="抗魔汇总">
          <article className="magic-metric" aria-label="当前总抗魔">
            <span>当前总抗魔</span>
            <strong aria-live="polite">{format(result.total)}</strong>
            <small>六件饰品合计</small>
          </article>
          <article className="magic-metric lavender">
            <ThemedSelect label="目标饰品" value={target} options={tierOptions} onChange={setTarget} />
            <small>掉落要求：{format(result.target.drop)}</small>
          </article>
          <article className="magic-metric peach" aria-label="目标抗魔差距" aria-live="polite">
            <span>{result.gap > 0 ? '还需抗魔' : '超出抗魔'}</span>
            <strong>{result.gap > 0 ? format(result.gap) : '✓ 已达标'}</strong>
            <small>{result.gap > 0 ? '继续提升抗魔' : `已可掉落，超出 ${format(Math.abs(result.gap))}`}</small>
          </article>
        </div>

        <div className="magic-section-heading">
          <h2><ShieldCheck size={19} />我的饰品</h2>
          <button className="magic-reset" type="button" onClick={reset}><RotateCcw size={15} />重置默认值</button>
        </div>
        <div className="magic-table-scroll" role="region" aria-label="六件饰品输入表" tabIndex={0}>
          <table className="magic-table magic-equipment-table">
            <thead><tr>
              <th scope="col">部位</th><th scope="col">基础抗魔</th><th scope="col">强化等级</th>
              <th scope="col">单件总抗魔</th><th scope="col">饰品名称</th><th scope="col">是否更换</th>
            </tr></thead>
            <tbody>{pieces.map((piece, index) => (
              <tr key={MAGIC_SLOTS[index]}>
                <th scope="row">{MAGIC_SLOTS[index]}</th>
                <td><NumberField
                  label={`${MAGIC_SLOTS[index]}基础抗魔`} value={piece.base} max={1000000000}
                  onChange={(value) => updatePiece(index, { base: nonNegativeInteger(value, 1000000000) })}
                /></td>
                <td><NumberField
                  label={`${MAGIC_SLOTS[index]}强化等级`} value={piece.level} max={MAX_MAGIC_LEVEL}
                  onChange={(value) => updatePiece(index, { level: nonNegativeInteger(value, MAX_MAGIC_LEVEL) })}
                /></td>
                <td className="magic-numeric magic-piece-total">{format(result.pieceTotals[index])}</td>
                <td>
                  <ThemedSelect
                    label={`${MAGIC_SLOTS[index]}饰品名称`}
                    value={piece.name}
                    options={tierOptions}
                    onChange={(name) => updatePiece(index, { name })}
                  />
                </td>
                <td><button
                  type="button" className={piece.replace ? 'magic-toggle selected' : 'magic-toggle'}
                  aria-label={`切换${MAGIC_SLOTS[index]}是否更换`} aria-pressed={piece.replace}
                  onClick={() => updatePiece(index, { replace: !piece.replace })}
                >{piece.replace ? <Check size={18} /> : <X size={18} />}</button></td>
              </tr>
            ))}</tbody>
            <tfoot><tr><th colSpan={3} scope="row">合计</th><td className="magic-numeric">{format(result.total)}</td><td colSpan={2} /></tr></tfoot>
          </table>
        </div>
        <p className="magic-footnote">单件总抗魔 = 基础抗魔 × (1 + 5% × 强化等级)，向上取整。名称和更换标记仅供记录，不影响计算。</p>
      </section>

      <section className="magic-card" id="magic-tiers" aria-labelledby="magic-tiers-title">
        <div className="magic-section-heading"><h2 id="magic-tiers-title">饰品掉落图鉴</h2><span className="magic-badge">10 个品级</span></div>
        <div className="magic-table-scroll" role="region" aria-label="饰品掉落门槛表" tabIndex={0}>
          <table className="magic-table magic-tier-table">
            <thead><tr><th scope="col">饰品名称</th><th scope="col">掉落抗魔</th><th scope="col">状态</th><th scope="col">参考抗魔（蓝色中值）</th></tr></thead>
            <tbody>{MAGIC_TIERS.map((tier) => {
              const isTarget = tier.name === target
              const isCurrent = tier.name === result.currentTier?.name
              const reached = result.total >= tier.drop
              const tone = isTarget ? 'target' : isCurrent ? 'current' : reached ? 'reached' : 'locked'
              const status = isTarget ? (reached ? '已达标' : `差 ${format(tier.drop - result.total)}`) : isCurrent ? '当前' : reached ? '已达成' : '未达成'
              return <tr key={tier.name} className={isTarget ? 'magic-target-row' : isCurrent ? 'magic-current-row' : ''}>
                <th scope="row">{tier.name}</th><td className="magic-numeric">{format(tier.drop)}</td>
                <td><span className={`magic-status ${tone}`}>{status}</span></td>
                <td className="magic-numeric">{tier.ref === null ? '—' : format(tier.ref)}</td>
              </tr>
            })}</tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
