import * as React from 'react'
import { Field, FieldContent, FieldLabel } from '@/components/ui/field'

export interface ConditionValueFieldOption {
  value: string
  label: React.ReactNode
}

export interface ConditionValueFieldProps {
  label: string
  mode: 'tags' | 'chips'
  tags: string[]
  text?: string
  placeholder?: string
  options?: ConditionValueFieldOption[]
  onTextChange?: (value: string) => void
  onAddTag?: (value: string) => void
  onRemoveTag?: (value: string) => void
  onSelectOption?: (value: string) => void
}

export function ConditionValueField({
  label,
  mode,
  tags,
  text,
  placeholder,
  options = [],
  onTextChange,
  onAddTag,
  onRemoveTag,
  onSelectOption,
}: ConditionValueFieldProps) {
  return (
    <Field className="gap-3">
      <FieldLabel className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </FieldLabel>
      <FieldContent>
        <div className="min-h-12 rounded-lg border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950">
          {mode === 'tags' ? (
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onRemoveTag?.(tag)}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {tag}
                  <span className="text-slate-400">×</span>
                </button>
              ))}
              <input
                value={text}
                onChange={(event) => onTextChange?.(event.target.value)}
                onBlur={(event) => {
                  const next = event.target.value.trim()
                  if (next) onAddTag?.(next)
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return
                  event.preventDefault()
                  const next = text?.trim()
                  if (next) onAddTag?.(next)
                }}
                placeholder={placeholder}
                className="min-w-36 flex-1 border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const active = tags.includes(option.value)
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onSelectOption?.(option.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${active ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </FieldContent>
    </Field>
  )
}
