export const ROLE_CODES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SYSTEM_STAFF: 'SYSTEM_STAFF',
  CUSTOMER: 'CUSTOMER',
  SUPPORT: 'SUPPORT',
  FINANCE: 'FINANCE',
} as const

export type SystemRoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES]

export const SYSTEM_ROLE_CODES = [
  ROLE_CODES.SUPER_ADMIN,
  ROLE_CODES.ADMIN,
  ROLE_CODES.SYSTEM_STAFF,
  ROLE_CODES.CUSTOMER,
  ROLE_CODES.SUPPORT,
  ROLE_CODES.FINANCE,
] as const satisfies readonly SystemRoleCode[]

export const ADMIN_ASSIGNABLE_ROLE_CODES = [
  ROLE_CODES.CUSTOMER,
  ROLE_CODES.SYSTEM_STAFF,
  ROLE_CODES.SUPPORT,
  ROLE_CODES.FINANCE,
  ROLE_CODES.ADMIN,
] as const satisfies readonly SystemRoleCode[]

export const ADMIN_ROLE_CODES = [ROLE_CODES.SUPER_ADMIN, ROLE_CODES.ADMIN]
export const STAFF_ROLE_CODES = [
  ROLE_CODES.SYSTEM_STAFF,
  ROLE_CODES.SUPPORT,
  ROLE_CODES.FINANCE,
]

export const ROLE_DEFINITIONS = [
  {
    code: ROLE_CODES.SUPER_ADMIN,
    name: 'Quản trị hệ thống',
    description: 'Toàn quyền quản trị hệ thống và cấu hình bảo mật.',
    canAccessDashboard: true,
  },
  {
    code: ROLE_CODES.ADMIN,
    name: 'Quản trị viên',
    description: 'Quản lý các module vận hành và nội dung trong CEP.',
    canAccessDashboard: true,
  },
  {
    code: ROLE_CODES.SYSTEM_STAFF,
    name: 'Nhân viên vận hành',
    description: 'Theo dõi và xử lý các nghiệp vụ vận hành hằng ngày.',
    canAccessDashboard: true,
  },
  {
    code: ROLE_CODES.CUSTOMER,
    name: 'Người dùng khách hàng',
    description:
      'Tài khoản người dùng không có quyền truy cập khu vực quản trị.',
    canAccessDashboard: false,
  },
  {
    code: ROLE_CODES.SUPPORT,
    name: 'Nhân viên hỗ trợ',
    description: 'Tiếp nhận và hỗ trợ các yêu cầu từ người dùng.',
    canAccessDashboard: true,
  },
  {
    code: ROLE_CODES.FINANCE,
    name: 'Nhân viên tài chính',
    description: 'Xử lý các nghiệp vụ liên quan đến tài chính và đối soát.',
    canAccessDashboard: true,
  },
] as const
