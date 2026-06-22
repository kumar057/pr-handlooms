import type { Metadata } from "next"

export const metadata: Metadata = { title: "Our Story" }

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 text-center md:px-6 md:py-20">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-accent">Our story</p>
      <h1 className="text-balance font-serif text-4xl font-semibold md:text-6xl">Heritage, woven for today</h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">PR Handlooms brings together time-honoured Indian weaving traditions and contemporary design, celebrating the hands and stories behind every textile.</p>
    </section>
  )
}
