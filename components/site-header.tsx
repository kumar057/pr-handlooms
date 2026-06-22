"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HeartIcon,
  MenuIcon,
  SearchIcon,
  ShoppingBagIcon,
  UserIcon,
  ChevronDownIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { categories } from "@/lib/data"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SearchModal } from "@/components/search/SearchModal"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSearchModal } from "@/hooks/useSearchModal"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop All" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { cartCount, wishlistCount, setCartOpen, hydrated } = useStore()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const searchModal = useSearchModal()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-9 items-center justify-center bg-primary px-4 text-center text-xs text-primary-foreground">
        Complimentary shipping across India on orders above ₹5,000
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        {/* Mobile menu */}
        <div className="flex items-center gap-1 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu" />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="font-serif text-xl tracking-wide">
                  PR Handlooms
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-muted",
                      pathname === link.href && "bg-muted text-accent",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Separator className="my-2" />
                <span className="px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                  Collections
                </span>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/categories/${c.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    {c.name}
                  </Link>
                ))}
                <Separator className="my-2" />
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  Sign In
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  Admin Dashboard
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none md:flex-1">
          <span className="font-serif text-xl font-semibold tracking-wide md:text-2xl">
            PR Handlooms
          </span>
          <span className="hidden text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground md:block">
            Heritage Weaves
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) =>
            link.label === "Categories" ? (
              <DropdownMenu key={link.href}>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "font-medium",
                    pathname?.startsWith("/categories") && "text-accent",
                  )}
                >
                  Categories
                  <ChevronDownIcon data-icon="inline-end" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  <DropdownMenuGroup>
                    {categories.map((c) => (
                      <DropdownMenuItem
                        key={c.id}
                        render={<Link href={`/categories/${c.slug}`} />}
                      >
                        {c.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={link.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "font-medium",
                  pathname === link.href && "text-accent",
                )}
                href={link.href}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-0.5 md:flex-1 md:justify-end">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open search"
            onClick={searchModal.open}
            title="Search (Ctrl+K)"
          >
            <SearchIcon />
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            aria-label="Account"
            className="hidden sm:inline-flex"
            render={<Link href="/login" />}
          >
            <UserIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            aria-label="Wishlist"
            className="relative"
            render={<Link href="/account" />}
          >
            <HeartIcon />
            {hydrated && wishlistCount > 0 ? (
              <Badge className="absolute -right-0.5 -top-0.5 size-4 justify-center rounded-full bg-accent p-0 text-[0.6rem] text-accent-foreground">
                {wishlistCount}
              </Badge>
            ) : null}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open cart"
            className="relative"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBagIcon />
            {hydrated && cartCount > 0 ? (
              <Badge className="absolute -right-0.5 -top-0.5 size-4 justify-center rounded-full bg-accent p-0 text-[0.6rem] text-accent-foreground">
                {cartCount}
              </Badge>
            ) : null}
          </Button>
        </div>
      </div>
      <SearchModal open={searchModal.isOpen} onOpenChange={searchModal.setIsOpen} />
    </header>
  )
}
