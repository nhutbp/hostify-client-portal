import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/client.js'
import { createId } from '../../../server/common/id.server.js'
import { PERMISSION_CODES } from '../../../shared/permission-codes.js'
import { ROLE_CODES } from '../../../shared/roles.js'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
})

export async function main() {
  const permission = await prisma.permission.upsert({
    where: { code: PERMISSION_CODES.COMMERCE_ORDER_VIEW },
    update: {
      name: 'Xem đơn hàng',
      description: 'Xem và lọc đơn hàng khách hàng',
    },
    create: {
      id: createId(),
      code: PERMISSION_CODES.COMMERCE_ORDER_VIEW,
      module: 'commerce',
      resource: 'order',
      action: 'view',
      name: 'Xem đơn hàng',
      description: 'Xem và lọc đơn hàng khách hàng',
    },
  })
  const roles = await prisma.role.findMany({
    where: { code: { in: [ROLE_CODES.SUPER_ADMIN, ROLE_CODES.ADMIN] } },
    select: { id: true },
  })
  for (const role of roles) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: role.id, permissionId: permission.id },
      },
      update: {},
      create: { roleId: role.id, permissionId: permission.id },
    })
  }
}
