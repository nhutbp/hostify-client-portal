import Messages from './Messages'
import Profile from './Profile'

const MobileHeaderItems = () => {
  return (
    <nav className="dark:bg-dark flex-1 rounded-none bg-white px-9">
      <div className="block w-full md:hidden">
        <div className="flex items-center justify-center">
          <Messages />

          <Profile />
        </div>
      </div>
    </nav>
  )
}

export default MobileHeaderItems
