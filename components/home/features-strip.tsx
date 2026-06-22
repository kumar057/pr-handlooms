"use client"

import { Truck, ShieldCheck, Repeat, Headset } from "lucide-react"

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On all orders above ₹2,999 across India.",
  },
  {
    icon: ShieldCheck,
    title: "Authentic Weaves",
    description: "Every piece certified handloom.",
  },
  {
    icon: Repeat,
    title: "Easy Returns",
    description: "7-day hassle-free returns.",
  },
  {
    icon: Headset,
    title: "Dedicated Support",
    description: "Personal styling assistance.",
  },
]

export function FeaturesStrip() {
  return (
    <section className="border-y border-border bg-secondary">
      <div className="mx-auto grid max-w-7xl auto-rows-fr grid-cols-2 gap-4 px-4 py-8 md:px-6 md:py-10 lg:grid-cols-4 lg:gap-6">
        {features.map((feature) => (
          <div key={feature.title} className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <feature.icon className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-foreground sm:text-base">{feature.title}</h3>
              <p className="text-xs text-muted-foreground sm:text-sm">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
