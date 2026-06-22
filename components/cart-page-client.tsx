"use client"

import Image from "next/image"
import Link from "next/link"
import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react"

import { useStore } from "@/lib/store"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"

export function CartPageClient() {
  const {
    cartDetailed,
    cartSubtotal,
    cartCount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useStore()

  const shipping = cartSubtotal >= 5000 || cartSubtotal === 0 ? 0 : 250
  const total = cartSubtotal + shipping

  if (cartDetailed.length === 0) {
    return (
      <section className="mx-auto flex min-h-[58vh] max-w-4xl items-center justify-center px-4 py-12 md:px-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingBagIcon />
            </EmptyMedia>
            <EmptyTitle>Your cart is empty</EmptyTitle>
            <EmptyDescription>
              Add handloom sarees, fabrics, and home textiles to continue.
            </EmptyDescription>
          </EmptyHeader>
          <Button nativeButton={false} render={<Link href="/products" />}>
            Shop Collection
          </Button>
        </Empty>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12 md:px-6 md:py-16">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-accent">
          Your selection
        </p>
        <h1 className="font-serif text-4xl font-semibold md:text-5xl">
          Cart
        </h1>
        <p className="mt-4 text-muted-foreground">
          Review quantities before moving to checkout.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 rounded-lg border">
          {cartDetailed.map(({ product, quantity }, index) => (
            <div key={product.id}>
              <div className="grid gap-4 p-4 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:p-5">
                <Link
                  href={`/products/${product.slug}`}
                  className="relative aspect-[4/5] w-28 overflow-hidden rounded-md bg-muted sm:w-full"
                >
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </Link>
                <div className="min-w-0">
                  <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
                    {product.categoryName}
                  </p>
                  <Link
                    href={`/products/${product.slug}`}
                    className="mt-1 block text-lg font-medium hover:text-accent"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-2 text-sm text-muted-foreground">
                    SKU {product.sku}
                  </p>
                  <p className="mt-3 font-semibold">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                    >
                      <MinusIcon />
                    </Button>
                    <span className="w-10 text-center text-sm font-medium">
                      {quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => removeFromCart(product.id)}
                  >
                    <Trash2Icon />
                    Remove
                  </Button>
                </div>
              </div>
              {index < cartDetailed.length - 1 ? <Separator /> : null}
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-lg border p-5">
          <h2 className="font-serif text-2xl font-semibold">Order Summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Items</span>
              <span>{cartCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
          </div>
          <Separator className="my-5" />
          <div className="flex justify-between gap-4 text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Button size="lg" nativeButton={false} render={<Link href="/checkout" />}>
              Checkout
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/products" />}>
              Continue Shopping
            </Button>
            <Button variant="ghost" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </aside>
      </div>
    </section>
  )
}
