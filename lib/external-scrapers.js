import axios from "axios"
import * as cheerio from "cheerio"
import NodeCache from "node-cache"

export const platformMeta = {
  amazon: {
    platform: "amazon",
    platformName: "Amazon",
    platformLogo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    searchUrl: (query) => `https://www.amazon.in/s?k=${encodeURIComponent(withSareeKeyword(query))}`,
  },
  flipkart: {
    platform: "flipkart",
    platformName: "Flipkart",
    platformLogo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Flipkart_logo.svg",
    searchUrl: (query) => `https://www.flipkart.com/search?q=${encodeURIComponent(withSareeKeyword(query))}`,
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
const MIN_PRODUCTS_PER_PLATFORM = 3
const MAX_PRODUCTS_PER_PLATFORM = 4

export async function searchExternalPlatforms(filters) {
  console.log("Searching external platforms for:", filters)

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

  const scrapers = [
    { label: "Amazon", fn: () => scrapeAmazon(query) },
    { label: "Flipkart", fn: () => scrapeFlipkart(query) },
    { label: "Myntra", fn: () => scrapeMyntra(query) },
  ]

  const results = await withTimeout(Promise.allSettled(scrapers.map((scraper) => scraper.fn())), 25000, [])

  console.log("=== SCRAPER RESULTS ===")
  results.forEach((r, i) => {
    console.log(
      scrapers[i].label,
      r.status,
      r.status === "fulfilled" ? r.value.length : getHttpErrorMessage(r.reason)
    )
  })

  const productsByPlatform = scrapers.map((_, index) => {
    const result = results[index]
    return result?.status === "fulfilled" ? result.value : []
  })
  const scrapedProducts = productsByPlatform
    .flat()
    .filter((product) => product.image && product.image !== "/placeholder.jpg")
    .filter((product) => priceInRange(product.price, filters.minPrice, filters.maxPrice))

  const flattened = scrapedProducts.slice(0, 12)

  console.log("Flattened products:", flattened.length)

  externalCache.set(cacheKey, flattened)
  return flattened
}

async function scrapeAmazon(query) {
  const meta = platformMeta.amazon
  const html = await fetchMarketplaceHtml(meta.searchUrl(query), { renderJs: false })
  const $ = cheerio.load(html)
  const products = []

  $('[data-component-type="s-search-result"]').each((_, item) => {
    if (products.length >= MAX_PRODUCTS_PER_PLATFORM) return false
    const card = $(item)
    const imageNode = card.find("img.s-image").first()
    const image = getBestImage(card) || imageNode.attr("src")
    const title = card.find("h2 span").first().text().trim() || card.find("h2").first().text().trim()
    const name = cleanName(title, imageNode.attr("alt"))
    const price = parsePrice(card.find(".a-price .a-offscreen").first().text())
    const href = card.find("a.a-link-normal.s-no-outline").attr("href") || card.find("h2 a").attr("href")
    if (!name || !price || !image || !href) return
    products.push(normalizeExternalProduct(meta, { name, price, image, href }))
  })

  return fillRealProducts("amazon", query, products)
}

async function scrapeFlipkart(query) {
  const meta = platformMeta.flipkart
  const html = await fetchMarketplaceHtml(meta.searchUrl(query), { renderJs: true })
  const $ = cheerio.load(html)
  const products = []

  $("[data-id], a[href*='/p/'], a[href*='pid=']").each((_, item) => {
    if (products.length >= MAX_PRODUCTS_PER_PLATFORM) return false
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
    if (!name || !price || !image || !href) return
    products.push(normalizeExternalProduct(meta, { name, price, image, href }))
  })

  return fillRealProducts("flipkart", query, dedupeProducts(products))
}

async function scrapeMyntra(query) {
  const meta = platformMeta.myntra
  const html = await fetchMarketplaceHtml(meta.searchUrl(query), { renderJs: true })
  const $ = cheerio.load(html)
  const products = parseMyntraPayload(html, meta)

  $("li.product-base, a[href*='/sarees/'], a[href*='/saree/']").each((_, item) => {
    if (products.length >= MAX_PRODUCTS_PER_PLATFORM) return false
    const node = $(item)
    const anchor = node.is("a") ? node : node.find("a").first()
    const brand = node.find(".product-brand").first().text().trim()
    const productName = node.find(".product-product").first().text().trim()
    const name = cleanName([brand, productName].filter(Boolean).join(" "), node.find("img").first().attr("alt") || anchor.attr("title"))
    const price = parsePrice(node.find(".product-discountedPrice, .product-price").first().text())
    const image = getBestImage(node)
    const href = anchor.attr("href")
    if (!name || !price || !image || !href) return
    products.push(normalizeExternalProduct(meta, { name, price, image, href }))
  })

  return fillRealProducts("myntra", query, dedupeProducts(products))
}

async function fetchMarketplaceHtml(url, { renderJs }) {
  if (process.env.SCRAPINGBEE_API_KEY) {
    try {
      const response = await axios.get(SCRAPINGBEE_ENDPOINT, {
        timeout: 20000,
        params: {
          api_key: process.env.SCRAPINGBEE_API_KEY,
          url,
          render_js: renderJs ? "true" : "false",
          country_code: "in",
          premium_proxy: "true",
          stealth_proxy: "true",
          block_ads: "true",
        },
      })

      return typeof response.data === "string" ? response.data : JSON.stringify(response.data || "")
    } catch (error) {
      console.warn("ScrapingBee marketplace fetch failed; trying direct request:", getHttpErrorMessage(error))
    }
  }

  const response = await axios.get(url, { headers, timeout: 7000 })
  return response.data
}

function getHttpErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.response?.status) return `${error.response.status} ${error.response.statusText || ""}`.trim()
  return error instanceof Error ? error.message : "Unknown fetch error"
}

async function fillRealProducts(platform, query, products) {
  if (products.length >= MIN_PRODUCTS_PER_PLATFORM) return products.slice(0, MAX_PRODUCTS_PER_PLATFORM)

  const renderedProducts = await scrapeWithPuppeteer(platform, query)
  return dedupeProducts([...products, ...renderedProducts]).slice(0, MAX_PRODUCTS_PER_PLATFORM)
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
        const numeric = Number((match?.[1] || text).replace(/[^0-9]/g, ""))
        return Number.isFinite(numeric) ? numeric : 0
      }
      const absoluteUrl = (href) => {
        if (!href) return ""
        if (href.startsWith("http")) return href
        if (platformName === "Flipkart") return `https://www.flipkart.com${href}`
        return `https://www.myntra.com${href.startsWith("/") ? "" : "/"}${href}`
      }

      if (platformName === "Amazon") {
        return Array.from(document.querySelectorAll("[data-component-type='s-search-result']"))
          .map((card) => {
            const image = card.querySelector("img.s-image")
            const anchor = card.querySelector("a.a-link-normal.s-no-outline") || card.querySelector("h2 a")
            const name =
              card.querySelector("h2 span")?.textContent?.trim() ||
              image?.getAttribute("alt") ||
              anchor?.textContent?.trim()
            const priceText = card.querySelector(".a-price .a-offscreen")?.textContent || card.textContent
            const href = anchor?.getAttribute("href")
            return {
              name,
              price: rupeeToNumber(priceText),
              image: image?.getAttribute("src"),
              href: href?.startsWith("http") ? href : `https://www.amazon.in${href || ""}`,
            }
          })
          .filter((item) => item.name && item.price && item.image && item.href)
          .slice(0, 4)
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
          .filter((item) => item.name && item.price && item.image && item.href)
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
        .filter((item) => item.name && item.price && item.image && item.href)
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
    name: cleanName(product.name, meta.platformName),
    price: product.price,
    image: normalizeImageUrl(product.image) || "/placeholder.jpg",
    url,
  }
}

function parseMyntraPayload(html, meta) {
  const productDetails = parseMyntraProductDetails(html)
  if (productDetails.length) return normalizeMyntraItems(productDetails, meta)

  const myxProducts = parseMyntraMyxPayload(html)
  if (myxProducts.length) return normalizeMyntraItems(myxProducts, meta)

  return []
}

function parseMyntraProductDetails(html) {
  const marker = '"productDetails":'
  const markerIndex = html.indexOf(marker)
  if (markerIndex < 0) return []

  try {
    const arrayStart = html.indexOf("[", markerIndex + marker.length)
    const arrayText = extractBalancedJson(html, arrayStart)
    return JSON.parse(arrayText)
  } catch {
    return []
  }
}

function parseMyntraMyxPayload(html) {
  const markerIndex = html.indexOf("window.__myx")
  if (markerIndex < 0) return []

  try {
    const objectStart = html.indexOf("{", markerIndex)
    const payload = JSON.parse(extractBalancedJson(html, objectStart))
    const products =
      payload?.searchData?.results?.products ||
      payload?.searchData?.results?.productList ||
      payload?.results?.products ||
      payload?.products
    return Array.isArray(products) ? products : []
  } catch {
    return []
  }
}

function normalizeMyntraItems(items, meta) {
  return items
    .map((item) => {
      const href = item.landingPageUrl || item.productUrl || item.url
      if (!href) return null

      return normalizeExternalProduct(meta, {
        name: [
          item.brandsFacet || item.brand || item.brandName,
          item.additionalInfo || item.productName || item.product || item.listViewName || item.styleName,
        ]
          .filter(Boolean)
          .join(" "),
        price: Number(item.discountedPrice || item.price || item.mrp),
        image: item.searchImage || item.imageUrl || item.defaultImage || item.images?.[0]?.src || item.images?.[0],
        href,
      })
    })
    .filter(Boolean)
    .filter((product) => product.name && product.price && product.image && product.image !== "/placeholder.jpg" && product.url)
    .slice(0, MAX_PRODUCTS_PER_PLATFORM)
}

function extractBalancedJson(text, startIndex) {
  if (startIndex < 0) return "[]"
  let depth = 0
  let inString = false
  let escaped = false
  const openChar = text[startIndex]
  const closeChar = openChar === "{" ? "}" : "]"

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
    if (char === openChar) depth += 1
    if (char === closeChar) depth -= 1
    if (depth === 0) return text.slice(startIndex, index + 1)
  }

  return openChar === "{" ? "{}" : "[]"
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
  const fallbackValue = String(fallback || metaFallbackName).trim()
  if (!value || /^generic$/i.test(value)) return fallbackValue
  if (value.length < 12 && fallbackValue.length > value.length) return fallbackValue
  return value
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

function withSareeKeyword(query) {
  const value = String(query || "").trim()
  if (!value) return "saree"
  return /\bsarees?\b/i.test(value) ? value : `${value} saree`
}

function parsePrice(value) {
  const text = String(value || "")
  const rupeeMatch = text.match(/₹\s*([0-9][0-9,]*)/)
  const match = text.match(/(?:₹|Rs\.?|INR)\s*([0-9][0-9,]*)/)
  const numeric = Number((rupeeMatch?.[1] || match?.[1] || text).replace(/[^0-9]/g, ""))
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
