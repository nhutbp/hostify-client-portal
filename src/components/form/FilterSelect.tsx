import type { SelectHTMLAttributes } from 'react'

type FilterSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: Array<string | { value: string; label: string }>
}

export function FilterSelect({
  label,
  options,
  className,
  ...props
}: FilterSelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-[#445575]">
      <span className="whitespace-nowrap">{label}</span>
      <span className="relative inline-block shrink-0">
        <select
          {...props}
          className={`h-10 w-[160px] appearance-none rounded-lg border border-[#dfe6f0] bg-white px-3 pr-11 text-sm text-[#253555] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className ?? ''}`}
        >
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value
            const optionLabel =
              typeof option === 'string' ? option : option.label
            return (
              <option key={value} value={value}>
                {optionLabel}
              </option>
            )
          })}
        </select>
      </span>
    </label>
  )
}
