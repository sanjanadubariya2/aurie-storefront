import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth.js'
import { read, write, clear } from '../lib/storage.js'

const AuthContext = createContext(null)
const KEY = 'aurie.customer'

export function AuthProvider({ children }) {
  // The cached profile paints the header instantly; /auth/me then confirms the
  // cookie session is still valid and corrects it if not.
  const [customer, setCustomer] = useState(() => read(KEY, null))
  const [checked, setChecked] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [afterAuth, setAfterAuth] = useState(null)

  useEffect(() => {
    authApi
      .fetchMe()
      .then((c) => {
        setCustomer(c)
        if (c) write(KEY, c)
        else clear(KEY)
      })
      .catch(() => {
        /* offline — keep the cached profile; requests will say so */
      })
      .finally(() => setChecked(true))
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

  const signOut = useCallback(async () => {
    setCustomer(null)
    clear(KEY)
    await authApi.signOut()
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
    () => ({ customer, checked, signIn, signOut, requireAuth, authOpen, setAuthOpen }),
    [customer, checked, signIn, signOut, requireAuth, authOpen],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
