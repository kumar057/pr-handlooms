import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { ProductPurchaseActions } from "@/components/product-purchase-actions"
import { Badge } from "@/components/ui/badge"
import { getProductBySlug, products } from "@/lib/data"
import { formatPrice } from "@/lib/utils"

type PageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = getProductBySlug((await params).slug)
  return product ? { title: product.name, description: product.description } : {}
}

export default async function ProductPage({ params }: PageProps) {
  const product = getProductBySlug((await params).slug)
  if (!product) notFound()

  return (
    <section className="mx-auto grid max-w-6xl min-w-0 gap-8 px-4 py-10 sm:py-12 md:grid-cols-2 md:px-6 md:py-16 lg:gap-10">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
        <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-col justify-center">
        <div className="flex flex-wrap gap-2">{product.badges.map((badge) => <Badge key={badge} variant="secondary">{badge}</Badge>)}</div>
        <p className="mt-5 text-sm uppercase tracking-[0.18em] text-muted-foreground">{product.categoryName}</p>
        <h1 className="mt-2 text-balance font-serif text-3xl font-semibold sm:text-4xl md:text-5xl">{product.name}</h1>
        <div className="mt-5 flex flex-wrap items-baseline gap-3"><span className="text-2xl font-semibold">{formatPrice(product.price)}</span>{product.compareAtPrice ? <span className="text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span> : null}</div>
        <p className="mt-6 leading-7 text-muted-foreground">{product.description}</p>
        <dl className="my-7 grid grid-cols-1 gap-4 rounded-xl border p-4 text-sm sm:grid-cols-2">
          <div className="min-w-0"><dt className="text-muted-foreground">Fabric</dt><dd className="mt-1 break-words font-medium">{product.fabric}</dd></div>
          <div className="min-w-0"><dt className="text-muted-foreground">Weave</dt><dd className="mt-1 break-words font-medium">{product.weave}</dd></div>
          <div className="min-w-0"><dt className="text-muted-foreground">Colour</dt><dd className="mt-1 break-words font-medium">{product.color}</dd></div>
          <div className="min-w-0"><dt className="text-muted-foreground">Availability</dt><dd className="mt-1 break-words font-medium">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</dd></div>
        </dl>
        <ProductPurchaseActions productId={product.id} productName={product.name} disabled={product.stock === 0} />
      </div>
    </section>
  )
}
