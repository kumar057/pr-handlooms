"use client"

import { HeartIcon, ShoppingBagIcon } from "lucide-react"
import { toast } from "sonner"

import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function ProductPurchaseActions({ productId, productName, disabled }: { productId: string; productName: string; disabled?: boolean }) {
  const { addToCart, setCartOpen, toggleWishlist, isWishlisted } = useStore()
  const wishlisted = isWishlisted(productId)

  return (
    <div className="flex gap-3">
      <Button size="lg" className="flex-1" disabled={disabled} onClick={() => { addToCart(productId); setCartOpen(true); toast.success(`${productName} added to your bag`) }}>
        <ShoppingBagIcon /> Add to Cart
      </Button>
      <Button size="icon-lg" variant="outline" aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"} onClick={() => toggleWishlist(productId)}>
        <HeartIcon className={cn(wishlisted && "fill-accent text-accent")} />
      </Button>
    </div>
  )
}
