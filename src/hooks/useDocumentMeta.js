import { useEffect } from 'react'
import { BUSINESS } from '../content/business.js'

const HOME_TITLE = 'Aurie | Sculptural Candles Made to Order in Mumbai'
const DEFAULT_IMAGE = `${BUSINESS.siteUrl}/products/cover.jpg`

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
 * Per-route head tags. Every page calls this with its OWN title, description
 * and path; nothing falls back to the homepage's copy (index.html holds the
 * homepage defaults only). On every route it rewrites the tab title, meta
 * description, robots, canonical URL, Open Graph and Twitter tags, and resets
 * the share image so a product's photo never sticks to the next page.
 *
 * @param {object} o
 * @param {string} [o.title]       page name; "· Aurie" is appended. Omit only on the homepage.
 * @param {string} o.description   one or two sentences unique to this page
 * @param {string} [o.path]        canonical path, e.g. "/p/laddoo" (defaults to the current path)
 * @param {string} [o.image]       absolute image URL for link previews
 * @param {boolean} [o.noindex]    private or utility pages (account, checkout, 404…)
 * @param {object} [o.jsonLd]      schema.org data for this page
 *
 * Search engines that run JavaScript (Google) read these. Link-preview bots
 * that do not (WhatsApp, Instagram) get product tags from api/share.js.
 */
export function useDocumentMeta({ title, description, image, path, noindex = false, jsonLd } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} · Aurie` : HOME_TITLE
    const desc = description || ''
    const url = `${BUSINESS.siteUrl}${path ?? window.location.pathname}`
    const img = image ? image.replace('/f_auto,', '/f_jpg,') : DEFAULT_IMAGE

    document.title = fullTitle
    setMeta('name', 'description', desc)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    setCanonical(url)

    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', jsonLd?.['@type'] === 'Product' ? 'product' : 'website')
    setMeta('property', 'og:image', img)
    setMeta('property', 'og:image:alt', title || 'Aurie candles')

    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)
    setMeta('name', 'twitter:image', img)

    let script
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = JSON.stringify({ '@context': 'https://schema.org', ...jsonLd })
      document.head.appendChild(script)
    }
    return () => script?.remove()
  }, [title, description, image, path, noindex, jsonLd])
}
