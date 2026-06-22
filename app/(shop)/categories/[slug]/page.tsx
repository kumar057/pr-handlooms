import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductGrid } from "@/components/product-grid"
import { categories, getProductsByCategory } from "@/lib/data"

type PageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return categories.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = categories.find((item) => item.slug === slug)
  return category ? { title: category.name, description: category.description } : {}
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const category = categories.find((item) => item.slug === slug)
  if (!category) notFound()

  const products = getProductsByCategory(slug)

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12 md:px-6 md:py-16">
      <div className="mb-8 max-w-2xl md:mb-10">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-accent">Collection</p>
        <h1 className="font-serif text-4xl font-semibold md:text-5xl">{category.name}</h1>
        <p className="mt-4 text-muted-foreground">{category.description}</p>
      </div>
      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <p className="rounded-lg border bg-card p-8 text-muted-foreground">New pieces from this collection are coming soon.</p>
      )}
    </section>
  )
}
