import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { Panel } from '@/components/common/Panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/utils/toast'
import {
  useMediaSettings,
  useUpdateMediaSettings,
} from '../hooks/useMediaSettings'
import type { MediaSettings, MediaStorageMode } from '../types'

const emptySettings: MediaSettings = {
  storageMode: 'SOURCE',
  endpoint: '',
  bucket: '',
  region: '',
  accessKeyId: '',
  secretAccessKey: '',
  forcePathStyle: true,
  maxUploadSizeMb: 10,
}

export function MediaSettingsTab() {
  const { t } = useTranslation('media')
  const settingsQuery = useMediaSettings()
  const updateSettings = useUpdateMediaSettings()
  const form = useForm({
    defaultValues: emptySettings,
    onSubmit: async ({ value }) => {
      try {
        await updateSettings.mutateAsync(value)
        toast.success(t('settings.saved'))
      } catch (error) {
        toast.apiError(error, t('settings.saveFailed'))
      }
    },
  })

  useEffect(() => {
    if (settingsQuery.data) form.reset(settingsQuery.data)
  }, [form, settingsQuery.data])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <Panel className="max-w-3xl space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {(['SOURCE', 'S3'] as MediaStorageMode[]).map((mode) => (
            <form.Field key={mode} name="storageMode">
              {(field) => (
                <button
                  type="button"
                  onClick={() => field.handleChange(mode)}
                  className={`rounded-xl border p-4 text-left transition-colors ${field.state.value === mode ? 'border-primary bg-primary-50/60 dark:bg-primary/10' : 'border-slate-200 hover:border-primary/50 dark:border-slate-700'}`}
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {t(`settings.modes.${mode.toLowerCase()}.title`)}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {t(`settings.modes.${mode.toLowerCase()}.description`)}
                  </div>
                </button>
              )}
            </form.Field>
          ))}
        </div>
        <form.Subscribe selector={(state) => state.values.storageMode}>
          {(storageMode) =>
            storageMode === 'S3' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    'endpoint',
                    'bucket',
                    'region',
                    'accessKeyId',
                    'secretAccessKey',
                  ] as const
                ).map((field) => (
                  <div className="space-y-1.5" key={field}>
                    <Label htmlFor={`media-${field}`}>
                      {t(`settings.fields.${field}`)}
                    </Label>
                    <form.Field name={field}>
                      {(formField) => (
                        <Input
                          id={`media-${field}`}
                          type={
                            field === 'secretAccessKey' ? 'password' : 'text'
                          }
                          value={formField.state.value}
                          onChange={(event) =>
                            formField.handleChange(event.target.value)
                          }
                        />
                      )}
                    </form.Field>
                  </div>
                ))}
                <label className="flex items-center gap-3 self-end pb-2 text-sm text-slate-700 dark:text-slate-200">
                  <form.Field name="forcePathStyle">
                    {(field) => (
                      <Switch
                        checked={field.state.value}
                        onCheckedChange={field.handleChange}
                      />
                    )}
                  </form.Field>
                  {t('settings.fields.forcePathStyle')}
                </label>
              </div>
            ) : null
          }
        </form.Subscribe>
        <div className="max-w-sm space-y-1.5">
          <Label htmlFor="media-max-upload-size">
            {t('settings.fields.maxUploadSizeMb')}
          </Label>
          <form.Field name="maxUploadSizeMb">
            {(field) => (
              <Input
                id="media-max-upload-size"
                type="number"
                min={1}
                max={10240}
                value={field.state.value}
                onChange={(event) =>
                  field.handleChange(Number(event.target.value))
                }
              />
            )}
          </form.Field>
          <p className="text-xs text-slate-500">
            {t('settings.fields.maxUploadSizeHelp')}
          </p>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending
              ? t('settings.saving')
              : t('settings.save')}
          </Button>
        </div>
      </Panel>
    </form>
  )
}
