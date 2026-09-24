import { Edit3, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { detailPanel, formatUserDate } from './detailShared'
import type { AdminUserDetail } from '../../../types'
import { Button } from '@/components/ui/button'

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-2 sm:grid-cols-[140px_1fr]">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-800 dark:text-slate-100">
        {value || '—'}
      </dd>
    </div>
  )
}

export function UserOverview({
  user,
  locale,
  onEdit,
  canUpdate,
}: {
  user: AdminUserDetail
  locale: string
  onEdit: () => void
  canUpdate: boolean
}) {
  const { t } = useTranslation('adminUsers')
  const address = user.addresses.length
    ? (user.addresses.find((item) => item.isDefault) ?? user.addresses[0])
    : null
  return (
    <div className="space-y-4">
      <section className={`${detailPanel} p-5`}>
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h2 className="font-bold uppercase">{t('detail.personalInfo')}</h2>
          {canUpdate && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit3 className="mr-2 size-4" />
              {t('detail.editInfo')}
            </Button>
          )}
        </div>
        <dl className="grid gap-x-10 md:grid-cols-2">
          <div>
            <InfoRow
              label={t('editor.fields.displayName')}
              value={user.displayName}
            />
            <InfoRow label={t('detail.login')} value={user.login} />
            <InfoRow label={t('editor.fields.email')} value={user.email} />
            <InfoRow label={t('editor.fields.phone')} value={user.phone} />
          </div>
          <div>
            <InfoRow
              label={t('editor.fields.gender')}
              value={t(`editor.genders.${user.gender}`)}
            />
            <InfoRow
              label={t('editor.fields.birthDate')}
              value={formatUserDate(user.birthDate, locale)}
            />
            <InfoRow
              label={t('editor.createdAt')}
              value={formatUserDate(user.createdAt, locale)}
            />
            <InfoRow
              label={t('editor.updatedAt')}
              value={formatUserDate(user.updatedAt, locale, true)}
            />
          </div>
        </dl>
      </section>
      <section className={`${detailPanel} p-5`}>
        <h2 className="mb-4 flex items-center gap-2 font-bold uppercase">
          <MapPin className="size-5 text-emerald-700" />
          {t('detail.defaultAddress')}
        </h2>
        {address ? (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <strong>{address.label}</strong>
              {address.isDefault && (
                <span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                  {t('detail.default')}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {[
                address.addressLine,
                address.wardName,
                address.districtName,
                address.provinceName,
              ]
                .filter(Boolean)
                .join(', ')}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {address.recipientName} · {address.phone}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">{t('detail.noAddress')}</p>
        )}
      </section>
    </div>
  )
}
