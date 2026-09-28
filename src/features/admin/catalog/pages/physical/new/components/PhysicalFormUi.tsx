import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export const physicalInputClass =
  'h-10 w-full min-w-0 rounded-md border border-[#d5e1f2] bg-white px-3 text-sm text-[#11184c] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

export function PhysicalCard({
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

export function PhysicalField({
  label,
  name,
  required,
  children,
}: {
  label: string
  name: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold text-[#11184c]"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}
