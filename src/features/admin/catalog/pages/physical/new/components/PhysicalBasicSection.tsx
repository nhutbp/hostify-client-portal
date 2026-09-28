import { Server } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import {
  PhysicalCard,
  PhysicalField,
  physicalInputClass,
} from './PhysicalFormUi'
import type { PhysicalFormDraft } from './physicalFormTypes'

export function PhysicalBasicSection({
  form,
  update,
  onNameChange,
  onSlugChange,
}: {
  form: PhysicalFormDraft
  update: (patch: Partial<PhysicalFormDraft>) => void
  onNameChange: (value: string) => void
  onSlugChange: (value: string) => void
}) {
  const { t } = useTranslation('catalog')
  return (
    <PhysicalCard icon={Server} title={t('physical.new.basic')}>
      <div className="grid gap-4 md:grid-cols-2">
        <PhysicalField name="name" label={t('physical.new.name')} required>
          <input
            id="name"
            name="name"
            required
            maxLength={120}
            className={physicalInputClass}
            value={form.name}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </PhysicalField>
        <PhysicalField name="slug" label={t('physical.new.slug')} required>
          <input
            id="slug"
            name="slug"
            required
            maxLength={120}
            className={physicalInputClass}
            value={form.slug}
            onChange={(event) => onSlugChange(event.target.value)}
          />
        </PhysicalField>
        <div className="md:col-span-2">
          <PhysicalField
            name="description"
            label={t('physical.new.description')}
            required
          >
            <textarea
              id="description"
              name="description"
              required
              maxLength={200}
              rows={3}
              className={`${physicalInputClass} h-24 py-2`}
              value={form.description}
              onChange={(event) => update({ description: event.target.value })}
            />
          </PhysicalField>
          <p className="mt-1 text-right text-xs text-slate-400">
            {form.description.length}/200
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="mb-2 text-sm font-semibold text-[#11184c]">
            {t('physical.new.content')}
          </p>
          <div className="min-w-0">
            <TiptapEditor
              content={form.content}
              onChange={(content) => update({ content })}
              placeholder={t('physical.new.contentPlaceholder')}
            />
          </div>
        </div>
      </div>
    </PhysicalCard>
  )
}
