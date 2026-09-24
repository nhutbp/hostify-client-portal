import * as React from 'react'
import { useLocation } from '@tanstack/react-router'

interface ScrollToTopProps {
  children: React.ReactNode
}

export default function ScrollToTop({ children }: ScrollToTopProps) {
  const location = useLocation()

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  }, [location.pathname])

  return <>{children}</>
}
