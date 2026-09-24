import { createFileRoute, Link } from '@tanstack/react-router'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_dashboard/dashboard/forbidden')({
  head: () => ({ meta: [{ title: 'Không có quyền truy cập' }] }),
  component: ForbiddenPage,
})

function ForbiddenPage() {
  return (
    <div className="grid min-h-[65vh] place-items-center px-4 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-red-50 text-red-600">
          <ShieldX className="size-10" />
        </span>
        <h1 className="mt-5 text-3xl font-bold text-slate-900">
          Không có quyền truy cập
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Tài khoản của bạn chưa được cấp quyền để mở trang này. Vui lòng liên
          hệ quản trị viên nếu bạn cần truy cập.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  )
}
