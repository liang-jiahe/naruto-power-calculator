import { Check, ChevronsUpDown, PawPrint } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

export type ThemedSelectOption<T extends string | number> = {
  value: T
  label: string
  hint?: string
}

export function ThemedSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: ThemedSelectOption<T>[]
  onChange: (value: T) => void
}) {
  const [open, setOpen] = useState(false)
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const labelId = useId()
  const listboxId = useId()
  const selected = options[selectedIndex]

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [open])

  const commit = (index: number) => {
    const option = options[index]
    if (!option) return
    onChange(option.value)
    setHighlightedIndex(index)
    setOpen(false)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const move = (direction: 1 | -1) => {
    setOpen(true)
    setHighlightedIndex((current) => {
      const start = open ? current : selectedIndex
      return (start + direction + options.length) % options.length
    })
  }

  return (
    <div className="field themed-select-field">
      <span id={labelId}>{label}</span>
      <div className={open ? 'themed-select open' : 'themed-select'} ref={rootRef}>
        <button
          ref={triggerRef}
          type="button"
          className="themed-select-trigger"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-labelledby={labelId}
          onClick={() => setOpen((current) => {
            if (!current) setHighlightedIndex(selectedIndex)
            return !current
          })}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              move(1)
            } else if (event.key === 'ArrowUp') {
              event.preventDefault()
              move(-1)
            } else if (event.key === 'Home') {
              event.preventDefault()
              setOpen(true)
              setHighlightedIndex(0)
            } else if (event.key === 'End') {
              event.preventDefault()
              setOpen(true)
              setHighlightedIndex(options.length - 1)
            } else if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              if (open) commit(highlightedIndex)
              else {
                setHighlightedIndex(selectedIndex)
                setOpen(true)
              }
            } else if (event.key === 'Escape') {
              event.preventDefault()
              setOpen(false)
            } else if (event.key === 'Tab') {
              setOpen(false)
            }
          }}
        >
          <span className="themed-select-value">
            <PawPrint size={15} aria-hidden="true" />
            <span>{selected?.label}</span>
          </span>
          <ChevronsUpDown size={16} aria-hidden="true" />
        </button>

        {open && (
          <div className="themed-select-popover" id={listboxId} role="listbox" aria-labelledby={labelId}>
            <div className="select-cat-ears" aria-hidden="true"><i /><i /></div>
            {options.map((option, index) => {
              const active = index === highlightedIndex
              const checked = option.value === value
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={checked}
                  className={active ? 'themed-option active' : 'themed-option'}
                  key={String(option.value)}
                  onPointerEnter={() => setHighlightedIndex(index)}
                  onClick={() => commit(index)}
                >
                  <span className="option-paw"><PawPrint size={14} aria-hidden="true" /></span>
                  <span><b>{option.label}</b>{option.hint && <small>{option.hint}</small>}</span>
                  {checked && <Check className="option-check" size={17} aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
