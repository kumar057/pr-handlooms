"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CameraIcon,
  ImageIcon,
  LoaderCircleIcon,
  MicIcon,
  SearchIcon,
  ShoppingBagIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { products } from "@/lib/data"
import type { Product } from "@/lib/types"
import {
  analyzeSareeImage,
  matchLocalProducts,
  matchPartnerProducts,
  readPartnerSettings,
  type PartnerSearchSettings,
  type ProductMatch,
  type SareeDetection,
} from "@/lib/image-search"
import { useStore } from "@/lib/store"
import { cn, formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

const emptyPartnerSettings: PartnerSearchSettings = { enabled: false, products: [] }
const recentSearchesKey = "prh.smart-search.recent"

const trendingSearches = [
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

type SearchIntent = {
  colors: string[]
  fabrics: string[]
  categories: string[]
  borders: string[]
  budget?: number
}

type RankedProduct = {
  product: Product
  score: number
  reasons: string[]
}

type SpeechRecognitionResultEvent = Event & {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
    }
  }
}

type SpeechRecognitionInstance = {
  lang: string
  interimResults: boolean
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  start: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

type SpeechRecognitionWindow = typeof window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

function unique(values: string[]) {
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

function extractIntent(query: string): SearchIntent {
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

function rankProducts(query: string) {
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
    .slice(0, 8)
}

function readRecentSearches() {
  if (typeof window === "undefined") return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(recentSearchesKey) || "[]")
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 5) : []
  } catch {
    return []
  }
}

function saveRecentSearch(query: string) {
  const value = query.trim()
  if (!value || typeof window === "undefined") return []
  const next = unique([value, ...readRecentSearches()]).slice(0, 5)
  window.localStorage.setItem(recentSearchesKey, JSON.stringify(next))
  return next
}

export function SearchDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])
  const [listening, setListening] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState("")
  const [detection, setDetection] = React.useState<SareeDetection | null>(null)
  const [matches, setMatches] = React.useState<ProductMatch[]>([])
  const [partnerSettings, setPartnerSettings] = React.useState(emptyPartnerSettings)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const galleryInput = React.useRef<HTMLInputElement>(null)
  const cameraInput = React.useRef<HTMLInputElement>(null)
  const { addToCart, setCartOpen } = useStore()

  React.useEffect(() => {
    if (open) {
      setPartnerSettings(readPartnerSettings())
      setRecentSearches(readRecentSearches())
    }
  }, [open])

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  React.useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`
  }, [query])

  const intent = React.useMemo(() => extractIntent(query), [query])
  const rankedResults = React.useMemo(() => rankProducts(query), [query])
  const suggestions = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = [
      ...products.map((product) => product.name),
      ...products.map((product) => `${product.color} ${product.fabric} saree`),
      ...trendingSearches,
    ]
    if (!q) return unique(pool).slice(0, 5)
    return unique(pool.filter((item) => item.toLowerCase().includes(q) || q.split(/\s+/).some((word) => item.toLowerCase().includes(word)))).slice(0, 5)
  }, [query])
  const partnerMatches = React.useMemo(
    () => detection && partnerSettings.enabled ? matchPartnerProducts(detection, partnerSettings.products) : [],
    [detection, partnerSettings],
  )
  const hasCloseLocalMatch = matches.some((match) => match.score >= 60)

  function chooseFile(selected?: File) {
    if (!selected) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    setDetection(null)
    setMatches([])
    setError("")
  }

  function clearImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl("")
    setDetection(null)
    setMatches([])
    setError("")
    if (galleryInput.current) galleryInput.current.value = ""
    if (cameraInput.current) cameraInput.current.value = ""
  }

  function applyQuery(value: string) {
    setQuery(value)
    textareaRef.current?.focus()
  }

  function commitTextSearch(value = query) {
    const trimmed = value.trim()
    if (!trimmed) return
    setRecentSearches(saveRecentSearch(trimmed))
    setQuery(trimmed)
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  function startVoiceSearch() {
    const SpeechRecognition =
      (window as SpeechRecognitionWindow).SpeechRecognition ||
      (window as SpeechRecognitionWindow).webkitSpeechRecognition

    if (!SpeechRecognition) {
      toast.error("Voice search is not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-IN"
    recognition.interimResults = false
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => {
      setListening(false)
      toast.error("We could not hear that clearly. Please try again.")
    }
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript
      if (transcript) {
        setQuery(transcript)
        setRecentSearches(saveRecentSearch(transcript))
        setOpen(false)
        router.push(`/search?q=${encodeURIComponent(transcript)}`)
      }
    }
    recognition.start()
  }

  async function searchByImage() {
    if (!file) return
    setLoading(true)
    setError("")
    setDetection(null)
    try {
      const [result] = await Promise.all([
        analyzeSareeImage(file),
        new Promise((resolve) => setTimeout(resolve, 850)),
      ])
      setDetection(result)
      setMatches(matchLocalProducts(result, products))
      setPartnerSettings(readPartnerSettings())
      const detectedQuery = result.tags.join(" ")
      setRecentSearches(saveRecentSearch(detectedQuery))
      setOpen(false)
      router.push(`/search?q=${encodeURIComponent(detectedQuery)}&source=image`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not analyse this image. Please try another photo.")
    } finally {
      setLoading(false)
    }
  }

  function fallbackToText() {
    if (!detection) return
    setQuery(detection.tags.join(" "))
    clearImage()
  }

  function closeAfterSearch() {
    commitTextSearch()
    setOpen(false)
  }

  const extractedChips = [
    ...intent.colors.map((value) => `Color: ${value}`),
    ...intent.fabrics.map((value) => `Fabric: ${value}`),
    ...intent.categories.map((value) => `Category: ${value}`),
    ...intent.borders.map((value) => `Border: ${value}`),
    ...(intent.budget ? [`Budget: ${formatPrice(intent.budget)}`] : []),
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" aria-label="Search products" />}>
        <SearchIcon />
      </DialogTrigger>
      <DialogContent className="inset-x-0 left-0 top-0 grid h-dvh max-h-dvh w-full max-w-none -translate-x-0 translate-y-0 grid-rows-[auto_1fr] gap-0 overflow-hidden rounded-none border-x-0 p-0 sm:inset-x-4 sm:top-4 sm:h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)] sm:rounded-xl sm:border-x">
        <DialogHeader className="border-b p-3 pr-12 sm:p-4 sm:pr-12">
          <DialogTitle className="font-serif text-xl">Find your saree</DialogTitle>
          <div className="mt-3 w-full rounded-xl border bg-background p-2 shadow-sm transition-all duration-300 focus-within:border-accent focus-within:shadow-md">
            <div className="flex w-full items-start gap-2">
              <SearchIcon className="mt-3 size-4 shrink-0 text-muted-foreground" />
              <Textarea
                ref={textareaRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) commitTextSearch()
                }}
                placeholder="Search sarees, fabrics, colors, designs..."
                className="max-h-36 min-h-11 flex-1 resize-none overflow-y-auto rounded-md border-0 px-1 py-2 text-base shadow-none focus-visible:ring-0"
                rows={1}
              />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Button variant="outline" className="justify-center" onClick={() => cameraInput.current?.click()}>
                <CameraIcon /> Camera
              </Button>
              <Button variant="outline" className="justify-center" onClick={() => galleryInput.current?.click()}>
                <UploadIcon /> Upload
              </Button>
              <Button
                variant={listening ? "secondary" : "outline"}
                className="justify-center"
                onClick={startVoiceSearch}
                aria-pressed={listening}
              >
                <MicIcon /> {listening ? "Listening" : "Voice"}
              </Button>
              <Button className="justify-center" onClick={() => commitTextSearch()}>
                <SearchIcon /> Search
              </Button>
              <input ref={galleryInput} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseFile(event.target.files?.[0])} />
              <input ref={cameraInput} hidden type="file" accept="image/*" capture="environment" onChange={(event) => chooseFile(event.target.files?.[0])} />
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {file && previewUrl ? (
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-[220px_1fr]">
                <div className="relative mx-auto aspect-[4/5] w-full max-w-[220px] overflow-hidden rounded-xl border bg-muted">
                  {/* A blob URL is local to the browser and cannot be handled by next/image. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Selected saree preview" className="size-full object-cover" />
                  <Button variant="secondary" size="icon-sm" className="absolute right-2 top-2 rounded-full" aria-label="Remove selected image" onClick={clearImage}>
                    <XIcon />
                  </Button>
                </div>
                <div className="flex flex-col justify-center">
                  <Badge variant="outline" className="mb-3 w-fit"><ImageIcon /> Image ready</Badge>
                  <h2 className="font-serif text-2xl font-semibold">Search by Saree Image</h2>
                  <p className="mt-2 text-muted-foreground">For the best match, use a bright photo showing the full saree, motifs, and border.</p>
                  <Button className="mt-5 w-fit" disabled={loading} onClick={searchByImage}>
                    {loading ? <LoaderCircleIcon className="animate-spin" /> : <SearchIcon />}
                    {loading ? "Detecting weave..." : "Find similar sarees"}
                  </Button>
                  {loading ? (
                    <div className="mt-5 max-w-sm space-y-2" aria-live="polite">
                      <Progress value={66} className="animate-pulse" />
                      <p className="text-xs text-muted-foreground">Checking colour, pattern, border, and fabric cues on your device...</p>
                    </div>
                  ) : null}
                  {error ? <p role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
                </div>
              </div>

              {detection ? (
                <div className="space-y-6 border-t pt-5">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-serif text-xl font-semibold">Detected details</h3>
                      <span className="text-xs text-muted-foreground">Estimated confidence {detection.confidence}%</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {detection.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">Visual tags are estimates for discovery, not fabric authentication.</p>
                  </div>

                  {hasCloseLocalMatch ? (
                    <section>
                      <h3 className="font-serif text-xl font-semibold">Similar sarees at PR Handlooms</h3>
                      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {matches.filter((match) => match.score >= 60).slice(0, 6).map(({ product, score }) => (
                          <div key={product.id} className="overflow-hidden rounded-xl border bg-card">
                            <Link href={`/products/${product.slug}`} onClick={() => setOpen(false)} className="relative block aspect-[4/3] bg-muted">
                              <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                              <Badge className="absolute right-2 top-2 bg-primary/90">{score}% match</Badge>
                            </Link>
                            <div className="space-y-3 p-3">
                              <Link href={`/products/${product.slug}`} onClick={() => setOpen(false)} className="line-clamp-2 font-medium hover:text-accent">{product.name}</Link>
                              <div className="flex items-center justify-between gap-2">
                                <div><span className="font-semibold">{formatPrice(product.price)}</span>{product.compareAtPrice ? <span className="ml-2 text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span> : null}</div>
                                <span className={product.stock > 0 ? "text-xs text-emerald-600" : "text-xs text-destructive"}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
                              </div>
                              <Button size="sm" className="w-full" disabled={product.stock === 0} onClick={() => { addToCart(product.id); setCartOpen(true); toast.success(`${product.name} added to your bag`) }}>
                                <ShoppingBagIcon /> Add to Cart
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : (
                    <section className="rounded-xl border border-dashed p-5 text-center">
                      <h3 className="font-serif text-lg font-semibold">No close match in our collection</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Try the detected tags as a text search or browse approved partner listings below.</p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={fallbackToText}>Search detected tags</Button>
                    </section>
                  )}

                  {!hasCloseLocalMatch && partnerSettings.enabled ? (
                    <section>
                      <h3 className="font-serif text-xl font-semibold">Similar sarees from partner stores</h3>
                      {partnerMatches.length ? (
                        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {partnerMatches.map(({ product, score }) => (
                            <article key={product.id} className="overflow-hidden rounded-xl border bg-card">
                              <div className="relative aspect-[4/3] bg-muted">
                                {product.imageUrl ? (
                                  // Partner images must be supplied through an official feed or with permission.
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
                                ) : <div className="flex size-full items-center justify-center"><ImageIcon className="size-10 text-muted-foreground" /></div>}
                                <Badge className="absolute right-2 top-2">{product.partner}</Badge>
                              </div>
                              <div className="space-y-3 p-3">
                                <h4 className="line-clamp-2 font-medium">{product.name}</h4>
                                <div className="flex flex-wrap gap-1">{product.tags.slice(0, 3).map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>
                                <div className="flex justify-between"><span className="font-semibold">Est. {formatPrice(product.estimatedPrice)}</span><span className="text-xs text-muted-foreground">{score}% match</span></div>
                                <p className="text-xs text-muted-foreground">Sold by {product.partner}, not PR Handlooms.</p>
                                <Button nativeButton={false} size="sm" className="w-full" render={<a href={product.affiliateUrl || product.productUrl} target="_blank" rel="noopener noreferrer sponsored" />}>
                                  Buy on {product.partner}
                                </Button>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : <p className="mt-3 rounded-lg bg-muted p-4 text-sm text-muted-foreground">No approved partner listings match yet. Partner products can be added in the admin dashboard.</p>}
                    </section>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-5">
              <section className="rounded-xl border bg-card p-3 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Suggestions</span>
                  {query.trim() ? <span className="text-xs text-muted-foreground">AI recommendations update as you type</span> : null}
                </div>
                <div className="mt-2 grid gap-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => applyQuery(suggestion)}
                      className="flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted"
                    >
                      <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </section>

              <div className="grid gap-4 md:grid-cols-2">
                <SearchPillGroup title="Recent Searches" items={recentSearches} empty="Your recent searches will appear here." onPick={applyQuery} />
                <SearchPillGroup title="Trending Saree Searches" items={trendingSearches} onPick={applyQuery} />
              </div>

              {extractedChips.length ? (
                <section className="rounded-xl border bg-card p-3">
                  <span className="px-1 text-xs uppercase tracking-wide text-muted-foreground">Extracted from your search</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {extractedChips.map((chip) => <Badge key={chip} variant="secondary">{chip}</Badge>)}
                  </div>
                </section>
              ) : null}

              {rankedResults.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">No products found for &quot;{query}&quot;.</p>
              ) : (
                <section className="rounded-xl border bg-card p-3">
                  <span className="px-1 text-xs uppercase tracking-wide text-muted-foreground">{query.trim() ? "Best matching sarees" : "Popular right now"}</span>
                  <div className="mt-2 grid gap-1">
                    {rankedResults.map(({ product, score, reasons }) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={closeAfterSearch}
                        className="flex min-w-0 items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted"
                      >
                        <div className="relative size-14 shrink-0 overflow-hidden rounded bg-muted">
                          <Image src={product.image} alt={product.name} fill sizes="56px" className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="line-clamp-1 text-sm font-medium">{product.name}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">{product.categoryName} / {product.fabric}</span>
                          {reasons.length ? (
                            <span className="mt-1 flex flex-wrap gap-1">
                              {reasons.slice(0, 3).map((reason) => <Badge key={reason} variant="outline" className="text-[0.65rem]">{reason}</Badge>)}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
                          {query.trim() ? <span className={cn("text-xs", score >= 65 ? "text-emerald-600" : "text-muted-foreground")}>{Math.max(25, Math.min(98, score))}% match</span> : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SearchPillGroup({
  title,
  items,
  empty,
  onPick,
}: {
  title: string
  items: string[]
  empty?: string
  onPick: (value: string) => void
}) {
  return (
    <section className="rounded-xl border bg-card p-3">
      <span className="px-1 text-xs uppercase tracking-wide text-muted-foreground">{title}</span>
      {items.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onPick(item)}
              className="max-w-full truncate rounded-full border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              {item}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 px-1 text-sm text-muted-foreground">{empty}</p>
      )}
    </section>
  )
}
