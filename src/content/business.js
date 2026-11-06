/**
 * Business details used by the footer, the policy pages and structured data.
 * ⚠ Review before launch: legalName, address and gstin must match the
 * registration Razorpay has on file, or KYC review will flag the site.
 */
const WHATSAPP = import.meta.env.VITE_WHATSAPP || '919769469765'

export const BUSINESS = {
  name: 'Aurie',
  legalName: 'Aurie', // e.g. "Aurie (Proprietor: Your Name)" — must match Razorpay KYC
  city: 'Mumbai',
  state: 'Maharashtra',
  address: 'Mumbai, Maharashtra, India', // full registered address before going live
  gstin: '', // leave blank if not GST-registered
  email: 'orders@aurie.website',
  whatsapp: WHATSAPP,
  whatsappDisplay: `+${WHATSAPP.slice(0, 2)} ${WHATSAPP.slice(2, 7)} ${WHATSAPP.slice(7)}`,
  instagram: import.meta.env.VITE_INSTAGRAM || 'shopaurie.co',
  siteUrl: import.meta.env.VITE_SITE_URL || 'https://www.aurie.website',
  hours: 'Mon–Sat, 10am–7pm IST',
  policiesUpdated: '6 November 2026',
}

export const whatsappLink = (text) =>
  `https://wa.me/${BUSINESS.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`
