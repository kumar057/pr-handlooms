"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSection() {
  const [email, setEmail] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    toast.success("Welcome to the family!", {
      description: "You'll be the first to hear about new collections.",
    })
    setEmail("")
  }

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-12 text-center md:px-6 md:py-16 lg:py-20">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground/70">
          Join the Circle
        </span>
        <h2 className="font-serif text-3xl font-medium leading-tight text-balance md:text-4xl">
          Be the First to Know
        </h2>
        <p className="max-w-md leading-relaxed text-primary-foreground/80">
          Subscribe for early access to new weaves, artisan stories, and exclusive offers.
        </p>
        <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email address"
            className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60"
          />
          <Button type="submit" variant="secondary" size="lg">
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  )
}
