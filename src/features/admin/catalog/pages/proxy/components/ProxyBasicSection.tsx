import { Box } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { ProxyCard, ProxyField, proxyInputClass } from './ProxyFormUi'
import type { ProxyFormDraft } from './proxyFormTypes'

export function ProxyBasicSection({
  form,
  update,
  onNameChange,
  onSlugChange,
}: {
  form: ProxyFormDraft
  update: (patch: Partial<ProxyFormDraft>) => void
  onNameChange: (name: string) => void
  onSlugChange: (slug: string) => void
}) {
  const { t } = useTranslation('catalog')
  return (
    <ProxyCard icon={Box} title={t('proxy.new.basic')}>
      <div className="grid gap-5 md:grid-cols-2">
        <ProxyField name="name" label={t('proxy.new.name')} required>
          <input
            id="name"
            name="name"
            required
            maxLength={120}
            className={proxyInputClass}
            value={form.name}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </ProxyField>
        <ProxyField name="slug" label={t('proxy.new.slug')} required>
          <input
            id="slug"
            name="slug"
            required
            maxLength={120}
            className={proxyInputClass}
            value={form.slug}
            onChange={(event) => onSlugChange(event.target.value)}
          />
        </ProxyField>
        <div className="min-w-0 md:col-span-2">
          <ProxyField
            name="description"
            label={t('proxy.new.description')}
            required
          >
            <textarea
              id="description"
              name="description"
              required
              maxLength={200}
              rows={5}
              className={`${proxyInputClass} h-28 py-2`}
              value={form.description}
              onChange={(event) => update({ description: event.target.value })}
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {form.description.length}/200
            </p>
          </ProxyField>
        </div>
        <div className="min-w-0 md:col-span-2">
          <p className="mb-2 text-sm font-semibold text-[#11184c]">
            {t('proxy.new.content')}
          </p>
          <TiptapEditor
            content={form.content}
            onChange={(content) => update({ content })}
            placeholder={t('proxy.new.contentPlaceholder')}
          />
        </div>
      </div>
    </ProxyCard>
  )
}
