import { useEffect, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { addDays, format, startOfDay } from 'date-fns'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/utils'

type DateRangeModalPickerProps = {
  value: DateRange
  onApply: (range: DateRange) => void
  label: string
  title: string
  description: string
  applyLabel: string
  cancelLabel: string
  fromLabel: string
  toLabel: string
  maxDays?: number
  className?: string
  buttonClassName?: string
}

export function DateRangeModalPicker({
  value,
  onApply,
  label,
  title,
  description,
  applyLabel,
  cancelLabel,
  fromLabel,
  toLabel,
  maxDays = 30,
  className,
  buttonClassName,
}: DateRangeModalPickerProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>(value)

  useEffect(() => {
    if (!open) setDraft(value)
  }, [open, value])

  const displayValue = value.from
    ? `${format(value.from, 'dd/MM/yyyy')} - ${format(value.to ?? value.from, 'dd/MM/yyyy')}`
    : label

  const dateInputValue = (date?: Date) =>
    date ? format(date, 'yyyy-MM-dd') : ''

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm text-[#445575]',
        className,
      )}
    >
      {label ? <span className="whitespace-nowrap">{label}</span> : null}
      <button
        type="button"
        className={cn(
          'h-10 min-w-[220px] rounded-lg border border-[#dfe7f1] px-4 py-2 text-left text-xs text-[#536581]',
          buttonClassName,
        )}
        onClick={() => setOpen(true)}
      >
        {displayValue}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-[#e3e9f2] bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#253555] dark:text-slate-100">
                  {title}
                </h3>
                <p className="mt-1 text-xs text-[#7585a0]">{description}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xl text-[#7585a0]"
              >
                ×
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-xs font-medium text-[#536581]">
                <span>{fromLabel}</span>
                <input
                  type="date"
                  value={dateInputValue(draft?.from)}
                  onChange={(event) => {
                    const next = startOfDay(
                      new Date(`${event.target.value}T00:00:00`),
                    )
                    setDraft({
                      from: next,
                      to:
                        !draft?.to ||
                        draft.to < next ||
                        draft.to > addDays(next, maxDays - 1)
                          ? addDays(next, 6)
                          : draft.to,
                    })
                  }}
                  className="h-10 w-full rounded-lg border border-[#dfe7f1] bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
              <label className="space-y-2 text-xs font-medium text-[#536581]">
                <span>{toLabel}</span>
                <input
                  type="date"
                  min={dateInputValue(draft?.from)}
                  max={
                    draft?.from
                      ? dateInputValue(addDays(draft.from, maxDays - 1))
                      : undefined
                  }
                  value={dateInputValue(draft?.to)}
                  onChange={(event) =>
                    setDraft((current) => ({
                      from: current?.from,
                      to: startOfDay(
                        new Date(`${event.target.value}T00:00:00`),
                      ),
                    }))
                  }
                  className="h-10 w-full rounded-lg border border-[#dfe7f1] bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outlineSecondary"
                onClick={() => setOpen(false)}
              >
                {cancelLabel}
              </Button>
              <Button
                type="button"
                className="bg-[#1769e8]"
                disabled={!draft?.from || !draft.to}
                onClick={() => {
                  if (!draft?.from || !draft.to) return
                  onApply(draft)
                  setOpen(false)
                }}
              >
                {applyLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
