import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@tanstack/react-router'
import * as profileData from './data'
import { authService } from '@/features/auth/services/authService'
import { useAuthActions, useCurrentUser } from '@/features/auth/store/authStore'
import { formatImageUrl } from '@/utils/format'
import { Icon } from '@iconify/react'
import { ClipboardList, Server, UserRound } from 'lucide-react'
import type { DashboardArea } from '../../FullLayout'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const Profile = ({ area }: { area: DashboardArea }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { clear } = useAuthActions()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const user = useCurrentUser()
  const avatarUrl = formatImageUrl(user?.avatarUrl)
  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await authService.logoutSession()
    } catch {
      // Logout should still clear local auth state even if the backend request fails.
    } finally {
      clear()
      setIsLoading(false)
      navigate({ to: '/login', replace: true })
    }
  }

  return (
    <div className="group/menu relative shrink-0 ps-1 sm:ps-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={t('customerShell.accountMenu')}
            className="flex cursor-pointer items-center gap-2 rounded-full px-2 py-0.5 hover:bg-primary/10"
          >
            {avatarUrl && !avatarError ? (
              <img
                src={avatarUrl}
                alt="avatar"
                height="35"
                width="35"
                className="rounded-full"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {user?.displayName?.slice(0, 2).toUpperCase() ?? (
                  <UserRound className="h-5 w-5" />
                )}
              </span>
            )}
            <span className="hidden text-left lg:block">
              <span className="block text-sm font-semibold leading-4 text-foreground">
                {user?.displayName ?? t('customerShell.customer')}
              </span>
              <span className="block text-xs leading-4 text-muted-foreground">
                {area === 'customer'
                  ? t('customerShell.customer')
                  : t('profile.administrator')}
              </span>
            </span>
            <Icon
              icon="solar:alt-arrow-down-linear"
              className="hidden size-4 text-muted-foreground lg:block"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg"
        >
          {area === 'customer' ? (
            <>
              <p className="truncate border-b border-border px-3 py-2 text-xs text-muted-foreground">
                {user?.userEmail}
              </p>
              <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5">
                <Link to="/customer/dashboard/services">
                  <Server size={17} />
                  {t('customerShell.services')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5">
                <Link to="/customer/dashboard/orders">
                  <ClipboardList size={17} />
                  {t('customerShell.orders')}
                </Link>
              </DropdownMenuItem>
            </>
          ) : (
            profileData.profileDD.map((items, index) => (
              <DropdownMenuItem
                key={index}
                asChild
                className="bg-hover group/link flex w-full cursor-pointer items-center justify-between px-4 py-2"
              >
                {items.url === '/admin/dashboard/profile' && user?.id ? (
                  <Link
                    to="/admin/dashboard/users/$userId"
                    params={{ userId: user.id }}
                  >
                    <ProfileMenuContent items={items} t={t} />
                  </Link>
                ) : (
                  <Link to={items.url}>
                    <ProfileMenuContent items={items} t={t} />
                  </Link>
                )}
              </DropdownMenuItem>
            ))
          )}

          <div className="px-4 pt-2">
            <Button
              onClick={handleLogout}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-lightprimary hover:text-primary w-full rounded-md py-0"
            >
              {isLoading ? t('profile.loggingOut') : t('auth.logout')}
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function ProfileMenuContent({
  items,
  t,
}: {
  items: profileData.ProfileType
  t: (key: string) => string
}) {
  return (
    <div className="w-full">
      <div className="flex w-full items-center gap-3 ps-0">
        <Icon
          icon={items.icon}
          className="text-bodytext group-hover/link:text-primary text-lg"
        />
        <div className="w-3/4">
          <h5 className="text-bodytext group-hover/link:text-primary mb-0 text-sm">
            {t(items.titleKey)}
          </h5>
        </div>
      </div>
    </div>
  )
}

export default Profile
