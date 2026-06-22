import { Quote } from "lucide-react"
import { testimonials } from "@/lib/data"
import { SectionHeading } from "@/components/section-heading"
import { StarRating } from "@/components/star-rating"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:py-20">
      <SectionHeading
        eyebrow="Loved by Many"
        title="What Our Patrons Say"
        description="Real words from the families who wear our weaves."
      />
      <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
        {testimonials.map((t) => (
          <Card key={t.id} className="h-full min-w-0 bg-card">
            <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
              <Quote className="size-6 text-primary" aria-hidden="true" />
              <div className="min-h-5">
                <StarRating rating={t.rating} size="sm" />
              </div>
              <p className="text-pretty leading-relaxed text-muted-foreground">{t.quote}</p>
            </CardContent>
            <CardFooter className="mt-auto min-h-20 flex-col items-start justify-center gap-0.5 border-t border-border pt-4">
              <p className="line-clamp-1 font-medium text-foreground">{t.name}</p>
              <p className="line-clamp-1 text-sm text-muted-foreground">{t.location}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
