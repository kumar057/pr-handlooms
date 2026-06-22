import type { Metadata } from "next"

export const metadata: Metadata = { title: "Contact" }

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
      <h1 className="text-balance font-serif text-4xl font-semibold md:text-5xl">We would love to hear from you</h1>
      <p className="mt-5 text-muted-foreground">For product questions, styling help, or order support, contact our team.</p>
      <div className="mt-10 grid auto-rows-fr gap-4 sm:grid-cols-2">
        <a className="min-w-0 rounded-lg border bg-card p-5 transition-colors hover:border-accent sm:p-6" href="mailto:guddantipraveenkumar@gmail.com"><span className="block text-sm text-muted-foreground">Email</span><span className="mt-2 block break-all font-medium">guddantipraveenkumar@gmail.com</span></a>
        <a className="min-w-0 rounded-lg border bg-card p-5 transition-colors hover:border-accent sm:p-6" href="tel:+916301055471"><span className="block text-sm text-muted-foreground">Phone</span><span className="mt-2 block font-medium">+91 63010 55471</span></a>
      </div>
    </section>
  )
}
