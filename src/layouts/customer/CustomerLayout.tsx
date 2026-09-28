import { Link } from '@tanstack/react-router'
import { Menu, Search, ShoppingCart, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useCurrentUser } from '@/features/auth/store/authStore'
import CustomerSidebar from './CustomerSidebar'
import { useCustomerCart } from '@/features/customer/commerce/hooks/useCustomerCart'

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const user = useCurrentUser()
  const cart = useCustomerCart()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f3f8ff] text-[#101746]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-slate-100 lg:block">
        <CustomerSidebar />
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="h-full w-60"
            onClick={(event) => event.stopPropagation()}
          >
            <CustomerSidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
      <div className="min-w-0 lg:ml-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 lg:px-7">
          <button
            type="button"
            className="lg:hidden"
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <div className="relative hidden w-full max-w-sm md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <input
              aria-label="Tìm kiếm"
              placeholder="Tìm kiếm dịch vụ, hướng dẫn, ..."
              className="h-10 w-full rounded-lg border border-slate-200 pl-10 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="ml-auto flex items-center gap-5 text-sm text-[#26365e]">
            <Link
              to="/customer/dashboard/cart"
              aria-label="Giỏ hàng"
              className="relative"
            >
              <ShoppingCart size={21} />
              {Boolean(cart.data?.count) && (
                <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {cart.data?.count}
                </span>
              )}
            </Link>
            <span className="hidden sm:inline">🌐 Tiếng Việt⌄</span>
            <span className="flex size-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              {user?.displayName?.slice(0, 2).toUpperCase() ?? 'KH'}
            </span>
            <span className="hidden sm:inline">
              {user?.displayName ?? 'Khách hàng'}⌄
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] px-5 py-6 lg:px-7">
          {children}
        </main>
      </div>
    </div>
  )
}
