import { useState } from 'react'
import { Box } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { HostingCard, hostingInputClass } from './HostingFormUi'
import type { HostingFormDraft } from './hostingFormTypes'

type Props = {
  form: HostingFormDraft
  onNameChange: (value: string) => void
  onSlugChange: (value: string) => void
  update: (patch: Partial<HostingFormDraft>) => void
}

export function HostingBasicSection({
  form,
  onNameChange,
  onSlugChange,
  update,
}: Props) {
  const { t } = useTranslation('catalog')
  const [tagDraft, setTagDraft] = useState('')
  const tags = form.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  const addTag = () => {
    const tag = tagDraft.trim()
    if (tag && !tags.includes(tag)) update({ tags: [...tags, tag].join(', ') })
    setTagDraft('')
  }

  return (
    <HostingCard icon={Box} title={t('hosting.new.basic')}>
      <div className="space-y-4">
        <div className="hosting-labeled-row">
          <label htmlFor="hosting-name">
            {t('hosting.new.name')} <span className="text-red-500">*</span>
          </label>
          <div className="relative min-w-0">
            <input
              id="hosting-name"
              required
              maxLength={100}
              className={hostingInputClass}
              value={form.name}
              onChange={(event) => onNameChange(event.target.value)}
            />
            <span className="absolute bottom-0.5 right-2 text-[10px] text-[#7182a4]">
              {form.name.length}/100
            </span>
          </div>
        </div>
        <div className="hosting-labeled-row">
          <label htmlFor="hosting-slug">
            {t('hosting.new.slug')} <span className="text-red-500">*</span>
          </label>
          <input
            id="hosting-slug"
            required
            maxLength={120}
            className={hostingInputClass}
            value={form.slug}
            onChange={(event) => onSlugChange(event.target.value)}
          />
        </div>
        <div className="hosting-labeled-row">
          <label htmlFor="hosting-description">
            {t('hosting.new.description')}{' '}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative min-w-0">
            <textarea
              id="hosting-description"
              required
              maxLength={200}
              rows={3}
              className={`${hostingInputClass} h-[110px] resize-none py-2.5 pr-3 pb-6`}
              value={form.description}
              onChange={(event) => update({ description: event.target.value })}
            />
            <span className="absolute bottom-2 right-3 text-xs text-slate-400">
              {form.description.length}/200
            </span>
          </div>
        </div>
        <div className="hosting-labeled-row">
          <label htmlFor="hosting-tags">{t('hosting.new.tags')}</label>
          <div className="min-w-0 rounded-md border border-[#d5e1f2] p-2">
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() =>
                    update({
                      tags: tags.filter((item) => item !== tag).join(', '),
                    })
                  }
                  className="rounded bg-[#e9f3ff] px-2 py-0.5 text-xs text-blue-700"
                >
                  {tag} ×
                </button>
              ))}
            </div>
            <input
              id="hosting-tags"
              className="mt-1 w-full min-w-0 border-0 bg-transparent text-sm outline-none"
              placeholder={t('hosting.new.tagsPlaceholder')}
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addTag()
                }
              }}
              onBlur={addTag}
            />
          </div>
        </div>
      </div>
      <div className="mt-5 min-w-0">
        <p className="mb-2 text-sm font-semibold text-[#11184c]">
          {t('hosting.new.content')}
        </p>
        <div className="min-w-0">
          <TiptapEditor
            content={form.content}
            onChange={(content) => update({ content })}
            placeholder={t('hosting.new.contentPlaceholder')}
          />
        </div>
      </div>
    </HostingCard>
  )
}
