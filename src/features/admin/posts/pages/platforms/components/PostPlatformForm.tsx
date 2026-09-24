import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/utils/toast'
import { slugify } from '@/utils/utils'
import { postQueryKeys } from '../../../hooks/usePosts'
import { postService } from '../../../services/postService'
import type { PostPlatform } from './data'

export function PostPlatformForm({ editingPlatform, onDone, onCancel }: { editingPlatform?: PostPlatform | null; onDone?: () => void; onCancel?: () => void }) {
  const { t } = useTranslation('posts')
  const queryClient = useQueryClient()
  const [isSlugEdited, setIsSlugEdited] = useState(false)
  const editing = Boolean(editingPlatform)
  const form = useForm({
    defaultValues: { name: '', slug: '', description: '' },
    onSubmit: async ({ value }) => {
      try {
        const input = { name: value.name.trim(), slug: value.slug || undefined, description: value.description || undefined }
        if (editingPlatform) await postService.updatePlatform({ ...input, id: editingPlatform.id })
        else await postService.createPlatform(input)
        await queryClient.invalidateQueries({ queryKey: postQueryKeys.platforms() })
        form.reset(); setIsSlugEdited(false); onDone?.(); toast.success(t('platformSaved'))
      } catch (error) { toast.apiError(error, t('saveFailed')) }
    },
  })
  useEffect(() => {
    form.reset({ name: editingPlatform?.name ?? '', slug: editingPlatform?.slug ?? '', description: editingPlatform?.description ?? '' })
    setIsSlugEdited(Boolean(editingPlatform))
  }, [editingPlatform, form])
  return (
    <form onSubmit={(event) => { event.preventDefault(); void form.handleSubmit() }} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{editing ? t('editPlatform') : t('newPlatform')}</h2>
      <div className="mt-5 space-y-4">
        <Field label={t('platformName')}><form.Field name="name" validators={{ onChange: ({ value }) => value.trim() ? undefined : t('platformName') }}>{(field) => <Input required value={field.state.value} onBlur={field.handleBlur} onChange={(event) => { const value = event.target.value; field.handleChange(value); if (!isSlugEdited) form.setFieldValue('slug', slugify(value)) }} placeholder={t('platformName')} />}</form.Field></Field>
        <Field label="Slug"><form.Field name="slug">{(field) => <Input value={field.state.value} onBlur={field.handleBlur} onChange={(event) => { setIsSlugEdited(true); field.handleChange(slugify(event.target.value)) }} placeholder={t('slugPlaceholder')} />}</form.Field></Field>
        <Field label={t('description')}><form.Field name="description">{(field) => <Textarea value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} placeholder={t('descriptionPlaceholder')} className="min-h-24" />}</form.Field></Field>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>{([canSubmit, isSubmitting]) => <Button type="submit" disabled={!canSubmit || isSubmitting} className="w-full">{editing ? t('saveChanges') : t('newPlatform')}</Button>}</form.Subscribe>
        {editing && <Button type="button" variant="outline" className="w-full" onClick={onCancel}>{t('cancel')}</Button>}
      </div>
    </form>
  )
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block space-y-1.5 text-sm"><span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>{children}</label> }
