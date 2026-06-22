import type { Product } from "@/lib/types"

export type SareeDetection = {
  color: string
  pattern: string
  fabric: string
  borderStyle: string
  workType: string
  design: string
  tags: string[]
  confidence: number
}

export type ProductMatch = {
  product: Product
  score: number
  matchedTags: string[]
}

export type PartnerName = "Amazon" | "Flipkart" | "Meesho" | "Myntra"

export type PartnerProduct = {
  id: string
  partner: PartnerName
  name: string
  productUrl: string
  affiliateUrl?: string
  imageUrl?: string
  estimatedPrice: number
  tags: string[]
  enabled: boolean
}

export type PartnerSearchSettings = {
  enabled: boolean
  products: PartnerProduct[]
}

export const PARTNER_SETTINGS_KEY = "prh.image-search.partners"

const defaultPartnerSettings: PartnerSearchSettings = {
  enabled: false,
  products: [],
}

export function readPartnerSettings(): PartnerSearchSettings {
  if (typeof window === "undefined") return defaultPartnerSettings
  try {
    const value = window.localStorage.getItem(PARTNER_SETTINGS_KEY)
    return value ? (JSON.parse(value) as PartnerSearchSettings) : defaultPartnerSettings
  } catch {
    return defaultPartnerSettings
  }
}

export function savePartnerSettings(settings: PartnerSearchSettings) {
  window.localStorage.setItem(PARTNER_SETTINGS_KEY, JSON.stringify(settings))
}

const colorReferences = [
  { name: "navy blue", rgb: [24, 45, 80] },
  { name: "indigo", rgb: [55, 48, 110] },
  { name: "teal green", rgb: [28, 112, 105] },
  { name: "emerald", rgb: [30, 120, 70] },
  { name: "maroon", rgb: [120, 35, 50] },
  { name: "rose pink", rgb: [190, 90, 120] },
  { name: "mustard", rgb: [190, 145, 35] },
  { name: "ivory gold", rgb: [210, 190, 135] },
  { name: "cream", rgb: [225, 215, 185] },
  { name: "black", rgb: [35, 35, 35] },
] as const

function colorDistance(a: readonly number[], b: readonly number[]) {
  return Math.sqrt(a.reduce((sum, value, index) => sum + (value - b[index]) ** 2, 0))
}

function nearestColor(rgb: number[]) {
  return colorReferences.reduce((best, current) =>
    colorDistance(rgb, current.rgb) < colorDistance(rgb, best.rgb) ? current : best,
  ).name
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("We could not read this image. Try a JPG, PNG, or WebP photo."))
    }
    image.src = url
  })
}

export async function analyzeSareeImage(file: File): Promise<SareeDetection> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.")
  if (file.size > 12 * 1024 * 1024) throw new Error("Please choose an image smaller than 12 MB.")

  const image = await loadImage(file)
  if (image.naturalWidth < 200 || image.naturalHeight < 200) {
    throw new Error("This image is too small. Use a clearer photo at least 200 × 200 pixels.")
  }

  const size = 72
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) throw new Error("Image analysis is not supported in this browser.")
  context.drawImage(image, 0, 0, size, size)
  const pixels = context.getImageData(0, 0, size, size).data

  let red = 0
  let green = 0
  let blue = 0
  let brightnessTotal = 0
  let brightnessSquared = 0
  let goldPixels = 0
  let samples = 0
  const edge = [0, 0, 0]
  const center = [0, 0, 0]
  let edgeSamples = 0
  let centerSamples = 0

  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const index = (y * size + x) * 4
      const r = pixels[index]
      const g = pixels[index + 1]
      const b = pixels[index + 2]
      const brightness = (r + g + b) / 3
      red += r
      green += g
      blue += b
      brightnessTotal += brightness
      brightnessSquared += brightness ** 2
      if (r > 145 && g > 100 && g < r * 0.92 && b < g * 0.8) goldPixels++
      const isEdge = x < 12 || x > 60 || y < 12 || y > 60
      const bucket = isEdge ? edge : center
      bucket[0] += r
      bucket[1] += g
      bucket[2] += b
      if (isEdge) edgeSamples++
      else centerSamples++
      samples++
    }
  }

  const average = [red / samples, green / samples, blue / samples]
  const meanBrightness = brightnessTotal / samples
  const variance = brightnessSquared / samples - meanBrightness ** 2
  const contrast = Math.sqrt(Math.max(variance, 0))
  if (contrast < 8) {
    throw new Error("The image looks unclear or too uniform. Try a well-lit photo showing the full saree and border.")
  }

  const edgeAverage = edge.map((value) => value / edgeSamples)
  const centerAverage = center.map((value) => value / centerSamples)
  const borderContrast = colorDistance(edgeAverage, centerAverage)
  const goldRatio = goldPixels / samples
  const filename = file.name.toLowerCase()
  const color = nearestColor(average)
  const pattern = /floral|flower|peacock/.test(filename)
    ? "floral motif"
    : /ikat|geometric|checks|stripe/.test(filename)
      ? "geometric weave"
      : contrast > 58
        ? "intricate pattern"
        : contrast > 34
          ? "woven motif"
          : "mostly solid"
  const fabric = /cotton/.test(filename)
    ? "cotton saree"
    : /silk|kanjivaram|banarasi|bridal/.test(filename) || goldRatio > 0.07
      ? "silk saree"
      : "handloom saree"
  const borderStyle = goldRatio > 0.045
    ? "zari border"
    : borderContrast > 48
      ? "contrast border"
      : "subtle border"
  const workType = goldRatio > 0.08
    ? "rich zari work"
    : goldRatio > 0.035
      ? "zari work"
      : pattern === "intricate pattern"
        ? "woven work"
        : "minimal work"
  const design = /kanjivaram/.test(filename)
    ? "kanjivaram"
    : /banarasi/.test(filename)
      ? "banarasi"
      : /bridal|wedding/.test(filename) || goldRatio > 0.12
        ? "bridal saree"
        : "similar handloom design"
  const tags = Array.from(new Set([fabric, color, pattern, borderStyle, workType, design]))

  return {
    color,
    pattern,
    fabric,
    borderStyle,
    workType,
    design,
    tags,
    confidence: Math.min(92, Math.round(58 + contrast * 0.35 + Math.min(goldRatio * 80, 8))),
  }
}

function searchableProductText(product: Product) {
  return [
    product.name,
    product.category,
    product.categoryName,
    product.fabric,
    product.color,
    product.weave,
    product.description,
    ...product.badges,
  ].join(" ").toLowerCase()
}

export function matchLocalProducts(detection: SareeDetection, products: Product[]): ProductMatch[] {
  return products
    .map((product) => {
      const text = searchableProductText(product)
      const matchedTags = detection.tags.filter((tag) =>
        tag.split(" ").some((part) => part.length > 3 && text.includes(part)),
      )
      let score = 30 + matchedTags.length * 9
      if (text.includes(detection.color)) score += 20
      if (text.includes(detection.fabric.replace(" saree", ""))) score += 12
      if (detection.borderStyle.includes("zari") && text.includes("zari")) score += 10
      if (text.includes(detection.design)) score += 16
      return { product, score: Math.min(98, score), matchedTags }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
}

export function matchPartnerProducts(detection: SareeDetection, products: PartnerProduct[]) {
  return products
    .filter((product) => product.enabled && /^https:\/\//i.test(product.affiliateUrl || product.productUrl))
    .map((product) => {
      const text = `${product.name} ${product.tags.join(" ")}`.toLowerCase()
      const matches = detection.tags.filter((tag) => tag.split(" ").some((part) => part.length > 3 && text.includes(part)))
      return { product, score: Math.min(95, 42 + matches.length * 10) }
    })
    .sort((a, b) => b.score - a.score)
}
