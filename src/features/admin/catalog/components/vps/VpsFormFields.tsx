import type { ReactNode } from 'react'

export const vpsInputClass =
  'h-[30px] w-full rounded-[5px] border border-slate-200 bg-white px-2.5 text-xs text-[#18254b] outline-none focus:border-blue-500'

export function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block min-w-0 space-y-1">
      <span className="text-xs font-medium text-[#101945]">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  )
}

export function Section({
  number,
  title,
  children,
  className = '',
}: {
  number: number
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`vps-create-section ${className}`}>
      <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#101945]">
        <span className="flex size-[23px] items-center justify-center rounded-full bg-blue-600 text-xs text-white">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

export function NumberControl({
  value,
  onChange,
  unit,
  min = 0,
  buttons = false,
}: {
  value: string
  onChange: (value: string) => void
  unit?: string
  min?: number
  buttons?: boolean
}) {
  const step = (delta: number) =>
    onChange(String(Math.max(min, (Number(value) || 0) + delta)))
  return (
    <div className="flex h-[30px] overflow-hidden rounded-[5px] border border-[#d6e2f6] text-xs">
      {buttons && (
        <button
          type="button"
          onClick={() => step(-1)}
          className="w-8 shrink-0 border-r bg-[#f4f8fe] text-[#53688b]"
        >
          −
        </button>
      )}
      <input
        type="number"
        min={min}
        className="min-w-0 flex-1 border-0 bg-white px-2.5 text-center outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {buttons && !unit && (
        <button
          type="button"
          onClick={() => step(1)}
          className="w-8 shrink-0 border-l bg-[#f4f8fe] text-[#53688b]"
        >
          +
        </button>
      )}
      {unit && (
        <span className="flex min-w-12 items-center justify-center border-l bg-[#f4f8fe] px-2 text-[#53688b]">
          {unit}
        </span>
      )}
    </div>
  )
}
