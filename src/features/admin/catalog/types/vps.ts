export type VpsPlan = {
  name: string
  description: string
  cpu: string
  ram: string
  disk: string
  price: string
  provider: string
  location: string
  country: string
  enabled: boolean
  color: string
}

export type ProductCategory = {
  name: string
  count: number
  icon: 'server' | 'layers'
}
