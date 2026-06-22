import Image from "next/image"
import Link from "next/link"
import { categories } from "@/lib/data"
import { SectionHeading } from "@/components/section-heading"

export function CategoriesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:py-20">
      <SectionHeading
        eyebrow="Shop by Category"
        title="Explore Our Weaves"
        description="From bridal Banarasis to everyday cottons, find the handloom that speaks to you."
      />
      <div className="grid auto-rows-fr grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group flex min-w-0 flex-col gap-3 text-center"
          >
            <div className="relative aspect-square overflow-hidden rounded-full border border-border">
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div>
              <h3 className="line-clamp-1 font-serif text-sm text-foreground sm:text-base">{category.name}</h3>
              <p className="text-xs text-muted-foreground">{category.productCount} items</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
