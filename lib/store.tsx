"use client"

/**
 * Client-side store for cart + wishlist, persisted to localStorage.
 *
 * NOTE: This layer is intentionally abstracted behind a context so the
 * persistence implementation (localStorage today) can be swapped for a
 * Supabase-backed sync later without touching consumer components.
 */

import * as React from "react"
import { products } from "./data"
import type { CartItem, Product } from "./types"

const CART_KEY = "prh.cart"
const WISHLIST_KEY = "prh.wishlist"
const LARGE_CART_ALERT_KEY = "prh.large-cart-alert"
const LARGE_CART_ALERT_THRESHOLD = 4

type StoreContextValue = {
  hydrated: boolean
  // Cart
  cart: CartItem[]
  cartCount: number
  cartSubtotal: number
  cartDetailed: { product: Product; quantity: number }[]
  addToCart: (productId: string, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  // Wishlist
  wishlist: string[]
  wishlistCount: number
  wishlistDetailed: Product[]
  toggleWishlist: (productId: string) => void
  isWishlisted: (productId: string) => boolean
  // Mini cart drawer
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
}

const StoreContext = React.createContext<StoreContextValue | null>(null)

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = React.useState(false)
  const [cart, setCart] = React.useState<CartItem[]>([])
  const [wishlist, setWishlist] = React.useState<string[]>([])
  const [cartOpen, setCartOpen] = React.useState(false)

  // Hydrate from localStorage once on mount.
  React.useEffect(() => {
    setCart(readStorage<CartItem[]>(CART_KEY, []))
    setWishlist(readStorage<string[]>(WISHLIST_KEY, []))
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart, hydrated])

  React.useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist))
  }, [wishlist, hydrated])

  const addToCart = React.useCallback((productId: string, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        )
      }
      return [...prev, { productId, quantity }]
    })
  }, [])

  const removeFromCart = React.useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const updateQuantity = React.useCallback(
    (productId: string, quantity: number) => {
      setCart((prev) =>
        quantity <= 0
          ? prev.filter((i) => i.productId !== productId)
          : prev.map((i) =>
              i.productId === productId ? { ...i, quantity } : i,
            ),
      )
    },
    [],
  )

  const clearCart = React.useCallback(() => setCart([]), [])

  const toggleWishlist = React.useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    )
  }, [])

  const isWishlisted = React.useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  )

  const cartDetailed = React.useMemo(
    () =>
      cart
        .map((item) => {
          const product = products.find((p) => p.id === item.productId)
          return product ? { product, quantity: item.quantity } : null
        })
        .filter(Boolean) as { product: Product; quantity: number }[],
    [cart],
  )

  const cartCount = React.useMemo(
    () => cart.reduce((sum, i) => sum + i.quantity, 0),
    [cart],
  )

  const cartSubtotal = React.useMemo(
    () =>
      cartDetailed.reduce(
        (sum, { product, quantity }) => sum + product.price * quantity,
        0,
      ),
    [cartDetailed],
  )

  const wishlistDetailed = React.useMemo(
    () =>
      wishlist
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean) as Product[],
    [wishlist],
  )

  React.useEffect(() => {
    if (!hydrated || cartCount < LARGE_CART_ALERT_THRESHOLD) return

    const alertSignature = cart
      .map((item) => `${item.productId}:${item.quantity}`)
      .sort()
      .join("|")

    const lastAlertSignature = window.localStorage.getItem(
      LARGE_CART_ALERT_KEY,
    )
    if (lastAlertSignature === alertSignature) return

    window.localStorage.setItem(LARGE_CART_ALERT_KEY, alertSignature)

    fetch("/api/cart-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemCount: cartCount,
        subtotal: cartSubtotal,
        items: cartDetailed.map(({ product, quantity }) => ({
          id: product.id,
          sku: product.sku,
          name: product.name,
          slug: product.slug,
          price: product.price,
          quantity,
        })),
      }),
    }).catch(() => {
      window.localStorage.removeItem(LARGE_CART_ALERT_KEY)
    })
  }, [cart, cartCount, cartDetailed, cartSubtotal, hydrated])

  const value: StoreContextValue = {
    hydrated,
    cart,
    cartCount,
    cartSubtotal,
    cartDetailed,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    wishlist,
    wishlistCount: wishlist.length,
    wishlistDetailed,
    toggleWishlist,
    isWishlisted,
    cartOpen,
    setCartOpen,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within a StoreProvider")
  return ctx
}
