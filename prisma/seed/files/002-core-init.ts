import { PrismaPg } from '@prisma/adapter-pg'
import argon2 from 'argon2'
import { PrismaClient } from '../../generated/client.js'
import { createId } from '../../../server/common/id.server.js'
import { PERMISSION_CATALOG } from '../../../shared/permissions.js'
import { ROLE_CODES, ROLE_DEFINITIONS } from '../../../shared/roles.js'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
})

export async function main() {
  const permissionCodes = PERMISSION_CATALOG.map(({ code }) => code)
  await prisma.rolePermission.deleteMany({
    where: { permission: { code: { notIn: permissionCodes } } },
  })
  await prisma.permission.deleteMany({
    where: { code: { notIn: permissionCodes } },
  })

  const permissionRecords = await Promise.all(
    PERMISSION_CATALOG.map((permission) => {
      const data = {
        code: permission.code,
        module: permission.module,
        resource: permission.resource,
        action: permission.action,
        name: permission.name,
        description: permission.description,
      }
      return prisma.permission.upsert({
        where: { code: permission.code },
        update: data,
        create: { id: createId(), ...data },
      })
    }),
  )
  const roleRecords = await Promise.all(
    ROLE_DEFINITIONS.map(({ code, name, description, canAccessDashboard }) =>
      prisma.role.upsert({
        where: { code },
        update: { name, description, canAccessDashboard },
        create: {
          id: createId(),
          code,
          name,
          description,
          canAccessDashboard,
        },
      }),
    ),
  )
  const superAdmin = roleRecords.find(
    (role) => role.code === ROLE_CODES.SUPER_ADMIN,
  )!
  const admin = roleRecords.find((role) => role.code === ROLE_CODES.ADMIN)!

  await Promise.all(
    [superAdmin, admin].flatMap((role) =>
      permissionRecords.map((permission) =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: { roleId: role.id, permissionId: permission.id },
        }),
      ),
    ),
  )

  const rootLogin = (process.env.SEED_ROOT_LOGIN || 'root').trim().toLowerCase()
  const rootEmail = (process.env.SEED_ROOT_EMAIL || 'root@example.com')
    .trim()
    .toLowerCase()
  const rootPassword = process.env.SEED_ROOT_PASSWORD

  if (!rootPassword) {
    throw new Error('SEED_ROOT_PASSWORD is required to create the root user')
  }

  const rootPasswordHash = await argon2.hash(rootPassword, {
    type: argon2.argon2id,
  })
  const rootUser = await prisma.user.upsert({
    where: { login: rootLogin },
    update: {
      displayName: 'Root',
      email: rootEmail,
      password: rootPasswordHash,
      status: 'ACTIVE',
    },
    create: {
      id: createId(),
      login: rootLogin,
      displayName: 'Root',
      email: rootEmail,
      password: rootPasswordHash,
      status: 'ACTIVE',
      code: 'ROOT',
    },
  })

  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: rootUser.id, roleId: superAdmin.id },
    },
    update: {},
    create: { userId: rootUser.id, roleId: superAdmin.id },
  })

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase()
  if (adminEmail) {
    const user = await prisma.user.findUnique({ where: { email: adminEmail } })
    if (!user) throw new Error(`SEED_ADMIN_EMAIL not found: ${adminEmail}`)
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: user.id, roleId: admin.id },
      },
      update: {},
      create: { userId: user.id, roleId: admin.id },
    })
  }
}
