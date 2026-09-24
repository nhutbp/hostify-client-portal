import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

export type AccordionItem = {
  id: string
  title: ReactNode
  content: ReactNode
}

type AccordionProps = {
  items: AccordionItem[]
  defaultOpenId?: string
  className?: string
}

export function Accordion({
  items,
  defaultOpenId,
  className = '',
}: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null)

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-lg border border-[#e8eeea]"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left text-xs font-semibold text-[#3d4740]"
            >
              <span>{item.title}</span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-[#68716c] transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="border-t border-[#edf0ee] px-3.5 py-3 text-xs leading-5 text-[#68716c]">
                {item.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
