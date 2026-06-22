import { products } from "@/lib/data"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesStrip } from "@/components/home/features-strip"
import { CategoriesSection } from "@/components/home/categories-section"
import { ProductCarousel } from "@/components/home/product-carousel"
import { CollectionBanner } from "@/components/home/collection-banner"
import { ArtisanStory } from "@/components/home/artisan-story"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { NewsletterSection } from "@/components/home/newsletter-section"

export default function HomePage() {
  const bestSellers = products.filter((p) => p.bestSeller)
  const newArrivals = products.filter((p) => p.newArrival)

  return (
    <>
      <HeroSection />
      <FeaturesStrip />
      <CategoriesSection />
      <ProductCarousel
        eyebrow="Customer Favourites"
        title="Best Sellers"
        description="The weaves our patrons can't stop reaching for."
        products={bestSellers}
        viewAllHref="/products"
        muted
      />
      <CollectionBanner />
      <ProductCarousel
        eyebrow="Just In"
        title="New Arrivals"
        description="Fresh off the loom, ready for their first drape."
        products={newArrivals}
        viewAllHref="/products"
      />
      <ArtisanStory />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  )
}
