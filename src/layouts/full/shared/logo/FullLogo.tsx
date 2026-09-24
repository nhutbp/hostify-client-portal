import { getRouteApi } from '@tanstack/react-router'

const FullLogo = () => {
  const { website } = getRouteApi('__root__').useLoaderData()
  return website.logoUrl ? (
    <img
      src={website.logoUrl}
      alt={website.siteName}
      className="h-20 w-9/10 object-contain"
    />
  ) : (
    <span className="font-semibold text-primary">{website.siteName}</span>
  )
}

export default FullLogo
