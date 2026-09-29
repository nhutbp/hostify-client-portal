import type { MenuItem } from './sidebaritem'

const customerSidebarItems: MenuItem[] = [
  {
    id: 'customer-home',
    titleKey: 'customerShell.home',
    icon: 'solar:home-2-linear',
    section: 'customerShell.sidebarLabel',
    url: '/customer/dashboard',
  },
  {
    id: 'customer-buy',
    titleKey: 'customerShell.buy',
    icon: 'solar:cart-large-2-linear',
    section: 'customerShell.sidebarLabel',
    url: '/customer/dashboard/buy',
  },
  {
    id: 'customer-services',
    titleKey: 'customerShell.services',
    icon: 'solar:server-square-linear',
    section: 'customerShell.sidebarLabel',
    url: '/customer/dashboard/services',
  },
  {
    id: 'customer-domains',
    titleKey: 'customerShell.domains',
    icon: 'solar:global-linear',
    section: 'customerShell.sidebarLabel',
    disabled: true,
  },
  {
    id: 'customer-orders',
    titleKey: 'customerShell.orders',
    icon: 'solar:clipboard-list-linear',
    section: 'customerShell.sidebarLabel',
    url: '/customer/dashboard/orders',
  },
  {
    id: 'customer-support',
    titleKey: 'customerShell.support',
    icon: 'solar:headphones-round-linear',
    section: 'customerShell.sidebarLabel',
    disabled: true,
  },
  {
    id: 'customer-affiliates',
    titleKey: 'customerShell.affiliates',
    icon: 'solar:users-group-rounded-linear',
    section: 'customerShell.sidebarLabel',
    disabled: true,
  },
  {
    id: 'customer-notifications',
    titleKey: 'customerShell.notifications',
    icon: 'solar:bell-linear',
    section: 'customerShell.sidebarLabel',
    disabled: true,
  },
  {
    id: 'customer-settings',
    titleKey: 'customerShell.accountSettings',
    icon: 'solar:settings-linear',
    section: 'customerShell.sidebarLabel',
    disabled: true,
  },
]

export default customerSidebarItems
