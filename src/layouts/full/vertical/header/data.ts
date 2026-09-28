//   Search Data
interface SearchType {
  href: string
  title: string
}

const SearchLinks: SearchType[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    title: 'Profile',
    href: '/admin/dashboard/profile',
  },
  {
    title: 'Settings',
    href: '/admin/dashboard/settings',
  },
]

const pageLinks: SearchType[] = SearchLinks

const MessagesLink = [
  {
    avatar: '/tanstack-circle-logo.png',
    title: 'Welcome back',
    subtitle: 'Your account is ready',
  },
]

//  Profile Data
export interface ProfileType {
  titleKey: string
  img: any
  subtitle: string
  url: string
  icon: string
}

const profileDD: ProfileType[] = [
  {
    img: '/tanstack-circle-logo.png',
    titleKey: 'profile.myProfile',
    subtitle: 'Account settings',
    icon: 'tabler:user',
    url: '/admin/dashboard/profile',
  },
]

export { MessagesLink, SearchLinks, pageLinks, profileDD }
