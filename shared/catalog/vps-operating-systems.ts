export const vpsOperatingSystems = [
  'AlmaLinux 8.4',
  'CentOS 7.9',
  'Rocky Linux 8.8',
  'AlmaLinux 10.0',
  'CentOS 8',
  'N8N (cần đặt hostname là tên miền cần sử dụng)',
  'CentOS 10.0',
  'Rocky Linux 10.0',
  'Ubuntu 22.04',
  'Ubuntu 20.04',
  'Debian 13',
  'Ubuntu 19.04',
  'Ubuntu 18.04',
  'Fedora 27',
  'Debian 11',
  'Debian 10',
  'Ubuntu 24.04 x86_64',
  'Debian 12',
] as const

export function availableVpsOperatingSystems(defaultSystem?: string | null) {
  return defaultSystem &&
    !vpsOperatingSystems.some((system) => system === defaultSystem)
    ? [defaultSystem, ...vpsOperatingSystems]
    : [...vpsOperatingSystems]
}
