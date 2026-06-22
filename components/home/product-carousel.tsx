"use client"

import Link from "next/link"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"
import { SectionHeading } from "@/components/section-heading"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface ProductCarouselProps {
  eyebrow: string
  title: string
  description?: string
  products: Product[]
  viewAllHref?: string
  muted?: boolean
}

export function ProductCarousel({
  eyebrow,
  title,
  description,
  products,
  viewAllHref,
  muted,
}: ProductCarouselProps) {
  return (
    <section className={muted ? "bg-secondary" : ""}>
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:py-20">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <Carousel opts={{ align: "start" }} className="w-full">
          <div className="mb-6 flex items-center justify-end gap-2">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
          <CarouselContent className="-ml-4 items-stretch">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="flex basis-full pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {viewAllHref ? (
          <div className="mt-10 flex justify-center">
            <Button variant="outline" size="lg" nativeButton={false} render={<Link href={viewAllHref} />}>
              View All
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
