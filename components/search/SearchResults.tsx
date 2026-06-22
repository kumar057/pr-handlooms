"use client"

import { LoaderCircleIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { SearchProductCard, type ModalSearchResult } from "@/components/search/SearchProductCard"

export function SearchResults({
  results,
  loading,
  query,
  counts,
  error,
  canSearch,
}: {
  results: ModalSearchResult[]
  loading: boolean
  query: string
  counts: { internal: number; external: number }
  error: string
  canSearch: boolean
}) {
  const total = results.length

  if (error) {
    return <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">{error}</div>
  }

  if (!canSearch && !loading && total === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-8 text-center">
        <SearchIcon className="mx-auto mb-3 size-8 text-muted-foreground" />
        <p className="font-medium">Type at least 2 characters to search</p>
        <p className="mt-1 text-sm text-muted-foreground">Try Banarasi silk, red Kanjivaram, festive saree, or wedding saree.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircleIcon className="size-4 animate-spin" />
          <span>Searching<span className="animate-pulse">...</span></span>
        </div>
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-lg border bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-8 text-center">
        <p className="font-medium">No sarees found</p>
        <p className="mt-1 text-sm text-muted-foreground">Try a broader color, remove price limits, or search Banarasi, Kanjivaram, festive, or silk.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Found <span className="font-semibold text-foreground">{total}</span> sarees
          <span className="text-muted-foreground"> ({counts.internal} in our store, {counts.external} from other platforms)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">PR Handlooms {counts.internal}</Badge>
          <Badge variant="outline">Marketplaces {counts.external}</Badge>
        </div>
      </div>

      <div className="grid auto-rows-fr items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
        {results.map((product, index) => (
          <SearchProductCard key={`${product.source}-${product.id}`} product={product} index={index} />
        ))}
      </div>
    </div>
  )
}
