"use client"

import * as React from "react"
import { SearchIcon, XIcon } from "lucide-react"

export function SearchInput({
  value,
  onChange,
  inputRef,
}: {
  value: string
  onChange: (value: string) => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}) {
  return (
    <label className="relative block">
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-6 -translate-y-1/2 text-muted-foreground md:left-6 md:size-7" />
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search for sarees... (e.g., Banarasi silk, Red Kanjivaram)"
        className="h-16 w-full rounded-lg border bg-background px-12 pr-14 font-serif text-2xl text-foreground shadow-sm outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/15 md:h-20 md:px-16 md:pr-20 md:text-[2.35rem]"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:right-5"
        >
          <XIcon className="size-5" />
        </button>
      ) : null}
    </label>
  )
}
