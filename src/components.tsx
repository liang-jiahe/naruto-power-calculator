import { PawPrint } from 'lucide-react'
import type { ReactNode } from 'react'
import type { FormulaSpec } from './domain/formulas'
import type { AttributeStats, CoreStats, ElementKey, ElementStats, PowerBreakdown } from './domain/types'

export const formatNumber = (value: number, digits = 2) =>
  new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0)

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  suffix,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-shell">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value)
            onChange(Number.isFinite(next) ? Math.min(max ?? Infinity, Math.max(min, next)) : min)
          }}
        />
        {suffix && <b>{suffix}</b>}
      </div>
    </label>
  )
}

export function CoreEditor({
  value,
  onChange,
}: {
  value: CoreStats
  onChange: (key: keyof CoreStats, value: number) => void
}) {
  return (
    <div className="field-grid three">
      <NumberField label="生命" value={value.hp} onChange={(next) => onChange('hp', next)} />
      <NumberField label="攻击" value={value.atk} onChange={(next) => onChange('atk', next)} />
      <NumberField label="防御" value={value.def} onChange={(next) => onChange('def', next)} />
    </div>
  )
}

const elementLabels: Record<ElementKey, string> = {
  fire: '火',
  water: '水',
  wind: '风',
  thunder: '雷',
  earth: '土',
}

export function ElementEditor({
  title,
  value,
  onChange,
}: {
  title: string
  value: ElementStats
  onChange: (key: ElementKey, value: number) => void
}) {
  return (
    <div className="element-editor">
      <div className="subheading">{title}</div>
      <div className="field-grid five">
        {(Object.keys(elementLabels) as ElementKey[]).map((key) => (
          <NumberField key={key} label={elementLabels[key]} value={value[key]} onChange={(next) => onChange(key, next)} />
        ))}
      </div>
    </div>
  )
}

export function AttributeEditor({
  value,
  onCore,
  onSpecial,
  onElement,
  elements = true,
}: {
  value: AttributeStats
  onCore: (key: keyof CoreStats, value: number) => void
  onSpecial: (key: 'crit' | 'antiCrit', value: number) => void
  onElement: (group: 'elementAtk' | 'elementDef', key: ElementKey, value: number) => void
  elements?: boolean
}) {
  return (
    <>
      <CoreEditor value={value} onChange={onCore} />
      <div className="field-grid two">
        <NumberField label="暴击" value={value.crit} onChange={(next) => onSpecial('crit', next)} />
        <NumberField label="抗暴" value={value.antiCrit} onChange={(next) => onSpecial('antiCrit', next)} />
      </div>
      {elements && (
        <>
          <ElementEditor title="五行攻击" value={value.elementAtk} onChange={(key, next) => onElement('elementAtk', key, next)} />
          <ElementEditor title="五行防御" value={value.elementDef} onChange={(key, next) => onElement('elementDef', key, next)} />
        </>
      )}
    </>
  )
}

export function SectionCard({
  id,
  eyebrow,
  title,
  description,
  value,
  formula,
  tone = 'orange',
  children,
}: {
  id: string
  eyebrow: string
  title: string
  description: string
  value: number
  formula?: FormulaSpec
  tone?: 'orange' | 'blue' | 'purple' | 'green'
  children: ReactNode
}) {
  return (
    <section id={id} className={`section-card tone-${tone}`}>
      <header className="section-head">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="section-total">
          <span>当前战力</span>
          <strong>{formatNumber(value)}</strong>
        </div>
      </header>
      <div className="section-body">
        {formula && <FormulaCard formula={formula} />}
        {children}
      </div>
    </section>
  )
}

export function FormulaCard({ formula, compact = false }: { formula: FormulaSpec; compact?: boolean }) {
  return (
    <aside
      className={compact ? 'formula-card compact' : 'formula-card'}
      aria-label={`${formula.title}计算公式`}
      title={formula.note}
    >
      <span className="formula-inline-label"><PawPrint size={14} />计算公式：</span>
      <span className="formula-inline-expression">{formula.lines.join('；')}</span>
    </aside>
  )
}

export function BreakdownStrip({ data }: { data: PowerBreakdown }) {
  const items = [
    ['生命', data.hp],
    ['攻击', data.atk],
    ['防御', data.def],
    ['暴击', data.crit],
    ['抗暴', data.antiCrit],
    ['元素攻', data.elementAtk],
    ['元素防', data.elementDef],
    ['直接战力', data.direct],
  ] as const
  return (
    <div className="breakdown-strip">
      {items
        .filter(([, value]) => value > 0)
        .map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <b>{formatNumber(value)}</b>
          </div>
        ))}
      {items.every(([, value]) => value === 0) && <div className="empty-inline">输入属性后显示分项战力</div>}
    </div>
  )
}

export function ModeSwitch({
  value,
  onChange,
}: {
  value: 'direct' | 'calculated'
  onChange: (value: 'direct' | 'calculated') => void
}) {
  return (
    <div className="mode-switch" aria-label="计算模式">
      <button className={value === 'direct' ? 'active' : ''} onClick={() => onChange('direct')} type="button">
        直接战力
      </button>
      <button className={value === 'calculated' ? 'active' : ''} onClick={() => onChange('calculated')} type="button">
        属性计算
      </button>
    </div>
  )
}
