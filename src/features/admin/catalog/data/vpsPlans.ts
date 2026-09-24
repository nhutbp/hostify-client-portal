import type { ProductCategory, VpsPlan } from '../types/vps'

export const vpsCategories: ProductCategory[] = [
  { name: 'VPS', count: 120, icon: 'server' },
  { name: 'Hosting', count: 24, icon: 'server' },
  { name: 'Máy chủ vật lý', count: 18, icon: 'server' },
  { name: 'Proxy', count: 56, icon: 'layers' },
  { name: 'VIA', count: 32, icon: 'layers' },
]

export const vpsPlans: VpsPlan[] = [
  ['VPS Basic', 'Phù hợp cho cá nhân', '1 vCPU', '2 GB RAM', '50 GB NVMe SSD', '99,000', 'Provider A', 'Việt Nam', '🇻🇳', true, 'bg-blue-500'],
  ['VPS Standard', 'Dành cho doanh nghiệp nhỏ', '2 vCPU', '4 GB RAM', '80 GB NVMe SSD', '199,000', 'Provider B', 'Singapore', '🇸🇬', true, 'bg-violet-500'],
  ['VPS Professional', 'Hiệu năng cao', '4 vCPU', '8 GB RAM', '100 GB NVMe SSD', '299,000', 'Provider C', 'Nhật Bản', '🇯🇵', true, 'bg-orange-500'],
  ['VPS Premium', 'Hiệu năng tối đa', '8 vCPU', '16 GB RAM', '200 GB NVMe SSD', '499,000', 'Provider A', 'Việt Nam', '🇻🇳', true, 'bg-blue-500'],
  ['VPS Game', 'Tối ưu cho game', '4 vCPU', '8 GB RAM', '100 GB NVMe SSD', '349,000', 'Provider D', 'Hoa Kỳ', '🇺🇸', false, 'bg-emerald-500'],
  ['VPS Linux', 'Tối ưu Linux', '2 vCPU', '4 GB RAM', '80 GB NVMe SSD', '199,000', 'Provider B', 'Singapore', '🇸🇬', true, 'bg-violet-500'],
  ['VPS Windows', 'Hỗ trợ Windows', '2 vCPU', '8 GB RAM', '100 GB NVMe SSD', '319,000', 'Provider C', 'Đức', '🇩🇪', true, 'bg-orange-500'],
  ['VPS High CPU', 'Tối ưu CPU', '8 vCPU', '16 GB RAM', '200 GB NVMe SSD', '599,000', 'Provider A', 'Hoa Kỳ', '🇺🇸', false, 'bg-blue-500'],
  ['VPS Storage', 'Dung lượng lớn', '4 vCPU', '8 GB RAM', '500 GB NVMe SSD', '699,000', 'Provider D', 'Việt Nam', '🇻🇳', true, 'bg-emerald-500'],
].map(([name, description, cpu, ram, disk, price, provider, location, country, enabled, color]) => ({ name, description, cpu, ram, disk, price, provider, location, country, enabled, color } as VpsPlan))
