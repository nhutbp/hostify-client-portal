import type { ReactNode, FC } from 'react'
import Header from './vertical/header/Header'
import Sidebar from './vertical/sidebar/Sidebar'

const FullLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full">
      <div className="page-wrapper flex min-w-0 w-full">
        {/* Header/sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="body-wrapper dark:bg-dark min-w-0 w-full bg-white md:ml-[270px]">
          {/* Top Header  */}
          <Header />

          {/* Body Content  */}
          <div className="container mx-auto px-4 py-0 md:px-7 md:py-7">
            <main className="min-w-0 grow">{children}</main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FullLayout
