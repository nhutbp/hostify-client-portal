import type { ReactNode, FC } from 'react'
import Header from './vertical/header/Header'
import Sidebar from './vertical/sidebar/Sidebar'

export type DashboardArea = 'admin' | 'customer'

const FullLayout: FC<{ children: ReactNode; area: DashboardArea }> = ({
  children,
  area,
}) => {
  return (
    <div
      data-dashboard-area={area}
      className="flex min-h-screen w-full bg-background text-foreground"
    >
      <div className="page-wrapper flex min-w-0 w-full">
        {/* Header/sidebar */}
        <div className="hidden md:block">
          <Sidebar area={area} />
        </div>
        <div className="body-wrapper min-w-0 flex-1 bg-background text-foreground">
          {/* Top Header  */}
          <Header area={area} />

          {/* Body Content  */}
          <div className="w-full max-w-none px-4 py-0 md:px-7 md:py-7">
            <main className="min-w-0 grow">{children}</main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FullLayout
