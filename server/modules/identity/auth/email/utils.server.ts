import path from 'node:path'
import { env } from '../../../common/env.server'

export function getAppBaseUrl() {
  return env.appUrl
}

export function getPublicAssetPath(assetPath: string) {
  return path.join(process.cwd(), 'public', assetPath.replace(/^\//, ''))
}
