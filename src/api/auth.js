import { LIVE, request, delay } from './client.js'

/**
 * Backend contract
 *   POST /auth/email/otp     { email }        -> { sent: true }
 *   POST /auth/email/verify  { email, code }  -> { customer }   (+ sets the session cookie)
 *   GET  /auth/me                             -> { customer }   (401 when signed out)
 *   POST /auth/logout                         -> { ok }         (clears the cookie)
 *   POST /auth/phone/otp|verify               kept for when an SMS provider exists
 *
 * In mock mode any 6-digit code is accepted except 000000, which fails so the
 * error state can be checked without a backend.
 */

const MOCK_SESSION = 'aurie.mock.session'

export async function sendEmailOtp(email) {
  if (LIVE) return request('/auth/email/otp', { method: 'POST', body: { email } })
  await delay()
  return { sent: true }
}

export async function verifyEmailOtp(email, code) {
  if (LIVE) {
    const data = await request('/auth/email/verify', { method: 'POST', body: { email, code } })
    return data.customer
  }
  await delay()
  if (code === '000000') throw new Error('That code did not match. Ask for a new one.')
  const customer = { id: 'mock-customer', email, name: email.split('@')[0] }
  window.localStorage.setItem(MOCK_SESSION, JSON.stringify(customer))
  return customer
}

export async function sendPhoneOtp(phone) {
  if (LIVE) return request('/auth/phone/otp', { method: 'POST', body: { phone } })
  await delay()
  return { sent: true }
}

export async function verifyPhoneOtp(phone, code) {
  if (LIVE) return request('/auth/phone/verify', { method: 'POST', body: { phone, code } })
  await delay()
  if (code === '000000') throw new Error('That code did not match. Ask for a new one.')
  return { verified: true }
}

/** The signed-in customer, or null. Only throws on network errors. */
export async function fetchMe() {
  if (!LIVE) {
    try {
      return JSON.parse(window.localStorage.getItem(MOCK_SESSION)) || null
    } catch {
      return null
    }
  }
  try {
    return (await request('/auth/me')).customer
  } catch (err) {
    if (err.status === 401) return null
    throw err
  }
}

export async function signOut() {
  if (!LIVE) {
    window.localStorage.removeItem(MOCK_SESSION)
    return
  }
  await request('/auth/logout', { method: 'POST' }).catch(() => {})
}
