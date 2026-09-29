import Messages from './Messages'
import Profile from './Profile'
import type { DashboardArea } from '../../FullLayout'

const MobileHeaderItems = ({ area = 'admin' }: { area?: DashboardArea }) => {
  return (
    <nav className="flex-1 rounded-none bg-background px-9 text-foreground">
      <div className="block w-full md:hidden">
        <div className="flex items-center justify-center">
          <Messages />

          <Profile area={area} />
        </div>
      </div>
    </nav>
  )
}

export default MobileHeaderItems
