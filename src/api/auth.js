import { LIVE, request, delay, setToken } from './client.js'

/**
 * Backend contract
 *   POST /auth/email/otp     { email }              -> { sent: true }
 *   POST /auth/email/verify  { email, code }        -> { token, customer }
 *   POST /auth/phone/otp     { phone }              -> { sent: true, channel: 'sms' | 'email' }
 *                             (channel is 'email' when no SMS provider is configured yet —
 *                              the code goes to the signed-in customer's email instead)
 *   POST /auth/phone/verify  { phone, code }        -> { verified: true }
 *   GET  /auth/me                                   -> { customer }
 *
 * In mock mode any 6-digit code is accepted except 000000, which fails so the
 * error state can be checked without a backend.
 */

export async function sendEmailOtp(email) {
  if (LIVE) return request('/auth/email/otp', { method: 'POST', body: { email }, auth: false })
  await delay()
  return { sent: true }
}

export async function verifyEmailOtp(email, code) {
  if (LIVE) {
    const data = await request('/auth/email/verify', { method: 'POST', body: { email, code }, auth: false })
    setToken(data.token)
    return data.customer
  }
  await delay()
  if (code === '000000') throw new Error('That code did not match. Ask for a new one.')
  setToken('mock-token')
  return { id: 'mock-customer', email, name: email.split('@')[0] }
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

export async function fetchMe() {
  if (LIVE) return request('/auth/me').then((d) => d.customer)
  return null
}

export function signOut() {
  setToken(null)
}
