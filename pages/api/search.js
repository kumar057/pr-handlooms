import Product from "../../models/Product"
import { connectMongo } from "../../lib/mongodb"
import { products as websiteProducts } from "../../lib/data"
import { sampleSarees } from "../../lib/sample-sarees"
import { searchExternalPlatforms } from "../../lib/external-scrapers"

const requestLog = global.searchRequestLog || new Map()
global.searchRequestLog = requestLog

const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_MAX = 30

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" })
  }

  try {
    const rateLimited = isRateLimited(req)
    if (rateLimited) {
      return res.status(429).json({ success: false, message: "Too many searches. Please try again shortly." })
    }

    const filters = normalizeFilters(req.query)
    const internal = await searchInternalProducts(filters)
    const external = await searchExternalProducts(filters)

    const results = []

    const max = Math.max(internal.length, external.length)

    for (let i = 0; i < max; i++) {
      if (internal[i]) results.push(internal[i])
      if (external[i]) results.push(external[i])
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      internalCount: internal.length,
      externalCount: external.length,
      results,
    })
  } catch (error) {
    console.error("Search API error:", error)
    return res.status(500).json({
      success: false,
      count: 0,
      internalCount: 0,
      externalCount: 0,
      results: [],
      message: "Search failed. Please try again.",
    })
  }
}

async function searchInternalProducts(filters) {
  let connection = null

  try {
    connection = await connectMongo()
  } catch (error) {
    console.error("Mongo search connection failed; using website products instead:", error)
    return filterWebsiteProducts(filters).map(normalizeWebsiteProduct)
  }

  if (!connection) {
    return filterWebsiteProducts(filters).map(normalizeWebsiteProduct)
  }

  try {
    if (process.env.SEED_SAMPLE_PRODUCTS !== "false" && (await Product.estimatedDocumentCount()) === 0) {
      await Product.insertMany(sampleSarees)
    }

    const query = {}
    const and = []

    if (filters.q) {
      and.push({
        $or: [
          { name: regex(filters.q) },
          { description: regex(filters.q) },
          { category: regex(filters.q) },
          { color: regex(filters.q) },
          { occasion: regex(filters.q) },
          { material: regex(filters.q) },
        ],
      })
    }

    if (filters.category) query.category = regex(filters.category)
    if (filters.color) query.color = regex(filters.color)
    if (filters.occasion) query.occasion = regex(filters.occasion)
    if (filters.minPrice || filters.maxPrice) {
      query.price = {}
      if (filters.minPrice) query.price.$gte = Number(filters.minPrice)
      if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice)
    }

    if (and.length) query.$and = and

    const products = await Product.find(query).sort({ inStock: -1, price: 1 }).limit(24).lean()
    const databaseProducts = products.map(normalizeInternalProduct)
    const databaseNames = new Set(databaseProducts.map((product) => product.name.toLowerCase()))
    const localProducts = filterWebsiteProducts(filters)
      .filter((product) => !databaseNames.has(product.name.toLowerCase()))
      .map(normalizeWebsiteProduct)

    return [...databaseProducts, ...localProducts].slice(0, 24)
  } catch (error) {
    console.error("Mongo product search failed; using website products instead:", error)
    return filterWebsiteProducts(filters).map(normalizeWebsiteProduct)
  }
}

async function searchExternalProducts(filters) {
  try {
    return await searchExternalPlatforms(filters)
  } catch (error) {
    console.error("External marketplace search failed; continuing with internal products only:", error)
    return []
  }
}

function normalizeFilters(query) {
  return {
    q: asString(query.q),
    category: asString(query.category),
    minPrice: asNumberString(query.minPrice),
    maxPrice: asNumberString(query.maxPrice),
    color: asString(query.color),
    occasion: asString(query.occasion),
    includeExternal: asBoolean(query.includeExternal),
  }
}

function filterSampleProducts(filters) {
  const q = filters.q.toLowerCase()
  return sampleSarees.filter((product) => {
    const text = [product.name, product.category, product.color, product.occasion, product.material, product.description]
      .join(" ")
      .toLowerCase()
    if (q && !queryMatches(text, q)) return false
    if (filters.category && product.category.toLowerCase() !== filters.category.toLowerCase()) return false
    if (filters.color && !product.color.toLowerCase().includes(filters.color.toLowerCase())) return false
    if (filters.occasion && product.occasion.toLowerCase() !== filters.occasion.toLowerCase()) return false
    if (filters.minPrice && product.price < Number(filters.minPrice)) return false
    if (filters.maxPrice && product.price > Number(filters.maxPrice)) return false
    return true
  })
}

function queryMatches(text, query) {
  const words = query.split(/[^a-z0-9]+/i).filter((word) => word.length > 2)
  if (!words.length) return true
  return words.some((word) => text.includes(word.toLowerCase()))
}

function filterWebsiteProducts(filters) {
  const q = filters.q.toLowerCase()
  return websiteProducts.filter((product) => {
    const text = [
      product.name,
      product.category,
      product.categoryName,
      product.color,
      product.colors.join(" "),
      product.fabric,
      product.weave,
      product.description,
      product.badges.join(" "),
    ]
      .join(" ")
      .toLowerCase()
    if (q && !queryMatches(text, q)) return false
    if (filters.category && product.categoryName.toLowerCase() !== filters.category.toLowerCase()) return false
    if (filters.color && !text.includes(filters.color.toLowerCase())) return false
    if (filters.occasion && !text.includes(filters.occasion.toLowerCase())) return false
    if (filters.minPrice && product.price < Number(filters.minPrice)) return false
    if (filters.maxPrice && product.price > Number(filters.maxPrice)) return false
    return true
  })
}

function normalizeWebsiteProduct(product) {
  return {
    id: product.id,
    cartProductId: product.id,
    source: "internal",
    name: product.name,
    category: product.categoryName,
    price: product.price,
    images: product.images,
    image: product.image || product.images?.[0] || "/placeholder.jpg",
    description: product.description,
    inStock: product.stock > 0,
    stock: product.stock,
    occasion: inferOccasion(product),
    color: product.color,
    material: product.fabric,
    slug: product.slug,
  }
}

function normalizeInternalProduct(product) {
  const matchingWebsiteProduct = findMatchingWebsiteProduct(product)

  return {
    id: String(product._id || product.name),
    cartProductId: matchingWebsiteProduct?.id,
    source: "internal",
    name: product.name,
    category: product.category,
    price: product.price,
    images: product.images,
    image: product.images?.[0] || "/placeholder.jpg",
    description: product.description,
    inStock: Boolean(product.inStock),
    occasion: product.occasion,
    color: product.color,
    material: product.material,
    slug: matchingWebsiteProduct?.slug,
  }
}

function findMatchingWebsiteProduct(product) {
  const haystack = [product.name, product.category, product.color, product.material, product.description].join(" ").toLowerCase()
  return websiteProducts.find((item) => {
    if (item.name.toLowerCase() === String(product.name || "").toLowerCase()) return true
    const terms = [item.categoryName, item.color, item.fabric, item.weave].map((value) => value.toLowerCase())
    return terms.filter((term) => haystack.includes(term.split(" ")[0])).length >= 2
  })
}

function inferOccasion(product) {
  const text = `${product.name} ${product.description} ${product.badges.join(" ")}`.toLowerCase()
  if (/wedding|bridal/.test(text)) return "Wedding"
  if (/festive|celebration|zari|silk|banarasi|kanjivaram/.test(text)) return "Festive"
  if (/party|sale/.test(text)) return "Party"
  return "Casual"
}

function isRateLimited(req) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "unknown"
  const now = Date.now()
  const record = requestLog.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW }

  if (record.resetAt < now) {
    requestLog.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return false
  }

  record.count += 1
  requestLog.set(ip, record)
  return record.count > RATE_LIMIT_MAX
}

function regex(value) {
  return new RegExp(escapeRegex(value), "i")
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function asString(value) {
  return Array.isArray(value) ? String(value[0] || "").trim() : String(value || "").trim()
}

function asNumberString(value) {
  const stringValue = asString(value)
  if (!stringValue) return ""
  const number = Number(stringValue)
  return Number.isFinite(number) && number >= 0 ? String(number) : ""
}

function asBoolean(value) {
  const stringValue = asString(value).toLowerCase()
  return ["1", "true", "yes"].includes(stringValue)
}
