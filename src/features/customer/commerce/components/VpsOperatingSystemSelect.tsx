import { MonitorCog } from 'lucide-react'

type Props = {
  value?: string
  options: string[]
  disabled?: boolean
  onChange: (value: string) => void
}

export function VpsOperatingSystemSelect({
  value,
  options,
  disabled,
  onChange,
}: Props) {
  return (
    <label className="block min-w-0 text-sm font-semibold text-slate-700">
      <span className="mb-1 flex items-center gap-1.5">
        <MonitorCog size={15} className="text-violet-600" /> Hệ điều hành
      </span>
      <select
        className="h-10 w-full rounded-lg border border-violet-200 bg-violet-50/60 px-3 font-normal text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:opacity-60"
        value={value ?? ''}
        disabled={disabled || options.length === 0}
        onChange={(event) => onChange(event.target.value)}
      >
        {!value && <option value="">Chọn hệ điều hành</option>}
        {options.map((system) => (
          <option key={system} value={system}>
            {system}
          </option>
        ))}
      </select>
    </label>
  )
}
