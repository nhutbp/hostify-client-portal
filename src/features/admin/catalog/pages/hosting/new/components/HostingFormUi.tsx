import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export const hostingInputClass =
  'h-10 w-full min-w-0 rounded-md border border-[#d5e1f2] bg-white px-3 text-sm text-[#11184c] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

export function HostingCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <section className="min-w-0 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h2 className="mb-5 flex items-center gap-3 text-lg font-bold text-[#11184c]">
        <span className="flex size-7 items-center justify-center rounded-md bg-blue-600 text-white">
          <Icon className="size-4" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

export function HostingField({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-sm font-semibold text-[#11184c]">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-[#6a7d9f]">{hint}</span>
      )}
    </label>
  )
}
