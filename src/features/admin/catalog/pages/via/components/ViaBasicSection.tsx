import { Box } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { ViaCard, ViaField, viaInputClass } from './ViaFormUi'
import type { ViaFormDraft } from './viaFormTypes'

export function ViaBasicSection({
  form,
  update,
  onNameChange,
  onSlugChange,
}: {
  form: ViaFormDraft
  update: (patch: Partial<ViaFormDraft>) => void
  onNameChange: (value: string) => void
  onSlugChange: (value: string) => void
}) {
  const { t } = useTranslation('catalog')
  return (
    <ViaCard icon={Box} title={t('via.new.basic')}>
      <div className="grid gap-5 md:grid-cols-2">
        <ViaField name="name" label={t('via.new.name')} required>
          <input
            id="name"
            name="name"
            required
            maxLength={120}
            className={viaInputClass}
            value={form.name}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </ViaField>
        <ViaField name="slug" label={t('via.new.slug')} required>
          <input
            id="slug"
            name="slug"
            required
            maxLength={120}
            className={viaInputClass}
            value={form.slug}
            onChange={(event) => onSlugChange(event.target.value)}
          />
        </ViaField>
        <div className="min-w-0 md:col-span-2">
          <ViaField
            name="description"
            label={t('via.new.description')}
            required
          >
            <textarea
              id="description"
              name="description"
              required
              maxLength={200}
              rows={5}
              className={`${viaInputClass} h-28 py-2`}
              value={form.description}
              onChange={(event) => update({ description: event.target.value })}
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {form.description.length}/200
            </p>
          </ViaField>
        </div>
        <div className="min-w-0 md:col-span-2">
          <p className="mb-2 text-sm font-semibold text-[#11184c]">
            {t('via.new.content')}
          </p>
          <TiptapEditor
            content={form.content}
            onChange={(content) => update({ content })}
            placeholder={t('via.new.contentPlaceholder')}
          />
        </div>
      </div>
    </ViaCard>
  )
}
