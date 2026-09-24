import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@tanstack/react-router'
import * as profileData from './data'
import { authService } from '@/features/auth/services/authService'
import { useAuthActions, useCurrentUser } from '@/features/auth/store/authStore'
import { formatImageUrl } from '@/utils/format'
import { Icon } from '@iconify/react'
import { UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const Profile = () => {
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
    <div className="group/menu relative shrink-0 ps-1 sm:ps-15">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="hover:text-primary hover:bg-lightprimary group-hover/menu:bg-lightprimary group-hover/menu:text-primary flex cursor-pointer items-center justify-center rounded-full">
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
              <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                <UserRound className="h-5 w-5" />
              </span>
            )}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-ld w-screen rounded-sm border pt-4 pb-6 shadow-none sm:w-50"
        >
          {profileData.profileDD.map((items, index) => (
            <DropdownMenuItem
              key={index}
              asChild
              className="bg-hover group/link flex w-full cursor-pointer items-center justify-between px-4 py-2"
            >
              {items.url === '/dashboard/profile' && user?.id ? (
                <Link
                  to="/dashboard/users/$userId"
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
          ))}

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
