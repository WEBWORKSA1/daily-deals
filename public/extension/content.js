// Daily.Deals content script — runs on retailer pages, detects product, shows banner

(function () {
  'use strict'

  const API_BASE = 'https://daily.deals/api'

  // Detect retailer from hostname
  function getRetailerSlug() {
    const host = location.hostname.replace(/^www\./, '')
    if (host.includes('amazon')) return 'amazon'
    if (host.includes('walmart')) return 'walmart'
    if (host.includes('bestbuy')) return 'bestbuy'
    if (host.includes('target')) return 'target'
    if (host.includes('costco')) return 'costco'
    if (host.includes('homedepot')) return 'homedepot'
    if (host.includes('lowes')) return 'lowes'
    if (host.includes('apple.com')) return 'apple'
    if (host.includes('nike')) return 'nike'
    if (host.includes('sephora')) return 'sephora'
    if (host.includes('ulta')) return 'ulta'
    if (host.includes('macys')) return 'macys'
    if (host.includes('nordstrom')) return 'nordstrom'
    if (host.includes('ebay')) return 'ebay'
    return null
  }

  // Try to extract product title (best-effort across retailers)
  function getProductTitle() {
    const selectors = [
      '#productTitle',                     // Amazon
      'h1[itemprop="name"]',
      '[data-automation-id="product-title"]', // Walmart
      '.heading-5',                        // Best Buy
      'h1.product-title',
      'h1[data-test="product-title"]',     // Target
      'h1#pdp_product_title',              // Nike
      'h1.product-name',
      'h1',
    ]
    for (const sel of selectors) {
      const el = document.querySelector(sel)
      if (el && el.textContent && el.textContent.trim().length > 5) {
        return el.textContent.trim().slice(0, 200)
      }
    }
    return null
  }

  // Don't run on listing/category pages
  function isProductPage() {
    const url = location.pathname
    if (url === '/' || url.length < 5) return false
    // Heuristics — most product URLs have a numeric ID or "/p/" or "/dp/"
    return /\/(dp|product|p|pd|item|sku|prod)\b/i.test(url) ||
           /\/[A-Z0-9]{10,}/i.test(url) ||  // Amazon-style ASINs
           /-\d{6,}/.test(url)              // numeric ID in slug
  }

  async function checkForBetterDeal() {
    if (!isProductPage()) return

    const retailer = getRetailerSlug()
    const title = getProductTitle()
    if (!retailer || !title) return

    // Check if banner already shown
    if (document.getElementById('daily-deals-banner')) return

    try {
      // Search Daily.Deals for this product
      const url = `${API_BASE}/search?q=${encodeURIComponent(title.split(' ').slice(0, 5).join(' '))}&retailer=${retailer}&sort=hottest`
      const res = await fetch(url, { credentials: 'omit' })
      if (!res.ok) return
      const data = await res.json()

      if (!data.deals || data.deals.length === 0) {
        showBanner({
          type: 'no-match',
          message: 'Daily.Deals is watching this retailer for deals.',
        })
        return
      }

      const topDeal = data.deals[0]
      showBanner({
        type: 'match',
        deal: topDeal,
      })
    } catch (e) {
      // Silently fail — extension shouldn't break the page
    }
  }

  function showBanner({ type, deal, message }) {
    const banner = document.createElement('div')
    banner.id = 'daily-deals-banner'
    banner.className = 'daily-deals-banner'

    if (type === 'match' && deal) {
      banner.innerHTML = `
        <div class="dd-logo">DD</div>
        <div class="dd-content">
          <div class="dd-title">🔥 Daily.Deals match found</div>
          <div class="dd-deal">${escape(deal.title)}</div>
          <div class="dd-prices">
            ${deal.deal_price ? `<span class="dd-price">$${deal.deal_price}</span>` : ''}
            ${deal.discount_percent ? `<span class="dd-discount">-${deal.discount_percent}%</span>` : ''}
            ${deal.hotness_score ? `<span class="dd-hot">🔥 ${deal.hotness_score}</span>` : ''}
          </div>
        </div>
        <a href="https://daily.deals/deal/${deal.id}" target="_blank" class="dd-cta">View on Daily.Deals →</a>
        <button class="dd-close" aria-label="Close">×</button>
      `
    } else {
      banner.innerHTML = `
        <div class="dd-logo">DD</div>
        <div class="dd-content">
          <div class="dd-title">Daily.Deals</div>
          <div class="dd-deal">${escape(message || 'Watching for deals on this product.')}</div>
        </div>
        <a href="https://daily.deals" target="_blank" class="dd-cta">Browse deals →</a>
        <button class="dd-close" aria-label="Close">×</button>
      `
    }

    document.body.appendChild(banner)

    banner.querySelector('.dd-close').addEventListener('click', () => banner.remove())
  }

  function escape(s) {
    const div = document.createElement('div')
    div.textContent = s
    return div.innerHTML
  }

  // Wait for page to settle (SPA-friendly)
  if (document.readyState === 'complete') {
    setTimeout(checkForBetterDeal, 2000)
  } else {
    window.addEventListener('load', () => setTimeout(checkForBetterDeal, 2000))
  }

  // Re-check on URL changes (single-page apps)
  let lastUrl = location.href
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href
      const existing = document.getElementById('daily-deals-banner')
      if (existing) existing.remove()
      setTimeout(checkForBetterDeal, 2000)
    }
  }).observe(document, { subtree: true, childList: true })
})()
