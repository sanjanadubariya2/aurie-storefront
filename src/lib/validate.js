export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim())

export const isIndianPhone = (v) => /^[6-9]\d{9}$/.test((v || '').replace(/\D/g, ''))

export const isPincode = (v) => /^[1-9]\d{5}$/.test((v || '').trim())

/** Returns field -> message. An empty object means the form is valid. */
export function validateAddress(a) {
  const e = {}
  if (!a.fullName?.trim()) e.fullName = 'Enter the name for the delivery label'
  if (!isIndianPhone(a.phone)) e.phone = 'Enter a 10-digit Indian mobile number'
  if (!a.line1?.trim()) e.line1 = 'Enter the flat, building and street'
  if (!a.city?.trim()) e.city = 'Enter the city'
  if (!a.state?.trim()) e.state = 'Enter the state'
  if (!isPincode(a.pincode)) e.pincode = 'Enter a valid 6-digit PIN code'
  return e
}
