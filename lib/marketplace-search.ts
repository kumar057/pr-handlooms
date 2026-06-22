import { extractIntent, unique } from "@/lib/search"

export type MarketplaceName = "Amazon" | "Flipkart" | "Meesho" | "Myntra"

export type OfficialPartnerProduct = {
  id: string
  marketplace: MarketplaceName
  marketplaceProductId: string
  title: string
  productUrl: string
  affiliateUrl: string
  imageUrl?: string
  price: number
  compareAtPrice?: number
  rating?: number
  reviewCount?: number
  deliveryInfo?: string
  brandOrStore: string
  fabric?: string
  color?: string
  occasion?: string
  discount?: number
  deliveryAvailable?: boolean
  tags: string[]
  cachedAt: string
  officialSource: "amazon-paapi" | "flipkart-affiliate-feed" | "meesho-approved-feed" | "myntra-approved-feed"
}

export type PartnerResult = {
  product: OfficialPartnerProduct
  score: number
  reasons: string[]
}

const officialPartnerCacheKey = "prh.official-partner-product-cache"

export function readOfficialPartnerCache(): OfficialPartnerProduct[] {
  if (typeof window === "undefined") return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(officialPartnerCacheKey) || "[]")
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isOfficialPartnerProduct)
  } catch {
    return []
  }
}

export function saveOfficialPartnerCache(products: OfficialPartnerProduct[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(officialPartnerCacheKey, JSON.stringify(products.filter(isOfficialPartnerProduct)))
}

export async function fetchOfficialPartnerResults(query: string): Promise<PartnerResult[]> {
  const cached = readOfficialPartnerCache()

  // Marketplace integrations must be implemented server-side with official credentials:
  // Amazon Product Advertising API, Flipkart Affiliate API/feed, or approved Meesho/Myntra feeds.
  // The client renders only sanitized records from that official cache and never scrapes marketplaces.
  return rankPartnerProducts(query, cached)
}

export function rankPartnerProducts(query: string, products: OfficialPartnerProduct[]): PartnerResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const intent = extractIntent(q)
  const words = unique(q.split(/[^a-z0-9]+/).filter((word) => word.length > 2))

  return products
    .filter((product) => /^https:\/\//i.test(product.affiliateUrl || product.productUrl))
    .map((product) => {
      const text = [
        product.title,
        product.marketplace,
        product.brandOrStore,
        product.fabric,
        product.color,
        product.occasion,
        ...product.tags,
      ].join(" ").toLowerCase()
      const reasons: string[] = []
      let score = 18

      for (const word of words) {
        if (text.includes(word)) score += 4
      }
      for (const color of intent.colors) {
        if (text.includes(color)) {
          score += 20
          reasons.push(`${color} tone`)
        }
      }
      for (const fabric of intent.fabrics) {
        if (text.includes(fabric)) {
          score += 18
          reasons.push(`${fabric} fabric`)
        }
      }
      for (const occasion of intent.occasions) {
        if (text.includes(occasion) || (occasion === "bridal" && /wedding|bridal|zari/.test(text))) {
          score += 16
          reasons.push(`${occasion} occasion`)
        }
      }
      if (intent.budget && product.price <= intent.budget) {
        score += 18
        reasons.push("within budget")
      }
      if (product.deliveryAvailable) {
        score += 5
        reasons.push("delivery available")
      }
      if (product.rating && product.rating >= 4) score += 5

      return { product, score: Math.min(96, score), reasons: unique(reasons).slice(0, 4) }
    })
    .filter((result) => result.score > 22)
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
}

function isOfficialPartnerProduct(value: unknown): value is OfficialPartnerProduct {
  if (!value || typeof value !== "object") return false
  const product = value as Partial<OfficialPartnerProduct>
  const allowedSources: OfficialPartnerProduct["officialSource"][] = [
    "amazon-paapi",
    "flipkart-affiliate-feed",
    "meesho-approved-feed",
    "myntra-approved-feed",
  ]
  return Boolean(
    product.id &&
      product.marketplace &&
      product.marketplaceProductId &&
      product.title &&
      /^https:\/\//i.test(product.productUrl || "") &&
      /^https:\/\//i.test(product.affiliateUrl || "") &&
      typeof product.price === "number" &&
      product.brandOrStore &&
      product.cachedAt &&
      product.officialSource &&
      allowedSources.includes(product.officialSource),
  )
}
