"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ImageIcon, LoaderCircleIcon, UploadIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { analyzeSareeImage } from "@/lib/image-search"
import { SearchInput } from "@/components/search/SearchInput"
import { SearchFilters, type SearchFilterState } from "@/components/search/SearchFilters"

const defaultFilters: SearchFilterState = {
  category: "",
  color: "",
  minPrice: "",
  maxPrice: "",
  occasion: "",
  source: "",
}

export function SearchModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [filters, setFilters] = React.useState<SearchFilterState>(defaultFilters)
  const [imageLoading, setImageLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const uploadInputRef = React.useRef<HTMLInputElement>(null)

  const hasFilters = Object.entries(filters).some(([key, value]) => key !== "source" && Boolean(value))
  const canSearch = query.trim().length >= 2 || hasFilters

  React.useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80)

    return () => {
      document.body.style.overflow = previousOverflow
      window.clearTimeout(focusTimer)
    }
  }, [open])

  async function searchByImage(file?: File) {
    if (!file) return
    setImageLoading(true)
    setError("")
    try {
      const detection = await analyzeSareeImage(file)
      const detectedQuery = detection.tags.join(" ")
      toast.success(`Detected ${detection.color} ${detection.fabric}`)
      goToSearch(detectedQuery, { source: "" }, { includeExternal: "true", image: "1" })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not detect this saree image.")
    } finally {
      setImageLoading(false)
      if (uploadInputRef.current) uploadInputRef.current.value = ""
    }
  }

  function goToSearch(
    nextQuery = query,
    filterOverrides: Partial<SearchFilterState> = {},
    extraParams: Record<string, string> = {},
  ) {
    const params = new URLSearchParams()
    const nextFilters = { ...filters, ...filterOverrides }
    const trimmed = nextQuery.trim()

    if (!trimmed && !Object.entries(nextFilters).some(([key, value]) => key !== "source" && Boolean(value))) {
      setError("Type at least 2 characters or choose a filter to search.")
      return
    }

    if (trimmed) params.set("q", trimmed)
    if (nextFilters.category) params.set("category", nextFilters.category)
    if (nextFilters.color) params.set("color", nextFilters.color)
    if (nextFilters.minPrice) params.set("minPrice", nextFilters.minPrice)
    if (nextFilters.maxPrice) params.set("maxPrice", nextFilters.maxPrice)
    if (nextFilters.occasion) params.set("occasion", nextFilters.occasion)
    if (nextFilters.source) params.set("source", nextFilters.source)
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })

    onOpenChange(false)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div
      className={[
        "fixed inset-0 z-50 grid place-items-center bg-black/85 p-0 transition-opacity duration-300 md:p-5 lg:p-8",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
      aria-hidden={!open}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false)
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search sarees"
        className={[
          "flex h-dvh w-full max-w-full flex-col bg-background text-foreground shadow-2xl transition-all duration-300 md:h-[min(760px,86dvh)] md:w-[92vw] md:rounded-2xl xl:w-[75vw] xl:max-w-[1440px]",
          open ? "translate-y-0 scale-100" : "translate-y-8 scale-[0.98]",
        ].join(" ")}
      >
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3 md:px-8 md:py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Search</p>
            <h2 className="font-serif text-xl font-semibold md:text-2xl">Find your saree</h2>
          </div>
          <Button size="icon-lg" variant="ghost" aria-label="Close search" onClick={() => onOpenChange(false)}>
            <XIcon />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-8">
          <div
            className="mx-auto flex min-h-full max-w-[1500px] flex-col justify-center gap-5 md:gap-6"
          >
            <form
              className="grid gap-5 md:gap-6"
              onSubmit={(event) => {
                event.preventDefault()
                goToSearch()
              }}
            >
              <SearchInput value={query} onChange={setQuery} inputRef={inputRef} />
              <SearchFilters filters={filters} onChange={setFilters} />
              <Button
                type="submit"
                disabled={!canSearch}
                className="h-12 w-full md:w-fit md:px-8"
              >
                Search Sarees
              </Button>
            </form>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-primary bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                onClick={() => uploadInputRef.current?.click()}
                disabled={imageLoading}
              >
                {imageLoading ? <LoaderCircleIcon className="animate-spin" /> : <UploadIcon />}
                {imageLoading ? "Detecting image" : "Upload saree image"}
              </Button>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <ImageIcon className="size-4" />
                Detect color, fabric, border, and similar sarees.
              </span>
              <input
                ref={uploadInputRef}
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => searchByImage(event.target.files?.[0])}
              />
            </div>
            {error ? <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
