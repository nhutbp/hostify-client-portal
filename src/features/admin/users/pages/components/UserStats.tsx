import { useMemo } from 'react'
import { Chart } from '@tanstack/react-charts'
import { defineChart } from '@tanstack/charts'
import { polar, radialArc } from '@tanstack/charts/polar'
import { pie } from 'd3-shape'
import {
  LockKeyhole,
  UserRoundCheck,
  UserRoundPlus,
  UsersRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminUserStats } from '../../hooks/useAdminUsers'
import type { AdminUserRole } from '../../types'

const roleColors: Record<AdminUserRole, string> = {
  CUSTOMER: '#15803d',
  STAFF: '#8b5cf6',
  ADMIN: '#f59e0b',
}

export function UserStatCards() {
  const { t } = useTranslation('adminUsers')
  const { data, isLoading } = useAdminUserStats()
  const cards = [
    {
      label: t('stats.total'),
      value: data?.total,
      note: t('roles.ALL'),
      icon: UsersRound,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: t('stats.active'),
      value: data?.active,
      note: data?.total
        ? `${Math.round((data.active / data.total) * 100)}%`
        : '0%',
      icon: UserRoundCheck,
      tone: 'bg-green-50 text-green-700',
    },
    {
      label: t('stats.new'),
      value: data?.newUsers,
      note: t('stats.last30'),
      icon: UserRoundPlus,
      tone: 'bg-blue-50 text-blue-700',
    },
    {
      label: t('stats.blocked'),
      value: data?.blocked,
      note: t('stats.needsReview'),
      icon: LockKeyhole,
      tone: 'bg-red-50 text-red-600',
    },
  ]
  return (
    <div className="grid w-full min-w-0 grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map(({ label, value, note, icon: Icon, tone }) => (
        <div
          key={label}
          className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 dark:border-slate-700 dark:bg-slate-900"
        >
          <div
            className={`hidden h-10 w-10 shrink-0 place-items-center rounded-full sm:grid ${tone}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs text-slate-500 sm:text-sm">
              {label}
            </p>
            <p className="mt-0.5 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
              {isLoading ? '—' : (value ?? 0).toLocaleString()}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-emerald-600 sm:text-xs">
              {note}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function useRoleDistribution() {
  const { t } = useTranslation('adminUsers')
  const { data } = useAdminUserStats()
  const roles = (['CUSTOMER', 'STAFF', 'ADMIN'] as AdminUserRole[]).map(
    (role) => ({ role, value: data?.roles[role] ?? 0 }),
  )
  const total = Math.max(
    1,
    roles.reduce((sum, item) => sum + item.value, 0),
  )
  const definition = useMemo(() => {
    const visibleRoles = roles.filter(({ value }) => value > 0)
    const chartRoles = visibleRoles.length
      ? visibleRoles
      : [{ role: 'CUSTOMER' as AdminUserRole, value: 1 }]
    const slices = pie<(typeof chartRoles)[number]>()
      .sort(null)
      .value(({ value }) => value)(chartRoles)
    return defineChart({
      marks: [
        polar({
          inset: 4,
          radiusRatio: 0.9,
          marks: [
            radialArc(slices, {
              key: (slice) => slice.data.role,
              color: (slice) => slice.data.role,
              innerRadius: ({ radius }) => radius * 0.58,
              cornerRadius: 4,
              padAngle: 'padAngle',
            }),
          ],
        }),
      ],
      color: {
        domain: chartRoles.map(({ role }) => role),
        range: chartRoles.map(({ role }) => roleColors[role]),
      },
      guides: false,
      x: null,
      y: null,
      keyboard: false,
      animate: true,
    })
  }, [roles])
  return { t, roles, total, definition }
}

export function UserRoleDistribution() {
  const { t, roles, total, definition } = useRoleDistribution()
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-sm font-bold uppercase text-slate-800 dark:text-white">
        {t('rolesTitle')}
      </h2>
      <div className="mx-auto my-2 h-36 w-36">
        <Chart
          definition={definition}
          width={144}
          height={144}
          ariaLabel={t('rolesTitle')}
        />
      </div>
      <div className="space-y-1.5">
        {roles.map(({ role, value }) => (
          <div key={role} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <i
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: roleColors[role] }}
              />
              {t(`roles.${role}`)}
            </span>
            <strong>
              {value.toLocaleString()}{' '}
              <span className="font-normal text-slate-400">
                ({Math.round((value / total) * 100)}%)
              </span>
            </strong>
          </div>
        ))}
      </div>
    </section>
  )
}
