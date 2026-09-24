import { createServerFn } from '@tanstack/react-start'

import {
  accountResourceIdSchema,
  changeAccountPasswordSchema,
  createAccountAddressSchema,
  updateAccountAvatarSchema,
  updateAccountProfileSchema,
} from './account.schemas'

export const getAccountProfile = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { getAccountProfileForCurrentUser } =
      await import('./account.service.server')
    return getAccountProfileForCurrentUser()
  },
)

export const updateAccountProfile = createServerFn({ method: 'POST' })
  .validator(updateAccountProfileSchema)
  .handler(async ({ data }) => {
    const { updateProfileForCurrentUser } =
      await import('./account.service.server')
    return updateProfileForCurrentUser(data)
  })

export const updateAccountAvatar = createServerFn({ method: 'POST' })
  .validator(updateAccountAvatarSchema)
  .handler(async ({ data }) => {
    const { updateAvatarForCurrentUser } =
      await import('./account.service.server')
    return updateAvatarForCurrentUser(data.avatarUrl)
  })

export const changeAccountPassword = createServerFn({ method: 'POST' })
  .validator(changeAccountPasswordSchema)
  .handler(async ({ data }) => {
    const { changePasswordForCurrentUser } =
      await import('./account.service.server')
    return changePasswordForCurrentUser(data)
  })

export const getAccountMedia = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { getMediaForCurrentUser } = await import('./account.service.server')
    return getMediaForCurrentUser()
  },
)

export const getAccountAddresses = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { getAddressesForCurrentUser } =
      await import('./account.service.server')
    return getAddressesForCurrentUser()
  },
)

export const createAccountAddress = createServerFn({ method: 'POST' })
  .validator(createAccountAddressSchema)
  .handler(async ({ data }) => {
    const { createAddressForCurrentUser } =
      await import('./account.service.server')
    return createAddressForCurrentUser(data)
  })

export const setAccountDefaultAddress = createServerFn({ method: 'POST' })
  .validator(accountResourceIdSchema)
  .handler(async ({ data }) => {
    const { setDefaultAddressForCurrentUser } =
      await import('./account.service.server')
    return setDefaultAddressForCurrentUser(data.id)
  })

export const deleteAccountAddress = createServerFn({ method: 'POST' })
  .validator(accountResourceIdSchema)
  .handler(async ({ data }) => {
    const { deleteAddressForCurrentUser } =
      await import('./account.service.server')
    return deleteAddressForCurrentUser(data.id)
  })

export const getAccountPaymentMethods = createServerFn({
  method: 'GET',
}).handler(async () => {
  const { getPaymentMethodsForCurrentUser } =
    await import('./account.service.server')
  return getPaymentMethodsForCurrentUser()
})

export type AccountProfile = Awaited<ReturnType<typeof getAccountProfile>>
export type AccountAddress = Awaited<
  ReturnType<typeof getAccountAddresses>
>[number]
export type AccountPaymentMethod = Awaited<
  ReturnType<typeof getAccountPaymentMethods>
>[number]
