import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth.js'
import { getToken } from '../api/client.js'
import { read, write, clear } from '../lib/storage.js'

const AuthContext = createContext(null)
const KEY = 'aurie.customer'

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => (getToken() ? read(KEY, null) : null))
  const [authOpen, setAuthOpen] = useState(false)
  const [afterAuth, setAfterAuth] = useState(null)

  useEffect(() => {
    if (!getToken()) return
    authApi.fetchMe().then((c) => {
      if (c) {
        setCustomer(c)
        write(KEY, c)
      }
    })
  }, [])

  const signIn = useCallback(
    (c) => {
      setCustomer(c)
      write(KEY, c)
      setAuthOpen(false)
      if (afterAuth) {
        afterAuth()
        setAfterAuth(null)
      }
    },
    [afterAuth],
  )

  const signOut = useCallback(() => {
    authApi.signOut()
    clear(KEY)
    setCustomer(null)
  }, [])

  /** Run `action` if signed in, otherwise open the sign-in sheet and run it after. */
  const requireAuth = useCallback(
    (action) => {
      if (customer) return action()
      setAfterAuth(() => action)
      setAuthOpen(true)
      return undefined
    },
    [customer],
  )

  const value = useMemo(
    () => ({ customer, signIn, signOut, requireAuth, authOpen, setAuthOpen }),
    [customer, signIn, signOut, requireAuth, authOpen],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
