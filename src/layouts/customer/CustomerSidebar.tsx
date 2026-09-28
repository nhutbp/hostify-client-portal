import { Link, useLocation } from '@tanstack/react-router'
import {
  Bell,
  ClipboardList,
  Globe2,
  Headphones,
  Home,
  Server,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react'

const items = [
  { label: 'Trang chủ', icon: Home, to: '/customer/dashboard' },
  { label: 'Mua dịch vụ', icon: ShoppingCart, to: '/customer/dashboard/buy' },
  {
    label: 'Quản lý dịch vụ',
    icon: Server,
    to: '/customer/dashboard/services',
  },
  { label: 'Tên miền', icon: Globe2 },
  {
    label: 'Lịch sử mua hàng',
    icon: ClipboardList,
    to: '/customer/dashboard/orders',
  },
  { label: 'Hỗ trợ', icon: Headphones },
  { label: 'Affiliates', icon: Users },
  { label: 'Thông báo', icon: Bell },
] as const

export default function CustomerSidebar({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const path = useLocation({ select: (location) => location.pathname })
  return (
    <div className="flex h-full flex-col bg-white">
      <Link
        to="/customer/dashboard/buy"
        className="flex h-16 items-center gap-3 border-b border-slate-100 px-6"
        onClick={onNavigate}
      >
        <span className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Server size={25} />
        </span>
        <span>
          <strong className="block text-xl leading-5 text-[#101746]">
            Hostify
          </strong>
          <small className="text-xs text-slate-500">
            Your Server, Your Way
          </small>
        </span>
      </Link>
      <nav className="flex-1 space-y-1 p-3 pt-6" aria-label="Menu khách hàng">
        {items.map(({ label, icon: Icon, ...item }) => {
          const target = 'to' in item ? item.to : undefined
          const active = Boolean(
            target &&
            (target === path ||
              ((target === '/customer/dashboard/services' ||
                target === '/customer/dashboard/orders') &&
                path.startsWith(`${target}/`))),
          )
          const className = `flex w-full items-center gap-4 rounded-lg px-4 py-3 text-base transition-colors ${active ? 'bg-blue-50 font-semibold text-blue-600 before:absolute before:-left-3 before:h-7 before:w-1 before:rounded-r before:bg-blue-600' : 'text-[#26365e] hover:bg-slate-50'}`
          return target ? (
            <div key={label} className="relative">
              <Link to={target} onClick={onNavigate} className={className}>
                <Icon size={20} />
                {label}
              </Link>
            </div>
          ) : (
            <button
              key={label}
              type="button"
              disabled
              title="Sắp ra mắt"
              className={`${className} cursor-not-allowed opacity-60`}
            >
              <Icon size={20} />
              {label}
            </button>
          )
        })}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          disabled
          title="Sắp ra mắt"
          className="flex items-center gap-4 px-4 py-3 text-[#26365e] opacity-60"
        >
          <Settings size={20} />
          Cài đặt tài khoản
        </button>
        <div className="mt-2 rounded-xl bg-blue-50 p-4 text-sm text-[#26365e]">
          <strong className="block text-base">
            Nâng tầm dự án với hạ tầng mạnh mẽ
          </strong>
          <p className="mt-1 text-slate-500">
            Hiệu suất cao · Ổn định · Giá tốt
          </p>
          <Link
            to="/customer/dashboard/buy"
            onClick={onNavigate}
            className="mt-3 block rounded-lg bg-blue-600 px-3 py-2 text-center font-semibold text-white"
          >
            Khám phá ngay →
          </Link>
        </div>
      </div>
    </div>
  )
}
