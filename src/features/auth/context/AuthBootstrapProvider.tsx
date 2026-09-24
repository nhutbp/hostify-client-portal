import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types/auth'

type AuthBootstrapState = {
  user: User | null
}

const AuthBootstrapContext = createContext<AuthBootstrapState | null>(null)

export function AuthBootstrapProvider({
  user,
  children,
}: {
  user: User | null
  children: ReactNode
}) {
  return (
    <AuthBootstrapContext.Provider value={{ user }}>
      {children}
    </AuthBootstrapContext.Provider>
  )
}

export function useAuthBootstrap() {
  return useContext(AuthBootstrapContext)
}
