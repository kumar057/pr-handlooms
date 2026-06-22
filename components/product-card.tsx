"use client"

import Image from "next/image"
import Link from "next/link"
import { HeartIcon, ShoppingBagIcon } from "lucide-react"
import { toast } from "sonner"

import { cn, formatPrice } from "@/lib/utils"
import { useStore } from "@/lib/store"
import type { Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/star-rating"

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted, setCartOpen } = useStore()
  const wishlisted = isWishlisted(product.id)

  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100,
      )
    : 0

  return (
    <article className="group relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] shrink-0 overflow-hidden bg-muted"
      >
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badges.slice(0, 2).map((b) => (
            <Badge
              key={b}
              variant={b === "Sale" ? "destructive" : "default"}
              className={cn(
                b === "Best Seller" && "bg-accent text-accent-foreground",
                b === "Handwoven" && "bg-primary text-primary-foreground",
              )}
            >
              {b}
            </Badge>
          ))}
        </div>
      </Link>

      <Button
        size="icon"
        variant="secondary"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
        onClick={() => {
          toggleWishlist(product.id)
          toast(
            wishlisted
              ? "Removed from wishlist"
              : `${product.name} added to wishlist`,
          )
        }}
        className="absolute right-3 top-3 rounded-full shadow-sm"
      >
        <HeartIcon className={cn(wishlisted && "fill-accent text-accent")} />
      </Button>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3 sm:p-4">
        <span className="line-clamp-1 min-h-4 text-xs uppercase tracking-wide text-muted-foreground">
          {product.categoryName}
        </span>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 min-h-[2.75rem] font-serif text-base font-medium leading-snug transition-colors hover:text-accent"
        >
          {product.name}
        </Link>
        <div className="min-h-5">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>

        <div className="mt-auto flex min-h-8 flex-wrap items-baseline gap-x-2 gap-y-1 pt-2">
          <span className="text-base font-semibold sm:text-lg">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice ? (
            <>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
              <span className="text-xs font-medium text-destructive">
                -{discount}%
              </span>
            </>
          ) : null}
        </div>

        <Button
          className="mt-2 w-full"
          size="lg"
          variant="outline"
          onClick={() => {
            addToCart(product.id)
            setCartOpen(true)
          }}
        >
          <ShoppingBagIcon data-icon="inline-start" />
          Add to Cart
        </Button>
      </div>
    </article>
  )
}
