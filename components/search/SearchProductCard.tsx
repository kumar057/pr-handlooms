"use client"

import { ExternalLinkIcon, ShoppingBagIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { useStore } from "@/lib/store"

export type ModalSearchResult = {
  id: string
  source: "internal" | "external"
  name: string
  price?: number
  priceLabel?: string
  image?: string
  images?: string[]
  inStock?: boolean
  platform?: string
  platformName?: string
  platformLogo?: string
  url?: string
  cartProductId?: string
  slug?: string
}

export function SearchProductCard({
  product,
  index,
}: {
  product: ModalSearchResult
  index: number
}) {
  const { addToCart, setCartOpen } = useStore()
  const isExternal = product.source === "external"
  const image = product.image || product.images?.[0] || "/placeholder.jpg"
  const canAddToCart = Boolean(product.cartProductId || product.id)
  const priceText = typeof product.price === "number" && product.price > 0 ? formatPrice(product.price) : product.priceLabel || "Check latest price"

  return (
    <article
      className="group flex h-full min-h-0 w-full animate-fade-up flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-lg"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-muted">
        {isExternal && product.url ? (
          <a href={product.url} target="_blank" rel="noopener noreferrer sponsored" aria-label={`Open ${product.name}`}>
            {/* External marketplace images are remote and may not be configured for next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={product.name} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </a>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={product.name} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
        )}

        <div className="absolute left-3 top-3">
          {isExternal ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/95 px-2.5 py-1 text-xs font-medium shadow-sm">
              <MarketplaceMark platform={product.platform} platformName={product.platformName} />
              {product.platformName}
            </span>
          ) : (
            <Badge className={product.inStock ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}>
              {product.inStock ? "In Stock" : "Out of Stock"}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] font-serif text-base font-medium leading-snug">{product.name}</h3>
        <p className="mt-auto min-h-7 text-lg font-semibold">{priceText}</p>
        <div className="mt-auto">
          {isExternal ? (
            <Button
              nativeButton={false}
              className="w-full"
              render={<a href={product.url} target="_blank" rel="noopener noreferrer sponsored" />}
            >
              <ExternalLinkIcon /> View on {product.platformName}
            </Button>
          ) : (
            <Button
              className="w-full"
              disabled={!product.inStock || !canAddToCart}
              onClick={() => {
                const productId = product.cartProductId || product.id
                addToCart(productId)
                setCartOpen(true)
                toast.success(`${product.name} added to your bag`)
              }}
            >
              <ShoppingBagIcon /> Add to Cart
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

function MarketplaceMark({
  platform,
  platformName,
}: {
  platform?: string
  platformName?: string
}) {
  const key = String(platform || platformName || "").toLowerCase()

  if (key.includes("flipkart")) {
    return (
      <span
        aria-hidden="true"
        className="grid size-4 place-items-center rounded-[3px] bg-[#2874f0] text-[10px] font-bold leading-none text-[#ffe500]"
      >
        f
      </span>
    )
  }

  if (key.includes("myntra")) {
    return (
      <span
        aria-hidden="true"
        className="grid size-4 place-items-center rounded-[3px] bg-white text-[10px] font-black leading-none text-[#ff3f6c] ring-1 ring-black/10"
      >
        M
      </span>
    )
  }

  if (key.includes("amazon")) {
    return (
      <span
        aria-hidden="true"
        className="grid size-4 place-items-center rounded-[3px] bg-[#ff9900] text-[10px] font-black leading-none text-[#111827]"
      >
        a
      </span>
    )
  }

  return (
    <span
      aria-hidden="true"
      className="grid size-4 place-items-center rounded-[3px] bg-muted text-[10px] font-bold leading-none text-foreground"
    >
      {(platformName || "M").charAt(0).toUpperCase()}
    </span>
  )
}
