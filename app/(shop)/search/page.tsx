import type { Metadata } from "next"

import { SearchResultsPage } from "@/components/search-results-page"

export const metadata: Metadata = {
  title: "Search Sarees",
  description: "Search PR Handlooms sarees and official partner marketplace feeds.",
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    category?: string
    color?: string
    minPrice?: string
    maxPrice?: string
    occasion?: string
    source?: string
    includeExternal?: string
  }>
}) {
  const params = await searchParams
  return (
    <SearchResultsPage
      initialQuery={params.q ? decodeURIComponent(params.q) : "silk saree"}
      initialFilters={{
        category: params.category ? decodeURIComponent(params.category) : "",
        color: params.color ? decodeURIComponent(params.color) : "",
        minPrice: params.minPrice ? decodeURIComponent(params.minPrice) : "",
        maxPrice: params.maxPrice ? decodeURIComponent(params.maxPrice) : "",
        occasion: params.occasion ? decodeURIComponent(params.occasion) : "",
        source: params.source ? decodeURIComponent(params.source) : "",
      }}
      includeExternal={isTruthyParam(params.includeExternal)}
    />
  )
}

function isTruthyParam(value?: string) {
  return ["1", "true", "yes"].includes(String(value || "").toLowerCase())
}
