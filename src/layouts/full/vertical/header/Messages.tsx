import { Link } from '@tanstack/react-router'
import * as MessagesData from './data'
import { Icon } from '@iconify/react'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const Messages = () => {
  return (
    <div className="group/menu relative px-4 sm:px-15">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="relative">
            <span className="hover:text-primary hover:after:bg-lightprimary text-link dark:text-darklink group-hover/menu:after:bg-lightprimary group-hover/menu:!text-primary relative flex cursor-pointer items-center justify-center rounded-full after:absolute after:-top-1/2 after:h-10 after:w-10 after:rounded-full">
              <Icon icon="tabler:bell-ringing" height={20} />
            </span>
            <span className="bg-primary absolute -end-[6px] -top-[5px] flex h-2 w-2 items-center justify-center rounded-full text-[10px]"></span>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="border-ld w-screen rounded-sm border py-6 sm:w-[300px]"
        >
          <div className="flex items-center justify-between px-6">
            <h3 className="text-ld mb-0 text-lg font-semibold">Notification</h3>
            <Badge variant="primary">5 new</Badge>
          </div>

          <SimpleBar className="mt-3 max-h-80">
            {MessagesData.MessagesLink.map((links, index) => (
              <DropdownMenuItem
                className="bg-hover group/link flex w-full items-center justify-between px-6 py-3"
                key={index}
              >
                <Link to="/">
                  <div className="flex items-center">
                    <span className="relative flex-shrink-0">
                      <img
                        src={links.avatar}
                        width={45}
                        height={45}
                        alt="tailwindadmin"
                        className="rounded-full"
                      />
                    </span>
                    <div className="ps-4">
                      <h5 className="group-hover/link:text-primary mb-1 text-sm">
                        {links.title}
                      </h5>
                      <span className="text-darklink block truncate text-xs">
                        {links.subtitle}
                      </span>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </SimpleBar>

          <div className="px-6 pt-5">
            <Button variant={'outline'} className="w-full">
              See All Notifications
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Messages
