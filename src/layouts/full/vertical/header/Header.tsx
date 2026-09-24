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

const Header = () => {
  const { theme, setTheme } = useTheme()
  const [isSticky, setIsSticky] = useState(false)
  const [mobileMenu, setMobileMenu] = useState('')
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
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const handleMobileMenu = () => {
    if (mobileMenu === 'active') {
      setMobileMenu('')
    } else {
      setMobileMenu('active')
    }
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur ${
          isSticky ? 'shadow-sm' : ''
        }`}
      >
        <nav className="container mx-auto flex w-full items-center justify-between rounded-none bg-transparent px-5 py-2.5 sm:px-10 dark:bg-transparent">
          {/* Mobile Toggle Icon */}
          <span
            onClick={() => setIsOpen(true)}
            className="hover:text-primary dark:hover:text-primary text-link dark:text-darklink hover:after:bg-lightprimary relative flex cursor-pointer items-center justify-center rounded-full after:absolute after:h-10 after:w-10 after:rounded-full after:bg-transparent md:hidden"
          >
            <Icon icon="tabler:menu-2" height={20} />
          </span>

          <div className="hidden min-w-0 items-end gap-3 md:flex">
            <Search />
          </div>

          {/* mobile-logo */}
          <div className="block max-w-40 md:hidden">
            <FullLogo />
          </div>

          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              <button type="button" className="relative rounded-full p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600" aria-label="Thông báo">
                <Icon icon="solar:bell-linear" width="21" />
                <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">3</span>
              </button>
              {/* Language Switcher */}
              <LanguageSwitcher />
              {/* Theme Toggle */}
              {theme === 'light' ? (
                <div
                  className="hover:text-primary group dark:hover:text-primary text-link dark:text-darklink relative flex cursor-pointer items-center justify-center rounded-full px-15 focus:ring-0"
                  onClick={toggleMode}
                >
                  <span className="group-hover:after:bg-lightprimary relative flex items-center justify-center after:absolute after:-top-1/2 after:h-10 after:w-10 after:rounded-full">
                    <Icon icon="tabler:moon" width="20" />
                  </span>
                </div>
              ) : (
                // Dark Mode Button
                <div
                  className="hover:text-primary dark:hover:text-primary text-link dark:text-darklink group relative flex cursor-pointer items-center justify-center rounded-full px-15 focus:ring-0"
                  onClick={toggleMode}
                >
                  <span className="group-hover:after:bg-lightprimary relative flex items-center justify-center after:absolute after:-top-1/2 after:h-10 after:w-10 after:rounded-full">
                    <Icon
                      icon="solar:sun-bold-duotone"
                      width="20"
                      className="group-hover:text-primary"
                    />
                  </span>
                </div>
              )}

              {/* Messages Dropdown */}
              {/* <Messages /> */}

              {/* Profile Dropdown */}
              <Profile />
            </div>
          </div>
          {/* Mobile Toggle Icon */}
          <span className="flex md:hidden" onClick={handleMobileMenu}>
            <div className="flex w-full md:hidden">
              <div className="flex items-center justify-center">
                {theme === 'light' ? (
                  <div
                    className="hover:text-primary group dark:hover:text-primary text-link dark:text-darklink relative flex cursor-pointer items-center justify-center rounded-full px-1 focus:ring-0 sm:px-15"
                    onClick={toggleMode}
                  >
                    <span className="group-hover:after:bg-lightprimary relative flex items-center justify-center after:absolute after:-top-1/2 after:h-10 after:w-10 after:rounded-full">
                      <Icon icon="tabler:moon" width="20" />
                    </span>
                  </div>
                ) : (
                  // Dark Mode Button
                  <div
                    className="hover:text-primary dark:hover:text-primary text-link dark:text-darklink group relative flex cursor-pointer items-center justify-center rounded-full px-1 focus:ring-0 sm:px-15"
                    onClick={toggleMode}
                  >
                    <span className="group-hover:after:bg-lightprimary relative flex items-center justify-center after:absolute after:-top-1/2 after:h-10 after:w-10 after:rounded-full">
                      <Icon
                        icon="solar:sun-bold-duotone"
                        width="20"
                        className="group-hover:text-primary"
                      />
                    </span>
                  </div>
                )}
                <LanguageSwitcher />
                {/* <Messages /> */}
                <Profile />
              </div>
            </div>
          </span>
        </nav>
      </header>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <VisuallyHidden>
            <SheetTitle>sidebar</SheetTitle>
          </VisuallyHidden>
          <SidebarLayout onClose={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}

export default Header
