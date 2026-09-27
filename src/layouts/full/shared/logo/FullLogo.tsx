import { getRouteApi } from '@tanstack/react-router'
import { Cloud } from 'lucide-react'

const FullLogo = () => {
  const { website } = getRouteApi('__root__').useLoaderData()
  return website.logoUrl ? (
    <img
      src={website.logoUrl}
      alt={website.siteName}
      className="h-20 w-9/10 object-contain"
    />
  ) : (
    <span className="flex items-center gap-2 text-left text-[#101945]">
      <Cloud className="size-11 stroke-[2.2] text-[#075bea]" />
      <span>
        <span className="block text-[19px] font-bold leading-5">
          {website.siteName === 'App Base' ? 'Hostify' : website.siteName}
        </span>
        <span className="block text-[10px] font-normal text-[#697c9c]">
          Admin Panel
        </span>
      </span>
    </span>
  )
}

export default FullLogo
