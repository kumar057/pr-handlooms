"use client"

import Image from "next/image"
import Link from "next/link"
import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react"

import { formatPrice } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

export function MiniCart() {
  const {
    cartOpen,
    setCartOpen,
    cartDetailed,
    cartSubtotal,
    cartCount,
    updateQuantity,
    removeFromCart,
  } = useStore()

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl">
            Your Bag ({cartCount})
          </SheetTitle>
        </SheetHeader>

        {cartDetailed.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingBagIcon />
                </EmptyMedia>
                <EmptyTitle>Your bag is empty</EmptyTitle>
                <EmptyDescription>
                  Discover our handwoven heritage collection.
                </EmptyDescription>
              </EmptyHeader>
              <Button nativeButton={false} onClick={() => setCartOpen(false)} render={<Link href="/products" />}>
                Shop Now
              </Button>
            </Empty>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <div className="flex flex-col gap-4 py-4">
                {cartDetailed.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3">
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted"
                    >
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="line-clamp-2 text-sm font-medium">
                          {product.name}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 shrink-0 text-muted-foreground"
                          aria-label="Remove item"
                          onClick={() => removeFromCart(product.id)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatPrice(product.price)}
                      </span>
                      <div className="mt-1 flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-7"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1)
                          }
                        >
                          <MinusIcon />
                        </Button>
                        <span className="w-8 text-center text-sm">{quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-7"
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(product.id, quantity + 1)
                          }
                        >
                          <PlusIcon />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />
            <SheetFooter className="gap-3">
              <div className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatPrice(cartSubtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  size="lg"
                  nativeButton={false}
                  onClick={() => setCartOpen(false)}
                  render={<Link href="/checkout" />}
                >
                  Checkout
                </Button>
                <Button
                  variant="outline"
                  nativeButton={false}
                  onClick={() => setCartOpen(false)}
                  render={<Link href="/cart" />}
                >
                  View Bag
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
