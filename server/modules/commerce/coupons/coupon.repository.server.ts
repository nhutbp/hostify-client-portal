import { prisma } from '../../../db/prisma'

export function findCouponByCode(code: string) {
  return prisma.coupon.findUnique({ where: { code } })
}
