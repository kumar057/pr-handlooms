import type { Metadata } from "next"

import { AdminPartnerSettings } from "@/components/admin-partner-settings"

export const metadata: Metadata = { title: "Admin Dashboard" }

export default function AdminPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-20">
      <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-accent">Administration</p>
      <h1 className="text-balance font-serif text-4xl font-semibold md:text-5xl">Dashboard</h1>
      <p className="mt-4 text-muted-foreground">
        Manage visual search and approved external partner inventory.
      </p>
      <AdminPartnerSettings />
    </section>
  )
}
