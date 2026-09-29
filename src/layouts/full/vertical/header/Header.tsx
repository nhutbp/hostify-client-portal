import { useState, useEffect, useEffectEvent } from 'react'
import FullLogo from '../../shared/logo/FullLogo'
import SidebarLayout from '../sidebar/Sidebar'
import Profile from './Profile'
import Search from './Search'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { useTheme } from '@/components/provider/ThemeProvider'
import { Icon } from '@iconify/react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import type { DashboardArea } from '../../FullLayout'
import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'

const Header = ({ area }: { area: DashboardArea }) => {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const [isSticky, setIsSticky] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleScroll = useEffectEvent(() => {
    if (window.scrollY > 50) {
      setIsSticky(true)
    } else {
      setIsSticky(false)
    }
  })

  const handleResize = useEffectEvent(() => {
    if (window.innerWidth >= 768) {
      setIsOpen(false)
    }
  })

  useEffect(() => {
    // Use stable callbacks inside the effect
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    // Run once on mount
    handleResize()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const toggleMode = () => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    setTheme(isDark ? 'light' : 'dark')
  }
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b border-border bg-background/95 text-foreground backdrop-blur ${
          isSticky ? 'shadow-sm' : ''
        }`}
      >
        <nav className="flex h-[58px] w-full items-center justify-between rounded-none bg-transparent px-4 py-0">
          {/* Mobile Toggle Icon */}
          <button
            type="button"
            aria-label={t('layout.openMenu')}
            onClick={() => setIsOpen(true)}
            className="relative flex cursor-pointer items-center justify-center rounded-full p-2 text-foreground hover:bg-primary/10 hover:text-primary md:hidden"
          >
            <Icon icon="tabler:menu-2" height={20} />
          </button>

          <div className="hidden min-w-0 items-end gap-3 md:flex">
            <Search area={area} />
          </div>

          {/* mobile-logo */}
          <div className="block max-w-40 md:hidden">
            <FullLogo area={area} />
          </div>

          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="relative rounded-full p-2 text-foreground/70 hover:bg-primary/10 hover:text-primary"
                aria-label={t('layout.notifications')}
              >
                <Icon icon="solar:bell-linear" width="21" />
                <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  3
                </span>
              </button>
              {/* Language Switcher */}
              <LanguageSwitcher />
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleMode}
                aria-label={t(
                  isDark ? 'settings.lightMode' : 'settings.darkMode',
                )}
                title={t(isDark ? 'settings.lightMode' : 'settings.darkMode')}
                className="flex size-9 items-center justify-center rounded-full text-foreground/70 hover:bg-primary/10 hover:text-primary"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Messages Dropdown */}
              {/* <Messages /> */}

              {/* Profile Dropdown */}
              <Profile area={area} />
            </div>
          </div>
          {/* Mobile Toggle Icon */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={toggleMode}
              aria-label={t(
                isDark ? 'settings.lightMode' : 'settings.darkMode',
              )}
              title={t(isDark ? 'settings.lightMode' : 'settings.darkMode')}
              className="flex size-9 items-center justify-center rounded-full text-foreground/70 hover:bg-primary/10 hover:text-primary"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <LanguageSwitcher />
            <Profile area={area} />
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <VisuallyHidden>
            <SheetTitle>{t('layout.navigation')}</SheetTitle>
          </VisuallyHidden>
          <SidebarLayout area={area} onClose={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}

export default Header
