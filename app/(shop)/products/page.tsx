import type { Metadata } from "next"

import { ProductGrid } from "@/components/product-grid"
import { products } from "@/lib/data"

export const metadata: Metadata = { title: "Shop All" }

export default function ProductsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12 md:px-6 md:py-16">
      <div className="mb-8 max-w-2xl md:mb-10">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-accent">The collection</p>
        <h1 className="font-serif text-4xl font-semibold md:text-5xl">Shop all handlooms</h1>
        <p className="mt-4 text-muted-foreground">Discover sarees, fabrics and home textiles woven by hand across India.</p>
      </div>
      <ProductGrid products={products} />
    </section>
  )
}
