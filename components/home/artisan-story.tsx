import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ArtisanStory() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 md:px-6 md:py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
          <Image
            src="/products/artisan-loom.png"
            alt="Master weaver working golden silk thread on a traditional handloom"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-6">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Our Heritage
          </span>
          <h2 className="font-serif text-3xl font-medium leading-tight text-balance text-foreground sm:text-4xl">
            Every Thread Tells a Story
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            For over two decades, PR Handlooms has partnered directly with weaving families across India,
            preserving generations-old techniques. Each saree is a labour of love, woven on traditional looms
            using pure silks, natural dyes, and real zari.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            When you choose PR Handlooms, you support the artisans keeping this living craft alive, and you bring
            home a piece woven with intention and soul.
          </p>
          <Button size="lg" variant="outline" nativeButton={false} className="w-fit" render={<Link href="/about" />}>
            Read Our Story
          </Button>
        </div>
      </div>
    </section>
  )
}
