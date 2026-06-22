"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { CheckCircle2Icon, Loader2Icon, ShoppingBagIcon } from "lucide-react"
import { toast } from "sonner"

import { getSavedProfile, saveCheckoutProfile, type PublicUserProfile } from "@/lib/local-auth"
import { useStore } from "@/lib/store"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

type SubmitState = "idle" | "submitting" | "success"

export function CheckoutPageClient() {
  const { cartDetailed, cartSubtotal, cartCount, clearCart } = useStore()
  const [state, setState] = React.useState<SubmitState>("idle")
  const [profile, setProfile] = React.useState<PublicUserProfile | null>(null)

  React.useEffect(() => {
    setProfile(getSavedProfile())
  }, [])

  const shipping = cartSubtotal >= 5000 || cartSubtotal === 0 ? 0 : 250
  const total = cartSubtotal + shipping

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState("submitting")

    const formData = new FormData(event.currentTarget)
    const customer = Object.fromEntries(formData.entries())
    const payload = {
      customer,
      totals: {
        itemCount: cartCount,
        subtotal: cartSubtotal,
        shipping,
        total,
      },
      items: cartDetailed.map(({ product, quantity }) => ({
        id: product.id,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        price: product.price,
        quantity,
      })),
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Checkout request failed")
      }

      saveCheckoutProfile({
        name: String(customer.name || "").trim(),
        email: String(customer.email || "").trim(),
        phone: String(customer.phone || "").trim(),
        address: String(customer.address || "").trim(),
        city: String(customer.city || "").trim(),
        state: String(customer.state || "").trim(),
        pincode: String(customer.pincode || "").trim(),
      })
      clearCart()
      setState("success")
      toast.success("Order details sent")
    } catch {
      setState("idle")
      toast.error("Could not send order details. Please try again.")
    }
  }

  if (state === "success") {
    return (
      <section className="mx-auto flex min-h-[58vh] max-w-3xl items-center justify-center px-4 py-12 md:px-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CheckCircle2Icon />
            </EmptyMedia>
            <EmptyTitle>Order request received</EmptyTitle>
            <EmptyDescription>
              We will contact you shortly to confirm payment and delivery.
            </EmptyDescription>
          </EmptyHeader>
          <Button nativeButton={false} render={<Link href="/products" />}>
            Continue Shopping
          </Button>
        </Empty>
      </section>
    )
  }

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
              Add items before starting checkout.
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
          Checkout
        </p>
        <h1 className="font-serif text-4xl font-semibold md:text-5xl">
          Delivery Details
        </h1>
        <p className="mt-4 text-muted-foreground">
          Share your contact and shipping details so we can confirm your order.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <form className="grid gap-5 rounded-lg border p-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" defaultValue={profile?.name} required autoComplete="name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={profile?.phone} required autoComplete="tel" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={profile?.email} required autoComplete="email" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Shipping address</Label>
            <Textarea id="address" name="address" defaultValue={profile?.address} required autoComplete="street-address" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={profile?.city} required autoComplete="address-level2" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" defaultValue={profile?.state} required autoComplete="address-level1" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pincode">PIN code</Label>
              <Input id="pincode" name="pincode" defaultValue={profile?.pincode} required autoComplete="postal-code" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Order notes</Label>
            <Textarea id="notes" name="notes" placeholder="Preferred delivery time, blouse details, or gifting notes" />
          </div>
          <Button size="lg" type="submit" disabled={state === "submitting"}>
            {state === "submitting" ? <Loader2Icon className="animate-spin" /> : null}
            Place Order Request
          </Button>
        </form>

        <aside className="h-fit rounded-lg border p-5">
          <h2 className="font-serif text-2xl font-semibold">Your Order</h2>
          <div className="mt-5 space-y-4">
            {cartDetailed.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium">
                    {product.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Qty {quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>
          <Separator className="my-5" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between gap-4 text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
