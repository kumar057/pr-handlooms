"use client"

import { SareeSearchSection } from "@/components/home/saree-search-section"
import type { SearchFilterState } from "@/components/search/SearchFilters"

export function SearchResultsPage({
  initialQuery,
  initialFilters,
  includeExternal = false,
}: {
  initialQuery: string
  initialFilters?: SearchFilterState
  includeExternal?: boolean
}) {
  return <SareeSearchSection initialQuery={initialQuery} initialFilters={initialFilters} includeExternal={includeExternal} />
}
