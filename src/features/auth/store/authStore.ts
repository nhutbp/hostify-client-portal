import { useQueryClient } from '@tanstack/react-query'
import { createStore, useSelector } from '@tanstack/react-store'
import { useAuthBootstrap } from '../context/AuthBootstrapProvider'
import { authService } from '../services/authService'
import type { AuthState, LoginRequest, User } from '../types/auth'

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<User>
  clear: () => void
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

export const authStore = createStore(initialState)

const setAuthState = (nextState: Partial<AuthState>) => {
  authStore.setState((prev) => ({ ...prev, ...nextState }))
}

const resetAuthState = () => {
  setAuthState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  })
}

export const useAuthActions = () => {
  const queryClient = useQueryClient()

  return {
    login: async (credentials: LoginRequest) => {
      try {
        queryClient.clear()
        setAuthState({ isLoading: true })

        const user = await authService.login(credentials)
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
        return user
      } catch (error) {
        setAuthState({ isLoading: false })
        throw error
      }
    },

    clear: () => {
      queryClient.clear()

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('logout'))
      }

      resetAuthState()
    },
  } satisfies AuthActions
}

export const useAuth = () => {
  const state = useSelector(authStore)
  const bootstrap = useAuthBootstrap()
  const authActions = useAuthActions()

  const user = state.isLoading ? (bootstrap?.user ?? state.user) : state.user
  const isAuthenticated = state.isLoading
    ? Boolean(bootstrap?.user)
    : state.isAuthenticated
  const isLoading = state.isLoading

  return {
    ...state,
    user,
    isAuthenticated,
    isLoading,
    ...authActions,
  }
}

export const useCurrentUser = () => {
  const state = useSelector(authStore, (store) => store)
  const bootstrap = useAuthBootstrap()
  return state.isLoading ? (bootstrap?.user ?? state.user) : state.user
}

export const useCurrentUserId = () => {
  const user = useCurrentUser()
  return user?.id ?? null
}
