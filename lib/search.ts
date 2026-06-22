import { products } from "@/lib/data"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

export const recentSearchesKey = "prh.smart-search.recent"

export const trendingSearches = [
  "bridal silk sarees with gold zari",
  "navy Kanjivaram saree",
  "Banarasi wedding sarees",
  "cotton handloom under Rs. 5000",
  "rose pink silk saree",
]

const colorFamilies: Record<string, string[]> = {
  red: ["red", "maroon", "rose", "pink"],
  maroon: ["maroon", "red"],
  pink: ["pink", "rose"],
  rose: ["rose", "pink"],
  navy: ["navy", "blue"],
  blue: ["blue", "navy", "indigo"],
  teal: ["teal", "green"],
  green: ["green", "emerald", "teal"],
  emerald: ["emerald", "green"],
  gold: ["gold", "golden", "ivory"],
  golden: ["gold", "golden", "ivory"],
  ivory: ["ivory", "cream", "gold"],
  cream: ["cream", "ivory"],
  mustard: ["mustard", "yellow"],
  indigo: ["indigo", "blue"],
}

export type SearchIntent = {
  colors: string[]
  fabrics: string[]
  categories: string[]
  borders: string[]
  occasions: string[]
  budget?: number
}

export type RankedProduct = {
  product: Product
  score: number
  reasons: string[]
}

export function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function searchableProductText(product: Product) {
  return [
    product.name,
    product.categoryName,
    product.category,
    product.fabric,
    product.color,
    product.weave,
    product.description,
    product.origin,
    ...product.colors,
    ...product.badges,
    ...product.details,
  ].join(" ").toLowerCase()
}

export function extractIntent(query: string): SearchIntent {
  const text = query.toLowerCase()
  const budgetMatch =
    text.match(/(?:under|below|less than|within|up to|max(?:imum)?|budget)\s*(?:rs\.?|inr|₹)?\s*([0-9][0-9,]*)/) ||
    text.match(/(?:rs\.?|inr|₹)\s*([0-9][0-9,]*)/)
  const colors = Object.keys(colorFamilies).filter((color) => text.includes(color))
  const fabrics = ["silk", "cotton", "katan", "mulberry", "brocade", "handloom", "ikat"].filter((fabric) =>
    text.includes(fabric),
  )
  const categories = [
    ["bridal", "bridal"],
    ["wedding", "bridal"],
    ["bride", "bridal"],
    ["kanjivaram", "kanjivaram"],
    ["banarasi", "banarasi"],
    ["dupatta", "dupatta"],
    ["fabric", "fabric"],
    ["home", "home"],
    ["party", "celebration"],
    ["festive", "celebration"],
  ]
    .filter(([keyword]) => text.includes(keyword))
    .map(([, value]) => value)
  const borders = ["zari", "gold zari", "golden zari", "temple", "contrast", "peacock", "floral", "brocade"].filter(
    (border) => text.includes(border),
  )

  return {
    colors: unique(colors),
    fabrics: unique(fabrics),
    categories: unique(categories),
    occasions: unique(categories.filter((category) => ["bridal", "celebration"].includes(category))),
    borders: unique(borders),
    budget: budgetMatch ? Number(budgetMatch[1].replace(/,/g, "")) : undefined,
  }
}

function scoreProduct(product: Product, query: string, intent: SearchIntent): RankedProduct {
  const text = searchableProductText(product)
  const words = unique(query.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2))
  const reasons: string[] = []
  let score = 0

  for (const word of words) {
    if (text.includes(word)) score += 4
  }

  for (const color of intent.colors) {
    const family = colorFamilies[color] ?? [color]
    if (family.some((value) => text.includes(value))) {
      score += 28
      reasons.push(`${color} tone`)
    }
  }

  for (const fabric of intent.fabrics) {
    if (text.includes(fabric)) {
      score += 24
      reasons.push(`${fabric} fabric`)
    }
  }

  for (const category of intent.categories) {
    if (category === "bridal") {
      if (/bridal|wedding|zari|banarasi|kanjivaram|limited|silk/.test(text)) {
        score += 22
        reasons.push("bridal occasion")
      }
    } else if (category === "celebration") {
      if (/celebration|festiv|wedding|silk|zari/.test(text)) {
        score += 16
        reasons.push("occasion-ready")
      }
    } else if (text.includes(category)) {
      score += 22
      reasons.push(category)
    }
  }

  for (const border of intent.borders) {
    const terms = border === "golden zari" ? ["gold", "zari"] : border.split(" ")
    if (terms.every((term) => text.includes(term))) {
      score += 18
      reasons.push(border)
    }
  }

  if (intent.budget) {
    if (product.price <= intent.budget) {
      score += 24
      reasons.push(`under ${formatPrice(intent.budget)}`)
    } else {
      const overage = product.price - intent.budget
      score -= Math.min(28, Math.ceil(overage / 1000) * 4)
    }
  }

  if (product.bestSeller) score += 5
  if (product.newArrival) score += 3

  return { product, score, reasons: unique(reasons).slice(0, 4) }
}

export function rankProducts(query: string) {
  const q = query.trim()
  if (!q) {
    return products
      .filter((product) => product.bestSeller)
      .slice(0, 6)
      .map((product) => ({ product, score: 50, reasons: ["trending"] }))
  }

  const intent = extractIntent(q)
  return products
    .map((product) => scoreProduct(product, q, intent))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
}

export function getSuggestions(query: string) {
  const q = query.trim().toLowerCase()
  const pool = [
    ...products.map((product) => product.name),
    ...products.map((product) => `${product.color} ${product.fabric} saree`),
    ...trendingSearches,
  ]
  if (!q) return unique(pool).slice(0, 5)
  return unique(
    pool.filter((item) => item.toLowerCase().includes(q) || q.split(/\s+/).some((word) => item.toLowerCase().includes(word))),
  ).slice(0, 5)
}

export function readRecentSearches() {
  if (typeof window === "undefined") return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(recentSearchesKey) || "[]")
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 5) : []
  } catch {
    return []
  }
}

export function saveRecentSearch(query: string) {
  const value = query.trim()
  if (!value || typeof window === "undefined") return []
  const next = unique([value, ...readRecentSearches()]).slice(0, 5)
  window.localStorage.setItem(recentSearchesKey, JSON.stringify(next))
  return next
}
