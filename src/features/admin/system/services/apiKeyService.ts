import {
  createApiKey,
  getApiKeys,
  revokeApiKey,
} from '../../../../../server/modules/identity/api-keys/api-keys'
import { unwrapSuccessResponse } from '@/utils/response'

export type ApiKeyView = {
  id: string
  name: string
  keyPrefix: string
  lastUsedAt: string | null
  expiresAt: string | null
  revokedAt: string | null
  createdAt: string
}

export const apiKeyService = {
  list: async (): Promise<ApiKeyView[]> =>
    unwrapSuccessResponse(await getApiKeys()),
  create: async (input: { name: string; expiresAt?: string }) =>
    unwrapSuccessResponse(await createApiKey({ data: input })),
  revoke: async (id: string) =>
    unwrapSuccessResponse(await revokeApiKey({ data: { id } })),
}
