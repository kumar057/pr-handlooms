"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ImageIcon, LoaderCircleIcon, SearchIcon, UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { analyzeSareeImage } from "@/lib/image-search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchProductCard, type ModalSearchResult } from "@/components/search/SearchProductCard"
import type { SearchFilterState } from "@/components/search/SearchFilters"

type SearchResponse = {
  success: boolean
  count: number
  internalCount: number
  externalCount: number
  results: ModalSearchResult[]
  message?: string
}

const categories = ["", "Banarasi", "Kanjivaram", "Paithani", "Chanderi", "Bandhani"]
const occasions = ["", "Wedding", "Festive", "Casual", "Party"]
const sources = ["", "internal", "external"]

const defaultFilters: SearchFilterState = {
  category: "",
  color: "",
  minPrice: "",
  maxPrice: "",
  occasion: "",
  source: "",
}

export function SareeSearchSection({
  initialQuery = "",
  initialFilters = defaultFilters,
  includeExternal = false,
}: {
  initialQuery?: string
  initialFilters?: SearchFilterState
  includeExternal?: boolean
}) {
  const router = useRouter()
  const [query, setQuery] = React.useState(initialQuery)
  const [filters, setFilters] = React.useState<SearchFilterState>({ ...defaultFilters, ...initialFilters })
  const [loading, setLoading] = React.useState(false)
  const [imageLoading, setImageLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [response, setResponse] = React.useState<SearchResponse | null>(null)
  const uploadInput = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setQuery(initialQuery)
    setFilters({ ...defaultFilters, ...initialFilters })
  }, [initialQuery, initialFilters])

  React.useEffect(() => {
    if (initialQuery.trim() || hasActiveSearchFilters(initialFilters)) {
      runSearch(undefined, { updateUrl: false, nextQuery: initialQuery, nextFilters: initialFilters, forceExternal: includeExternal })
    }
    // Run only when the route params change; runSearch intentionally stays local to user actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, initialFilters])

  async function runSearch(
    event?: React.FormEvent,
    options: {
      updateUrl?: boolean
      nextQuery?: string
      nextFilters?: SearchFilterState
      forceExternal?: boolean
    } = {},
  ) {
    event?.preventDefault()
    const searchQuery = options.nextQuery ?? query
    const activeFilters = options.nextFilters ? { ...defaultFilters, ...options.nextFilters } : filters

    if (!searchQuery.trim() && !hasActiveSearchFilters(activeFilters)) {
      setError("Type a search term or choose a filter.")
      setResponse(null)
      return
    }

    setLoading(true)
    setError("")

    const params = buildSearchParams(searchQuery, activeFilters, options.forceExternal)
    const apiParams = new URLSearchParams(params)
    apiParams.delete("source")

    try {
      const result = await fetch(`/api/search?${apiParams.toString()}`)
      const contentType = result.headers.get("content-type") || ""

      if (!contentType.includes("application/json")) {
        throw new Error("Search API route did not return JSON. Restart the Next dev server and try again.")
      }

      const data = (await result.json()) as SearchResponse
      if (!result.ok || !data.success) throw new Error(data.message || "Search failed")

      const filteredResults = activeFilters.source
        ? data.results.filter((product) => product.source === activeFilters.source)
        : data.results

      setResponse({
        ...data,
        count: filteredResults.length,
        internalCount: filteredResults.filter((product) => product.source === "internal").length,
        externalCount: filteredResults.filter((product) => product.source === "external").length,
        results: filteredResults,
      })

      if (options.updateUrl !== false) {
        router.push(`/search?${params.toString()}`, { scroll: false })
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Search failed")
      setResponse(null)
    } finally {
      setLoading(false)
    }
  }

  async function searchByImage(file?: File) {
    if (!file) return
    setImageLoading(true)
    setError("")

    try {
      const detection = await analyzeSareeImage(file)
      const detectedQuery = detection.tags.join(" ")
      toast.success(`Detected ${detection.color} ${detection.fabric}`)
      setQuery(detectedQuery)
      await runSearch(undefined, { nextQuery: detectedQuery, forceExternal: true })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not detect this saree image.")
    } finally {
      setImageLoading(false)
      if (uploadInput.current) uploadInput.current.value = ""
    }
  }

  return (
    <section className="bg-background px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Saree Finder</span>
            <h1 className="mt-2 text-balance font-serif text-3xl font-medium text-foreground md:text-4xl">
              Search sarees across PR Handlooms and marketplaces
            </h1>
          </div>
          {response ? (
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="secondary">Internal: {response.internalCount}</Badge>
              <Badge variant="outline">External: {response.externalCount}</Badge>
            </div>
          ) : null}
        </div>

        <form onSubmit={runSearch} className="rounded-lg border bg-card p-3 shadow-sm md:p-4">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(6,minmax(0,1fr))_auto]">
            <label className="flex min-h-11 items-center gap-2 rounded-md border bg-background px-3 focus-within:border-accent">
              <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Banarasi, maroon, wedding..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </label>
            <SelectField label="Category" value={filters.category} onChange={(category) => setFilters({ ...filters, category })} options={categories} />
            <TextField label="Color" value={filters.color} onChange={(color) => setFilters({ ...filters, color })} placeholder="Maroon" />
            <SelectField label="Occasion" value={filters.occasion} onChange={(occasion) => setFilters({ ...filters, occasion })} options={occasions} />
            <TextField label="Min" value={filters.minPrice} onChange={(minPrice) => setFilters({ ...filters, minPrice })} placeholder="3000" type="number" />
            <TextField label="Max" value={filters.maxPrice} onChange={(maxPrice) => setFilters({ ...filters, maxPrice })} placeholder="20000" type="number" />
            <SelectField
              label="Results"
              value={filters.source}
              onChange={(source) => setFilters({ ...filters, source })}
              options={sources}
              getLabel={(option) => (option === "internal" ? "Our Store" : option === "external" ? "Other Platforms" : "All")}
            />
            <Button type="submit" disabled={loading} className="min-h-11">
              {loading ? <LoaderCircleIcon className="animate-spin" /> : <SearchIcon />}
              Search
            </Button>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-primary bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
            onClick={() => uploadInput.current?.click()}
            disabled={imageLoading}
          >
            {imageLoading ? <LoaderCircleIcon className="animate-spin" /> : <UploadIcon />}
            {imageLoading ? "Detecting image" : "Upload saree image"}
          </Button>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            Upload a saree photo to detect details and search internal plus marketplace products.
          </span>
          <input
            ref={uploadInput}
            hidden
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => searchByImage(event.target.files?.[0])}
          />
        </div>

        {loading ? (
          <div className="mt-5 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-lg border bg-muted" />
            ))}
          </div>
        ) : null}

        {error ? <p className="mt-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</p> : null}

        {response && !loading ? (
          response.results.length ? (
            <div className="mt-5 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {response.results.map((product, index) => (
                <SearchProductCard key={`${product.source}-${product.id}`} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No sarees matched those filters.
            </div>
          )
        ) : null}
      </div>
    </section>
  )
}

function buildSearchParams(query: string, filters: SearchFilterState, includeExternal = false) {
  const params = new URLSearchParams()
  if (query.trim()) params.set("q", query.trim())
  if (filters.category) params.set("category", filters.category)
  if (filters.color) params.set("color", filters.color)
  if (filters.minPrice) params.set("minPrice", filters.minPrice)
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice)
  if (filters.occasion) params.set("occasion", filters.occasion)
  if (filters.source) params.set("source", filters.source)
  if (includeExternal) params.set("includeExternal", "true")
  return params
}

function hasActiveSearchFilters(filters: SearchFilterState) {
  return Boolean(filters.category || filters.color || filters.minPrice || filters.maxPrice || filters.occasion)
}

function SelectField({
  label,
  value,
  onChange,
  options,
  getLabel = (option) => option || "All",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  getLabel?: (option: string) => string
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-md border bg-background px-2 text-sm text-foreground outline-none focus:border-accent">
        {options.map((option) => (
          <option key={option || "all"} value={option}>
            {getLabel(option)}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      {label}
      <input
        value={value}
        type={type}
        min={type === "number" ? "0" : undefined}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 min-w-0 rounded-md border bg-background px-3 text-sm text-foreground outline-none focus:border-accent"
      />
    </label>
  )
}
