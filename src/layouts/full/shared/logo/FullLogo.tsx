import { getRouteApi } from '@tanstack/react-router'
import { Cloud } from 'lucide-react'
import type { DashboardArea } from '../../FullLayout'
import { useTranslation } from 'react-i18next'

const FullLogo = ({ area = 'admin' }: { area?: DashboardArea }) => {
  const { t } = useTranslation()
  const { website } = getRouteApi('__root__').useLoaderData()
  return website.logoUrl ? (
    <img
      src={website.logoUrl}
      alt={website.siteName}
      className="h-20 w-9/10 object-contain"
    />
  ) : (
    <span className="flex items-center gap-2 text-left text-foreground">
      <Cloud className="size-11 stroke-[2.2] text-[#075bea]" />
      <span>
        <span className="block text-[19px] font-bold leading-5">
          {website.siteName === 'App Base' ? 'Hostify' : website.siteName}
        </span>
        <span className="block text-[10px] font-normal text-muted-foreground">
          {t(
            area === 'customer'
              ? 'layout.customerTagline'
              : 'layout.adminPanel',
          )}
        </span>
      </span>
    </span>
  )
}

export default FullLogo
