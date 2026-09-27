import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/client.js'
import { createId } from '../../../server/common/id.server.js'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
})

const providers = [
  {
    code: 'PROVIDER_A',
    providerType: 'VPS',
    credentialRef: 'env:PROVIDER_A',
    datacenters: [
      {
        code: 'VN-HN',
        name: 'Việt Nam (Hà Nội)',
        countryCode: 'VN',
        city: 'Hanoi',
      },
      {
        code: 'VN-HCM',
        name: 'Việt Nam (Hồ Chí Minh)',
        countryCode: 'VN',
        city: 'Ho Chi Minh City',
      },
    ],
  },
  {
    code: 'PROVIDER_B',
    providerType: 'VPS',
    credentialRef: 'env:PROVIDER_B',
    datacenters: [
      { code: 'SG-1', name: 'Singapore', countryCode: 'SG', city: 'Singapore' },
    ],
  },
  {
    code: 'PROVIDER_C',
    providerType: 'VPS',
    credentialRef: 'env:PROVIDER_C',
    datacenters: [
      { code: 'JP-1', name: 'Nhật Bản', countryCode: 'JP', city: 'Tokyo' },
    ],
  },
  {
    code: 'PROVIDER_D',
    providerType: 'VPS',
    credentialRef: 'env:PROVIDER_D',
    datacenters: [
      {
        code: 'US-1',
        name: 'Hoa Kỳ (US)',
        countryCode: 'US',
        city: 'Virginia',
      },
      {
        code: 'DE-FRA',
        name: 'Đức (Frankfurt)',
        countryCode: 'DE',
        city: 'Frankfurt',
      },
    ],
  },
]

export async function main() {
  const categories = [
    ['VPS', 'vps'],
    ['Hosting', 'hosting'],
    ['Máy chủ vật lý', 'physical'],
    ['Server', 'server'],
    ['Proxy', 'proxy'],
    ['VIA', 'via'],
    ['Tên miền', 'domain'],
    ['Dịch vụ khác', 'other'],
  ] as const
  for (const [name, slug] of categories) {
    await prisma.productCategory.upsert({
      where: { slug },
      update: {
        name,
        kind: 'SERVICE',
      },
      create: {
        id: createId(),
        name,
        slug,
        kind: 'SERVICE',
      },
    })
  }
  const providerRoot = await prisma.productCategory.upsert({
    where: { slug: 'nha-cung-cap' },
    update: { name: 'Nhà cung cấp', kind: 'PROVIDER' },
    create: {
      id: createId(),
      name: 'Nhà cung cấp',
      slug: 'nha-cung-cap',
      kind: 'PROVIDER',
    },
  })
  for (const [name, slug] of [
    ['Mobifone', 'mobifone'],
    ['VNPT', 'vnpt'],
  ] as const) {
    await prisma.productCategory.upsert({
      where: { slug },
      update: { name, kind: 'PROVIDER', parentId: providerRoot.id },
      create: {
        id: createId(),
        name,
        slug,
        kind: 'PROVIDER',
        parentId: providerRoot.id,
      },
    })
  }
  const tags = [
    ['Phổ biến', 'popular'],
    ['Hiệu năng cao', 'high-performance'],
    ['Doanh nghiệp', 'business'],
    ['Tiết kiệm', 'economy'],
    ['Mới', 'new'],
  ] as const
  for (const [name, slug] of tags) {
    await prisma.productTag.upsert({
      where: { slug },
      update: { name },
      create: { id: createId(), name, slug },
    })
  }
  for (const item of providers) {
    const provider = await prisma.provider.upsert({
      where: { code: item.code },
      update: {
        providerType: item.providerType,
        credentialRef: item.credentialRef,
        status: 'ACTIVE',
      },
      create: {
        id: createId(),
        code: item.code,
        providerType: item.providerType,
        credentialRef: item.credentialRef,
        status: 'ACTIVE',
      },
    })
    for (const datacenter of item.datacenters)
      await prisma.datacenter.upsert({
        where: { code: datacenter.code },
        update: { ...datacenter, providerId: provider.id, status: 'ACTIVE' },
        create: {
          id: createId(),
          ...datacenter,
          providerId: provider.id,
          status: 'ACTIVE',
        },
      })
  }
}
