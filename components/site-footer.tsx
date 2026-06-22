"use client"

import Link from "next/link"
import {
  Camera,
  Share2,
  MessageCircle,
  Mail,
  Phone,
} from "lucide-react"
import { toast } from "sonner"

import { categories } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const shopLinks = [
  { href: "/products", label: "Shop All" },
  { href: "/categories", label: "Categories" },
  { href: "/cart", label: "Your Bag" },
  { href: "/account", label: "Order Tracking" },
]

const companyLinks = [
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Sign In" },
  { href: "/admin", label: "Admin" },
]

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr]">
          <div className="flex flex-col gap-4">
            <span className="font-serif text-2xl font-semibold tracking-wide">
              PR Handlooms
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/70">
              Premium handcrafted Indian handlooms. Woven with tradition,
              designed for the modern connoisseur.
            </p>
            <div className="flex gap-2">
              {[Camera, Share2, MessageCircle].map((Icon, i) => (
                <Button
                  key={i}
                  size="icon"
                  variant="ghost"
                  aria-label="Social link"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Icon />
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wide">
              Shop
            </h3>
            {shopLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wide">
              Collections
            </h3>
            {categories.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
              >
                {c.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wide">
              Stay in the Weave
            </h3>
            <p className="text-sm text-primary-foreground/70">
              Subscribe for new collections and private sale invitations.
            </p>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                e.currentTarget.reset()
                toast.success("Thank you for subscribing!")
              }}
            >
              <Input
                type="email"
                required
                placeholder="Email address"
                aria-label="Email address"
                className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button
                type="submit"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Join
              </Button>
            </form>
            <div className="flex flex-col gap-1.5 text-sm text-primary-foreground/70">
              <a
                href="mailto:guddantipraveenkumar@gmail.com"
                className="flex items-center gap-2 transition-colors hover:text-accent"
              >
                <Mail className="size-4" />
                guddantipraveenkumar@gmail.com
              </a>
              <a
                href="tel:+916301055471"
                className="flex items-center gap-2 transition-colors hover:text-accent"
              >
                <Phone className="size-4" />
                +91 63010 55471
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-primary-foreground/15" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-primary-foreground/60 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} PR Handlooms. Crafted by Praveen
            Kumar. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Shipping &amp; Returns</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
