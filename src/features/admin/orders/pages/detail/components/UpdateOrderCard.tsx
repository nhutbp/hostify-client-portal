import { useForm } from '@tanstack/react-form'
import { useSelector } from '@tanstack/react-store'
import {
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { toast } from '@/utils/toast'
import { useUpdateAdminOrder } from '../../../hooks/useAdminOrders'
import type { AdminOrderDetail } from '../types'
import { useOrderFormat } from './DetailShared'

const statuses = [
  'PENDING_PAYMENT',
  'PAID',
  'PROVISIONING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
] as const
const methods = ['WALLET', 'MOMO', 'VIETQR', 'CARD', 'USDT_TRC20'] as const

export function UpdateOrderCard({ order }: { order: AdminOrderDetail }) {
  const { t } = useTranslation('adminOrders')
  const { money } = useOrderFormat()
  const canUpdate = usePermission('commerce.order.update')
  const mutation = useUpdateAdminOrder()
  const [error, setError] = useState('')
  const form = useForm({
    defaultValues: {
      status: order.status as (typeof statuses)[number],
      paymentMethod: (order.paymentMethod ?? '') as
        '' | (typeof methods)[number],
      paymentReference: '',
      paidAt: new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 16),
      manualFulfillmentConfirmed: false,
    },
    onSubmit: async ({ value }) => {
      setError('')
      const firstPayment =
        order.status === 'PENDING_PAYMENT' &&
        ['PAID', 'COMPLETED'].includes(value.status)
      if (
        firstPayment &&
        (!value.paymentMethod ||
          !value.paymentReference.trim() ||
          !value.paidAt)
      ) {
        setError(t('detail.update.paymentRequired'))
        return
      }
      if (
        value.status === 'COMPLETED' &&
        order.status !== 'COMPLETED' &&
        !value.manualFulfillmentConfirmed
      ) {
        setError(t('detail.update.fulfillmentRequired'))
        return
      }
      try {
        await mutation.mutateAsync({
          id: order.id,
          expectedStatus: order.status as (typeof statuses)[number],
          status: value.status,
          paymentMethod: value.paymentMethod || null,
          ...(firstPayment
            ? {
                paymentReference: value.paymentReference.trim(),
                paidAt: new Date(value.paidAt).toISOString(),
              }
            : {}),
          manualFulfillmentConfirmed: value.manualFulfillmentConfirmed,
        })
        toast.success(t('detail.update.saved'))
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : t('detail.update.failed'),
        )
      }
    },
  })
  const selectedStatus = useSelector(form.store, (state) => state.values.status)
  const firstPayment =
    order.status === 'PENDING_PAYMENT' &&
    ['PAID', 'COMPLETED'].includes(selectedStatus)
  const needsFulfillment =
    selectedStatus === 'COMPLETED' && order.status !== 'COMPLETED'
  const allowed: Record<string, readonly string[]> = {
    PENDING_PAYMENT: ['PENDING_PAYMENT', 'PAID', 'COMPLETED', 'CANCELLED'],
    PAID: ['PAID', 'PROVISIONING', 'COMPLETED'],
    PROVISIONING: ['PROVISIONING', 'COMPLETED', 'FAILED'],
    FAILED: ['FAILED', 'PROVISIONING', 'COMPLETED'],
    COMPLETED: ['COMPLETED'],
    CANCELLED: ['CANCELLED'],
  }
  return (
    <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_12px_35px_-20px_rgba(37,99,235,.45)]">
      <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-5 py-4 text-white">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <CreditCard size={20} />
          {t('detail.update.title')}
        </h2>
        <p className="mt-1 text-sm text-blue-100">
          {t('detail.update.subtitle')}
        </p>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
        className="space-y-4 p-5"
      >
        <form.Field name="status">
          {(field) => (
            <label className="block text-sm font-semibold text-slate-700">
              {t('status')}
              <select
                disabled={!canUpdate || mutation.isPending}
                value={field.state.value}
                onChange={(event) => {
                  setError('')
                  field.handleChange(
                    event.target.value as typeof field.state.value,
                  )
                }}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[#11184c] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {statuses
                  .filter((status) =>
                    (allowed[order.status] ?? [order.status]).includes(status),
                  )
                  .map((status) => (
                    <option key={status} value={status}>
                      {t(`statuses.${status}`)}
                    </option>
                  ))}
              </select>
            </label>
          )}
        </form.Field>
        <form.Field name="paymentMethod">
          {(field) => (
            <label className="block text-sm font-semibold text-slate-700">
              {t('detail.paymentMethod')}
              <select
                disabled={
                  !canUpdate ||
                  mutation.isPending ||
                  order.status !== 'PENDING_PAYMENT'
                }
                value={field.state.value}
                onChange={(event) =>
                  field.handleChange(
                    event.target.value as typeof field.state.value,
                  )
                }
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[#11184c] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">{t('detail.update.chooseMethod')}</option>
                {methods.map((method) => (
                  <option key={method} value={method}>
                    {t(`detail.methods.${method}`)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </form.Field>
        {firstPayment && (
          <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex items-center gap-2 font-semibold text-emerald-800">
              <ShieldCheck size={18} />
              {t('detail.update.manualPayment')}
            </div>
            <form.Field name="paymentReference">
              {(field) => (
                <label className="block text-sm text-slate-700">
                  {t('detail.update.reference')} *
                  <input
                    maxLength={120}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={t('detail.update.referencePlaceholder')}
                    className="mt-1 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 outline-none focus:border-emerald-500"
                  />
                </label>
              )}
            </form.Field>
            <form.Field name="paidAt">
              {(field) => (
                <label className="block text-sm text-slate-700">
                  {t('detail.paidAt')} *
                  <input
                    type="datetime-local"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 outline-none focus:border-emerald-500"
                  />
                </label>
              )}
            </form.Field>
            <p className="text-xs text-emerald-800">
              {t('detail.update.manualWarning')}
            </p>
          </div>
        )}
        {needsFulfillment && (
          <form.Field name="manualFulfillmentConfirmed">
            {(field) => (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(event) => field.handleChange(event.target.checked)}
                  className="mt-0.5 accent-violet-600"
                />
                {t('detail.update.fulfillmentCheck')}
              </label>
            )}
          </form.Field>
        )}
        <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <span className="text-blue-600">
            {t('detail.update.recordedAmount')}
          </span>
          <strong className="float-right">
            {money(order.totalMinor, order.currency)}
          </strong>
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {error}
          </p>
        )}
        {canUpdate ? (
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {mutation.isPending ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {t('detail.update.save')}
          </button>
        ) : (
          <p className="text-sm text-slate-500">
            {t('detail.update.noPermission')}
          </p>
        )}
      </form>
    </section>
  )
}
