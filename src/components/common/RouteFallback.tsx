import type {
  ErrorComponentProps,
  NotFoundRouteProps,
} from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import type React from 'react'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'
import { Panel } from '@/components/common/Panel'
import { Button } from '@/components/ui/button'

function FallbackShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-[#fbfcfb] px-3 py-6 sm:px-6">
      <Panel className="w-full max-w-[calc(100vw-1.5rem)] px-5 py-6 text-center sm:max-w-120 sm:px-8 sm:py-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[#18201b] sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#68716c] sm:text-base sm:leading-7">
          {description}
        </p>
        <div className="mt-6">{children}</div>
      </Panel>
    </div>
  )
}

export function RouteErrorFallback({ error, reset }: ErrorComponentProps) {
  const message =
    error instanceof Error ? error.message : 'Đã có lỗi xảy ra trên hệ thống.'

  return (
    <FallbackShell title="Có lỗi xảy ra" description={message}>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button onClick={reset} className="w-full sm:w-auto">
          <RotateCcw className="mr-2 h-4 w-4" />
          Thử lại
        </Button>
        <Button
          variant="outline"
          asChild
          className="w-full border-primary! text-primary! sm:w-auto"
        >
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Về trang chủ
          </Link>
        </Button>
      </div>
    </FallbackShell>
  )
}

export function RouteNotFoundFallback({ routeId }: NotFoundRouteProps) {
  return (
    <FallbackShell
      title="Không tìm thấy trang"
      description={`Đường dẫn bạn mở không tồn tại hoặc đã bị xóa. (${routeId})`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="w-full sm:w-auto">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Về dashboard
          </Link>
        </Button>
      </div>
    </FallbackShell>
  )
}
