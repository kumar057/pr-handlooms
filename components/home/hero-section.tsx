"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 md:px-6 md:py-16 lg:grid-cols-2 lg:gap-12 lg:py-20">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Handwoven in India
          </span>
          <h1 className="font-serif text-4xl font-medium leading-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
            Timeless Handlooms, Woven with Soul
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Discover PR Handlooms&apos; curated collection of authentic silk and cotton weaves, crafted by master
            artisans and made to be treasured for generations.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/products" />}>
              Shop Collection
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/about" />}>
              Our Story
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <div className="flex flex-col">
              <span className="font-serif text-2xl text-foreground">25+</span>
              Years of Craft
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl text-foreground">500+</span>
              Artisan Weavers
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl text-foreground">100%</span>
              Authentic Weaves
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg lg:aspect-[3/4]">
            <Image
              src="/products/hero-saree.png"
              alt="Elegant woman draped in a navy and gold handloom silk saree"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 hidden rounded-lg border border-border bg-background p-4 shadow-lg sm:block">
            <p className="font-serif text-lg text-foreground">Festive Edit 2026</p>
            <p className="text-sm text-muted-foreground">Now Live</p>
          </div>
        </div>
      </div>
    </section>
  )
}
