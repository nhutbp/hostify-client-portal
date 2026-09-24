import type { JSX } from 'react'
import { Link } from '@tanstack/react-router'
import { Panel } from '@/components/common/Panel'

interface BreadcrumbItem {
  title: string
  to?: string
}

interface BreadCrumbType {
  subtitle?: string
  items?: BreadcrumbItem[]
  title: string
  children?: JSX.Element
}

const BreadcrumbComp = ({ title, items = [] }: BreadCrumbType) => {
  return (
    <Panel className="bg-lightsecondary relative mb-6 overflow-hidden rounded-md border-none py-4 shadow-none! dark:shadow-none!">
      <div className="grid grid-cols-12 items-center gap-6">
        <div className="col-span-10">
          <h4 className="mb-3 text-xl font-semibold">{title}</h4>

          <ol
            className="flex items-center whitespace-nowrap"
            aria-label="Breadcrumb"
          >
            {items.map((item, index) => {
              const isLast = index === items.length - 1

              return (
                <li key={index} className="flex items-center">
                  {item.to && !isLast ? (
                    <Link
                      to={item.to}
                      className="text-muted-foreground text-sm leading-none opacity-80 hover:underline"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <span
                      className="text-muted-foreground text-sm leading-none"
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {item.title}
                    </span>
                  )}

                  {!isLast && (
                    <span className="bg-muted-foreground mx-2.5 rounded-full p-0.5" />
                  )}
                </li>
              )
            })}
          </ol>
        </div>

        <div className="col-span-2 -mb-7 flex max-h-[120px] max-w-[140px] justify-center">
          <div className="absolute right-7 bottom-0 hidden sm:block">
            <img
              src={'/background-3.jpg'}
              alt="support-img"
              width={145}
              height={95}
            />
          </div>
        </div>
      </div>
    </Panel>
  )
}

export default BreadcrumbComp
