// Shared by the Vercel functions in this folder. Files starting with "_" are
// not deployed as routes.
export const SITE = process.env.SITE_URL || 'https://www.aurie.website'
export const API = (process.env.API_URL || process.env.VITE_API_URL || '').replace(/\/$/, '')

export const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export async function getProducts() {
  if (!API) return []
  const res = await fetch(`${API}/products`, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return (await res.json()).products || []
}
