import { useEffect } from 'react'
import { BUSINESS } from '../content/business.js'

const DEFAULT_TITLE = 'Aurie — candles made to your reference'
const DEFAULT_DESCRIPTION =
  'Small-batch sculptural candles from Mumbai. Festive mithai, blooms, brews and secret-message reveal candles. Made to order.'

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * Sets the tab title, description, canonical URL, Open Graph tags and optional
 * JSON-LD for the current page. Search engines that run JavaScript (Google)
 * read these; link-preview bots that do not (WhatsApp, Instagram) get the same
 * tags from the /api/share function — see vercel.json.
 */
export function useDocumentMeta({ title, description, image, path, jsonLd } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} · Aurie` : DEFAULT_TITLE
    const desc = description || DEFAULT_DESCRIPTION
    const url = `${BUSINESS.siteUrl}${path ?? window.location.pathname}`
    document.title = fullTitle
    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', jsonLd?.['@type'] === 'Product' ? 'product' : 'website')
    if (image) setMeta('property', 'og:image', image)
    setCanonical(url)

    let script
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = JSON.stringify({ '@context': 'https://schema.org', ...jsonLd })
      document.head.appendChild(script)
    }
    return () => script?.remove()
  }, [title, description, image, path, jsonLd])
}
