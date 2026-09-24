import { Filter, RotateCcw, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export function MobileFilterSheet({ title = 'Bộ lọc', activeCount = 0, onReset, children }: { title?: string; activeCount?: number; onReset?: () => void; children: ReactNode }) {
  return <Sheet><div className="flex justify-end md:hidden"><SheetTrigger asChild><Button variant="outline" size="sm" className="relative h-10 w-10 shrink-0 p-0" aria-label={title} title={title}><Filter className="h-4 w-4" />{activeCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white">{activeCount}</span>}</Button></SheetTrigger></div><SheetContent side="bottom" className="max-h-[85vh] rounded-t-3xl px-5 pb-6"><SheetHeader className="mb-5 flex-row items-center justify-between gap-2 space-y-0 pr-12 text-left"><SheetTitle className="min-w-0 truncate">{title}</SheetTitle>{onReset && <Button variant="ghost" size="sm" className="shrink-0" onClick={onReset}><RotateCcw className="mr-1 h-4 w-4" />Đặt lại</Button>}</SheetHeader><div className="max-h-[calc(85vh-8rem)] space-y-4 overflow-y-auto">{children}</div><SheetClose asChild><Button className="mt-5 w-full">Áp dụng bộ lọc</Button></SheetClose><SheetClose className="absolute right-5 top-5"><X className="h-5 w-5" /></SheetClose></SheetContent></Sheet>
}
