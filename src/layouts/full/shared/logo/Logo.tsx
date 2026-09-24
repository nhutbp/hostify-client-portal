import { getRouteApi } from '@tanstack/react-router'

const Logo = () => {
  const { website } = getRouteApi('__root__').useLoaderData()
  return website.logoUrl ? (
    <img src={website.logoUrl} alt={website.siteName} />
  ) : (
    <span className="font-semibold text-primary">{website.siteName}</span>
  )
}

export default Logo
