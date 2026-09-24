import { Outlet } from '@tanstack/react-router'
import ScrollToTop from '@/components/common/ScrollToTop'

const BlankLayout = () => (
  <>
    <ScrollToTop>
      <Outlet />
    </ScrollToTop>
  </>
)

export default BlankLayout
