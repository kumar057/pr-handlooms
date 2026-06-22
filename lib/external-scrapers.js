import axios from "axios"
import * as cheerio from "cheerio"
import NodeCache from "node-cache"

export const platformMeta = {
  amazon: {
    platform: "amazon",
    platformName: "Amazon",
    platformLogo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    searchUrl: (query) => `https://www.amazon.in/s?k=${encodeURIComponent(`${query} saree`)}`,
  },
  flipkart: {
    platform: "flipkart",
    platformName: "Flipkart",
    platformLogo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Flipkart_logo.svg",
    searchUrl: (query) => `https://www.flipkart.com/search?q=${encodeURIComponent(`${query} saree`)}`,
  },
  myntra: {
    platform: "myntra",
    platformName: "Myntra",
    platformLogo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Myntra_logo.png",
    searchUrl: (query) => `https://www.myntra.com/sarees?rawQuery=${encodeURIComponent(query)}`,
  },
}

const externalCache = global.externalSearchCache || new NodeCache({ stdTTL: 60 * 60 * 24, checkperiod: 60 * 30 })
global.externalSearchCache = externalCache

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
  "Accept-Language": "en-IN,en;q=0.9",
}

const SCRAPINGBEE_ENDPOINT = "https://app.scrapingbee.com/api/v1/"

export async function searchExternalPlatforms(filters) {
  const cacheKey = JSON.stringify({
    q: filters.q || "",
    category: filters.category || "",
    minPrice: filters.minPrice || "",
    maxPrice: filters.maxPrice || "",
    color: filters.color || "",
    occasion: filters.occasion || "",
  })
  const cached = externalCache.get(cacheKey)
  if (cached) return cached

  const query = buildExternalQuery(filters)
  const results = await withTimeout(
    Promise.allSettled([
      scrapeAmazon(query),
      scrapeFlipkart(query),
      scrapeMyntra(query),
    ]),
    10000,
    [],
  )

  const flattened = results
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .filter((product) => priceInRange(product.price, filters.minPrice, filters.maxPrice))
    .slice(0, 12)

  const platformCount = new Set(flattened.map((product) => product.platform)).size
  if (flattened.length > 0 && (process.env.SCRAPINGBEE_API_KEY || platformCount > 1)) {
    externalCache.set(cacheKey, flattened)
  }

  return flattened
}

async function scrapeAmazon(query) {
  const meta = platformMeta.amazon
  const html = await fetchMarketplaceHtml(meta.searchUrl(query), { renderJs: false })
  const $ = cheerio.load(html)
  const products = []

  $('[data-component-type="s-search-result"]').each((_, item) => {
    if (products.length >= 4) return false
    const card = $(item)
    const image = card.find("img.s-image").attr("src")
    const name = cleanName(card.find("h2 span").first().text().trim(), card.find("img.s-image").attr("alt"))
    const price = parsePrice(card.find(".a-price .a-offscreen").first().text())
    const href = card.find("a.a-link-normal.s-no-outline").attr("href") || card.find("h2 a").attr("href")
    if (!name || !price || !href) return
    products.push(normalizeExternalProduct(meta, { name, price, image, href }))
  })

  return products
}

async function scrapeFlipkart(query) {
  const meta = platformMeta.flipkart
  const html = await fetchMarketplaceHtml(meta.searchUrl(query), { renderJs: true })
  const $ = cheerio.load(html)
  const products = []

  $("[data-id], a[href*='/p/'], a[href*='pid=']").each((_, item) => {
    if (products.length >= 4) return false
    const node = $(item)
    const card = node.is("[data-id]") ? node : node.closest("[data-id]").length ? node.closest("[data-id]") : node.closest("div")
    const anchor = node.is("a") ? node : card.find("a[href*='/p/'], a[href*='pid=']").first()
    const href = anchor.attr("href")
    const name = cleanName(
      card.find("div[class*='KzDlHZ'], a[class*='wjcEIp'], div[class*='syl9yP']").first().text().trim() ||
        anchor.attr("title") ||
        nameFromHref(href) ||
        anchor.text().trim(),
      card.find("img").first().attr("alt"),
    )
    const price = parsePrice(card.find("div[class*='Nx9bqj'], div[class*='_30jeq3']").first().text()) || parsePrice(card.text())
    const image = getBestImage(card)
    if (!name || !price || !href) return
    products.push(normalizeExternalProduct(meta, { name, price, image, href }))
  })

  return dedupeProducts(products)
}

async function scrapeMyntra(query) {
  const meta = platformMeta.myntra
  const html = await fetchMarketplaceHtml(meta.searchUrl(query), { renderJs: true })
  const $ = cheerio.load(html)
  const products = parseMyntraPayload(html, meta)

  $("li.product-base, a[href*='/sarees/'], a[href*='/saree/']").each((_, item) => {
    if (products.length >= 4) return false
    const node = $(item)
    const anchor = node.is("a") ? node : node.find("a").first()
    const brand = node.find(".product-brand").first().text().trim()
    const productName = node.find(".product-product").first().text().trim()
    const name = cleanName([brand, productName].filter(Boolean).join(" "), node.find("img").first().attr("alt") || anchor.attr("title"))
    const price = parsePrice(node.find(".product-discountedPrice, .product-price").first().text())
    const image = getBestImage(node)
    const href = anchor.attr("href")
    if (!name || !price || !href) return
    products.push(normalizeExternalProduct(meta, { name, price, image, href }))
  })

  return dedupeProducts(products)
}

async function fetchMarketplaceHtml(url, { renderJs }) {
  if (process.env.SCRAPINGBEE_API_KEY) {
    const response = await axios.get(SCRAPINGBEE_ENDPOINT, {
      timeout: 9000,
      params: {
        api_key: process.env.SCRAPINGBEE_API_KEY,
        url,
        render_js: renderJs ? "true" : "false",
        country_code: "in",
        premium_proxy: "true",
        block_ads: "true",
      },
    })

    return response.data
  }

  const response = await axios.get(url, { headers, timeout: 7000 })
  return response.data
}

async function scrapeWithPuppeteer(platform, query) {
  const meta = platformMeta[platform]
  let browser

  try {
    const puppeteer = await import("puppeteer")
    browser = await puppeteer.default.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    })
    const page = await browser.newPage()
    await page.setUserAgent(headers["User-Agent"])
    await page.setDefaultNavigationTimeout(8000)
    await page.goto(meta.searchUrl(query), { waitUntil: "domcontentloaded", timeout: 8000 })

    const products = await page.evaluate((platformName) => {
      const rupeeToNumber = (value) => {
        const text = value || ""
        const match = text.match(/(?:₹|Rs\.?|INR)?\s*([0-9][0-9,]*)/)
        return match ? Number(match[1].replace(/,/g, "")) : 0
      }
      const absoluteUrl = (href) => {
        if (!href) return ""
        if (href.startsWith("http")) return href
        if (platformName === "Flipkart") return `https://www.flipkart.com${href}`
        return `https://www.myntra.com${href.startsWith("/") ? "" : "/"}${href}`
      }

      if (platformName === "Flipkart") {
        return Array.from(document.querySelectorAll("a[href*='/p/'], a[href*='pid=']"))
          .map((anchor) => {
            const parent = anchor.closest("div")
            const name =
              parent?.querySelector("div[class*='KzDlHZ'], a[class*='wjcEIp'], div[class*='syl9yP']")?.textContent?.trim() ||
              parent?.querySelector("img")?.alt ||
              anchor.textContent?.trim()
            const priceText = parent?.querySelector("div[class*='Nx9bqj'], div[class*='_30jeq3']")?.textContent
            const image = parent?.querySelector("img")?.src
            return { name, price: rupeeToNumber(priceText), image, href: absoluteUrl(anchor.getAttribute("href")) }
          })
          .filter((item) => item.name && item.price && item.href)
          .slice(0, 4)
      }

      return Array.from(document.querySelectorAll("li.product-base, a[href*='/sarees/'], a[href*='/saree/']"))
        .map((node) => {
          const anchor = node.matches("a") ? node : node.querySelector("a")
          const name =
            node.querySelector(".product-product, .product-brand")?.textContent?.trim() ||
            node.querySelector("img")?.alt ||
            anchor?.getAttribute("title") ||
            anchor?.textContent?.trim()
          const priceText = node.querySelector(".product-discountedPrice, .product-price")?.textContent
          const image = node.querySelector("img")?.src
          return { name, price: rupeeToNumber(priceText), image, href: absoluteUrl(anchor?.getAttribute("href")) }
        })
        .filter((item) => item.name && item.price && item.href)
        .slice(0, 4)
    }, meta.platformName)

    return products.map((product) => normalizeExternalProduct(meta, product))
  } catch {
    return []
  } finally {
    if (browser) await browser.close()
  }
}

function normalizeExternalProduct(meta, product) {
  const url = product.href?.startsWith("http") ? product.href : new URL(product.href, meta.searchUrl("saree")).toString()
  return {
    id: `${meta.platform}-${hashString(url)}`,
    source: "external",
    platform: meta.platform,
    platformName: meta.platformName,
    platformLogo: meta.platformLogo,
    name: product.name,
    price: product.price,
    image: normalizeImageUrl(product.image) || "/placeholder.jpg",
    url,
  }
}

function parseMyntraPayload(html, meta) {
  const marker = '"productDetails":'
  const markerIndex = html.indexOf(marker)
  if (markerIndex < 0) return []

  try {
    const arrayStart = html.indexOf("[", markerIndex + marker.length)
    const arrayText = extractBalancedJson(html, arrayStart)
    const items = JSON.parse(arrayText)

    return items
      .map((item) =>
        normalizeExternalProduct(meta, {
          name: [item.brandsFacet, item.additionalInfo || item.listViewName || item.styleName].filter(Boolean).join(" "),
          price: item.discountedPrice || item.price,
          image: item.imageUrl || item.images?.[0]?.src,
          href: item.landingPageUrl,
        }),
      )
      .filter((product) => product.name && product.price && product.url)
      .slice(0, 4)
  } catch {
    return []
  }
}

function extractBalancedJson(text, startIndex) {
  let depth = 0
  let inString = false
  let escaped = false

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index]

    if (inString) {
      if (escaped) {
        escaped = false
      } else if (char === "\\") {
        escaped = true
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') inString = true
    if (char === "[") depth += 1
    if (char === "]") depth -= 1
    if (depth === 0) return text.slice(startIndex, index + 1)
  }

  return "[]"
}

function getBestImage(node) {
  const images = node.find("img").toArray()
  for (const image of images) {
    const img = image.attribs || {}
    const candidate =
      img.src ||
      img["data-src"] ||
      img["data-lazy-src"] ||
      img.srcset?.split(/\s+/)[0]
    if (candidate && !/placeholder|data:image/i.test(candidate)) return candidate
  }
  return ""
}

function dedupeProducts(products) {
  const seen = new Set()
  return products.filter((product) => {
    if (seen.has(product.url)) return false
    seen.add(product.url)
    return true
  })
}

function cleanName(name, fallback) {
  const value = String(name || "").trim()
  if (value && !/^generic$/i.test(value)) return value
  return String(fallback || metaFallbackName).trim()
}

function nameFromHref(href) {
  const slug = String(href || "")
    .split("/p/")[0]
    .split("/")
    .filter(Boolean)
    .pop()
  if (!slug) return ""
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function normalizeImageUrl(image) {
  const value = String(image || "").trim()
  if (!value) return ""
  if (value.startsWith("//")) return `https:${value}`
  if (value.startsWith("http://assets.myntassets.com")) return value.replace("http://", "https://")
  return value
}

const metaFallbackName = "Saree"

function hashString(value) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash.toString(36)
}

function buildExternalQuery(filters) {
  return [filters.q, filters.category, filters.color, filters.occasion].filter(Boolean).join(" ").trim() || "saree"
}

function parsePrice(value) {
  const text = String(value || "")
  const match = text.match(/(?:₹|Rs\.?|INR)\s*([0-9][0-9,]*)/)
  const numeric = Number((match?.[1] || text).replace(/[^0-9]/g, ""))
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null
}

function priceInRange(price, minPrice, maxPrice) {
  if (minPrice && price < Number(minPrice)) return false
  if (maxPrice && price > Number(maxPrice)) return false
  return true
}

async function withTimeout(promise, timeoutMs, fallback) {
  let timer
  try {
    return await Promise.race([
      promise,
      new Promise((resolve) => {
        timer = setTimeout(() => resolve(fallback), timeoutMs)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}
