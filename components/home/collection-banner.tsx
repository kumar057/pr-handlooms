import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CollectionBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:py-20">
      <div className="relative overflow-hidden rounded-lg">
        <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
          <Image
            src="/products/collection-bridal.png"
            alt="Bridal handloom saree collection draped over an antique chair"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
        </div>
        <div className="absolute inset-0 flex min-w-0 flex-col justify-center gap-4 p-5 sm:gap-5 sm:p-12 lg:p-16">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-background/80">
            The Bridal Edit
          </span>
          <h2 className="max-w-md font-serif text-3xl font-medium leading-tight text-balance text-background sm:text-4xl lg:text-5xl">
            Heirlooms for the Big Day
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-background/85 sm:text-base">
            Curated silks and Banarasis woven for the moments you&apos;ll treasure forever.
          </p>
          <Button
            size="lg"
            variant="secondary"
            nativeButton={false}
            className="max-w-full"
            render={<Link href="/categories/banarasi" />}
          >
            Discover the Collection
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  )
}
