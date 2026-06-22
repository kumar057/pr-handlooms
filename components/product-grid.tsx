import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
