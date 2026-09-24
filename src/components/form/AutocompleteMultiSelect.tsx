import { Badge } from '@/components/ui/badge'
import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Check, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

export type AutocompleteMultiSelectOption = {
  value: string
  label: string
  description?: string
}

interface AutocompleteMultiSelectProps {
  label: string
  description?: string
  placeholder?: string
  emptyText?: string
  removeLabel?: (option: AutocompleteMultiSelectOption) => string
  options: AutocompleteMultiSelectOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  debounceMs?: number
  groupClassName?: string
  labelClassName?: string
}

export function AutocompleteMultiSelect({
  label,
  description,
  placeholder = 'Search...',
  emptyText = 'No options found',
  removeLabel = (option) => `Remove ${option.label}`,
  options,
  selectedValues,
  onChange,
  debounceMs = 350,
  groupClassName,
  labelClassName,
}: AutocompleteMultiSelectProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedSearch(search),
      debounceMs,
    )
    return () => window.clearTimeout(timeoutId)
  }, [debounceMs, search])

  const selectedOptions = useMemo(
    () =>
      selectedValues
        .map((value) => options.find((option) => option.value === value))
        .filter((option): option is AutocompleteMultiSelectOption =>
          Boolean(option),
        ),
    [options, selectedValues],
  )
  const filteredOptions = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    if (!query) return options
    return options.filter((option) =>
      [option.label, option.description]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    )
  }, [debouncedSearch, options])

  const toggleOption = (value: string) => {
    onChange(
      selectedValues.includes(value)
        ? selectedValues.filter((selectedValue) => selectedValue !== value)
        : [...selectedValues, value],
    )
    setSearch('')
  }

  return (
    <Field className={`gap-1.5 ${groupClassName ?? ''}`}>
      <FieldLabel className={labelClassName}>{label}</FieldLabel>
      <FieldContent>
        <div className="relative">
          <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 shadow-[0_1px_0_rgba(15,23,42,0.02)] focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-300 dark:border-slate-800 dark:bg-slate-950">
            {selectedOptions.map((option) => (
              <Badge
                key={option.value}
                variant="lightPrimary"
                className="gap-1 rounded-md py-1 pr-1"
              >
                {option.label}
                <button
                  type="button"
                  className="rounded p-0.5 hover:bg-primary/10"
                  aria-label={removeLabel(option)}
                  onClick={() =>
                    onChange(
                      selectedValues.filter((value) => value !== option.value),
                    )
                  }
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
            <div className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
                placeholder={placeholder}
                className="h-7 border-0 bg-transparent pr-2 pl-6 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
          {isFocused ? (
            <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
              {filteredOptions.length ? (
                filteredOptions.map((option) => {
                  const selected = selectedValues.includes(option.value)
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => toggleOption(option.value)}
                      className="flex w-full items-center gap-3 border-b border-slate-100 p-3 text-left last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                    >
                      <span
                        className={`flex size-5 items-center justify-center rounded border ${selected ? 'border-primary bg-primary text-white' : 'border-slate-300 text-transparent'}`}
                      >
                        <Check className="size-3" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-slate-950 dark:text-slate-50">
                          {option.label}
                        </span>
                        {option.description ? (
                          <span className="block text-xs text-slate-500 dark:text-slate-400">
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  )
                })
              ) : (
                <div className="px-3 py-8 text-center text-sm text-slate-500">
                  {emptyText}
                </div>
              )}
            </div>
          ) : null}
        </div>
        {description ? (
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        ) : null}
      </FieldContent>
    </Field>
  )
}
