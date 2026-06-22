"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { HeartIcon, LogOutIcon, SaveIcon, UserIcon } from "lucide-react"
import { toast } from "sonner"

import {
  getCurrentUser,
  signOutUser,
  updateSavedProfile,
  type PublicUserProfile,
} from "@/lib/local-auth"
import { useStore } from "@/lib/store"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export function AccountPageClient() {
  const { wishlistDetailed } = useStore()
  const [user, setUser] = React.useState<PublicUserProfile | null>(null)

  React.useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  function handleSignOut() {
    signOutUser()
    setUser(null)
    toast.success("Signed out")
  }

  function handleProfileSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      const nextUser = updateSavedProfile({
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        address: String(formData.get("address") || "").trim(),
        city: String(formData.get("city") || "").trim(),
        state: String(formData.get("state") || "").trim(),
        pincode: String(formData.get("pincode") || "").trim(),
      })
      setUser(nextUser)
      toast.success("Profile saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save")
    }
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center md:px-6 md:py-24">
        <h1 className="font-serif text-4xl font-semibold">Your account</h1>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Sign in to save your checkout details and manage your wishlist.
        </p>
        <Button className="mt-8" nativeButton={false} render={<Link href="/login" />}>
          Sign in
        </Button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:py-12 md:px-6 md:py-16">
      <div className="flex flex-col gap-5 rounded-lg border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted">
            <UserIcon className="size-7 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm uppercase tracking-[0.18em] text-accent">
              Signed in
            </p>
            <h1 className="truncate font-serif text-3xl font-semibold">
              {user.name || "Customer"}
            </h1>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOutIcon />
          Sign out
        </Button>
      </div>

      <form className="mt-8 grid gap-5 rounded-lg border p-5" onSubmit={handleProfileSave}>
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-accent">
            Profile
          </p>
          <h2 className="font-serif text-2xl font-semibold">
            Saved checkout details
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" defaultValue={user.name} required autoComplete="name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={user.phone} required autoComplete="tel" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={user.email} required autoComplete="email" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Shipping address</Label>
          <Textarea id="address" name="address" defaultValue={user.address} required autoComplete="street-address" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={user.city} required autoComplete="address-level2" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" defaultValue={user.state} required autoComplete="address-level1" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pincode">PIN code</Label>
            <Input id="pincode" name="pincode" defaultValue={user.pincode} required autoComplete="postal-code" />
          </div>
        </div>
        <Button className="w-fit" type="submit">
          <SaveIcon />
          Save Profile
        </Button>
      </form>

      <div className="mt-8 rounded-lg border p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-accent">
              Wishlist
            </p>
            <h2 className="font-serif text-2xl font-semibold">Saved items</h2>
          </div>
          <Button variant="outline" nativeButton={false} render={<Link href="/products" />}>
            Shop
          </Button>
        </div>
        <Separator className="my-5" />
        {wishlistDetailed.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HeartIcon />
              </EmptyMedia>
              <EmptyTitle>No saved items yet</EmptyTitle>
              <EmptyDescription>
                Tap the heart on products you want to revisit.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {wishlistDetailed.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 rounded-lg border p-3 transition-colors hover:border-accent"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 font-medium">{product.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {product.categoryName}
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
