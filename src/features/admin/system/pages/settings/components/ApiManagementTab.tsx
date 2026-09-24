import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { Check, Copy, KeyRound, Plus, ShieldAlert, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/form/InputField'
import {
  useCreateApiKey,
  useApiKeys,
  useRevokeApiKey,
} from '../../../hooks/useApiKeys'

export function ApiManagementTab() {
  const { t } = useTranslation('system')
  const keys = useApiKeys()
  const create = useCreateApiKey()
  const revoke = useRevokeApiKey()
  const [createdSecret, setCreatedSecret] = useState('')
  const [copied, setCopied] = useState(false)
  const endpoint =
    typeof window === 'undefined' ? '' : `${window.location.origin}/api/v1`
  const curl = createdSecret
    ? `curl --request GET '${endpoint}' --header 'x-api-key: ${createdSecret}'`
    : ''

  const form = useForm({
    defaultValues: { name: '', expiresAt: '' },
    onSubmit: async ({ value }) => {
      const result = await create.mutateAsync({
        name: value.name,
        expiresAt: value.expiresAt || undefined,
      })
      setCreatedSecret(result.secret)
      form.reset()
    },
  })

  const copyCurl = async () => {
    await navigator.clipboard.writeText(curl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-5 flex items-start gap-3">
          <KeyRound className="mt-0.5 h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">
              {t('api.title')}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              {t('api.description')}
            </p>
          </div>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
          className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                value.trim() ? undefined : t('api.name'),
            }}
          >
            {(field) => (
              <InputField
                label={t('api.name')}
                required
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder={t('api.namePlaceholder')}
                size="sm"
              />
            )}
          </form.Field>
          <form.Field name="expiresAt">
            {(field) => (
              <InputField
                label={t('api.expiresAt')}
                type="date"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                size="sm"
              />
            )}
          </form.Field>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || create.isPending}
                size="sm"
              >
                <Plus className="h-4 w-4" />
                {t('api.create')}
              </Button>
            )}
          </form.Subscribe>
        </form>
        {createdSecret && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
            <div className="flex gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
              <ShieldAlert className="h-4 w-4" />
              {t('api.secretOnce')}
            </div>
            <code className="mt-3 block overflow-x-auto rounded bg-white p-3 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              {curl}
            </code>
            <Button
              type="button"
              variant="outlineSecondary"
              size="sm"
              className="mt-3"
              onClick={copyCurl}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? t('api.copied') : t('api.copyCurl')}
            </Button>
          </div>
        )}
      </section>
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">
            {t('api.listTitle')}
          </h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {(keys.data ?? []).map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-slate-100">
                  {item.name}
                </p>
                <code className="text-xs text-gray-500">
                  {item.keyPrefix}••••••••
                </code>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>
                  {item.expiresAt
                    ? `${t('api.expiresAt')}: ${item.expiresAt}`
                    : t('api.neverExpires')}
                </span>
                {item.revokedAt ? (
                  <span className="text-red-500">{t('api.revoked')}</span>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => revoke.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('api.revoke')}
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!keys.isLoading && !keys.data?.length && (
            <p className="px-5 py-8 text-center text-sm text-gray-500">
              {t('api.empty')}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
