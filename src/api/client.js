/**
 * One place that knows how to talk to the backend.
 *
 * While VITE_API_URL is empty the app runs entirely on the mock handlers in the
 * sibling files, so the UI is fully clickable before any endpoint exists.
 *
 * Sessions are an httpOnly cookie the API sets on sign-in. Page JavaScript
 * never sees the token, so `credentials: 'include'` is all this file does about
 * auth. (Tokens used to live in localStorage, readable by any injected script.)
 */

export const API_URL = import.meta.env.VITE_API_URL || ''
export const LIVE = Boolean(API_URL)

// Clean up the token older builds stored, so it does not linger in the browser.
try {
  window.localStorage.removeItem('aurie.token')
} catch {
  /* storage unavailable — nothing to clean */
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

export async function request(path, { method = 'GET', body, signal } = {}) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include',
      headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0)
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.message || 'Something went wrong. Try again.', res.status, data)
  return data
}

/** Used by the mock handlers so the UI shows real loading states. */
export const delay = (ms = 650) => new Promise((r) => setTimeout(r, ms))
