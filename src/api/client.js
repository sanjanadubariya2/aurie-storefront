/**
 * One place that knows how to talk to the backend.
 *
 * While VITE_API_URL is empty the app runs entirely on the mock handlers in the
 * sibling files, so the UI is fully clickable before any endpoint exists.
 * Set VITE_API_URL in .env and every call below switches to the real server.
 */

export const API_URL = import.meta.env.VITE_API_URL || ''
export const LIVE = Boolean(API_URL)

const TOKEN_KEY = 'aurie.token'

export const getToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setToken = (token) => {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0)
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.message || 'Something went wrong. Try again.', res.status)
  return data
}

/** Used by the mock handlers so the UI shows real loading states. */
export const delay = (ms = 650) => new Promise((r) => setTimeout(r, ms))
