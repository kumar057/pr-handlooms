"use client"

export type SearchFilterState = {
  category: string
  color: string
  minPrice: string
  maxPrice: string
  occasion: string
  source: string
}

const categories = ["", "Banarasi", "Kanjivaram", "Paithani", "Chanderi", "Bandhani"]
const occasions = ["", "Wedding", "Festive", "Casual", "Party"]
const sources = ["", "internal", "external"]

export function SearchFilters({
  filters,
  onChange,
}: {
  filters: SearchFilterState
  onChange: (filters: SearchFilterState) => void
}) {
  return (
    <div className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_0.75fr_0.75fr_1fr_0.9fr]">
      <SelectField
        label="Category"
        value={filters.category}
        options={categories}
        onChange={(category) => onChange({ ...filters, category })}
      />
      <TextField
        label="Color"
        value={filters.color}
        placeholder="Red, maroon, teal..."
        onChange={(color) => onChange({ ...filters, color })}
      />
      <TextField
        label="Min price"
        type="number"
        value={filters.minPrice}
        placeholder="3000"
        onChange={(minPrice) => onChange({ ...filters, minPrice })}
      />
      <TextField
        label="Max price"
        type="number"
        value={filters.maxPrice}
        placeholder="20000"
        onChange={(maxPrice) => onChange({ ...filters, maxPrice })}
      />
      <SelectField
        label="Occasion"
        value={filters.occasion}
        options={occasions}
        onChange={(occasion) => onChange({ ...filters, occasion })}
      />
      <SelectField
        label="Results"
        value={filters.source}
        options={sources}
        getLabel={(option) => (option === "internal" ? "Our Store" : option === "external" ? "Other Platforms" : "All")}
        onChange={(source) => onChange({ ...filters, source })}
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  getLabel = (option) => option || "All",
  onChange,
}: {
  label: string
  value: string
  options: string[]
  getLabel?: (option: string) => string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-lg border bg-background px-3 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-accent"
      >
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
  placeholder,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
      <input
        value={value}
        type={type}
        min={type === "number" ? "0" : undefined}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-lg border bg-background px-3 text-sm normal-case tracking-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
      />
    </label>
  )
}
