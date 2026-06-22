"use client"

import * as React from "react"
import { ExternalLinkIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import {
  readPartnerSettings,
  savePartnerSettings,
  type PartnerName,
  type PartnerProduct,
  type PartnerSearchSettings,
} from "@/lib/image-search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

const partners: PartnerName[] = ["Amazon", "Flipkart", "Meesho", "Myntra"]

const blankForm = {
  partner: "Amazon" as PartnerName,
  name: "",
  productUrl: "",
  affiliateUrl: "",
  imageUrl: "",
  estimatedPrice: "",
  tags: "",
}

function isSecureUrl(value: string) {
  if (!value) return true
  try {
    return new URL(value).protocol === "https:"
  } catch {
    return false
  }
}

export function AdminPartnerSettings() {
  const [settings, setSettings] = React.useState<PartnerSearchSettings>({ enabled: false, products: [] })
  const [form, setForm] = React.useState(blankForm)

  React.useEffect(() => setSettings(readPartnerSettings()), [])

  function persist(next: PartnerSearchSettings, message = "Partner settings saved") {
    setSettings(next)
    savePartnerSettings(next)
    toast.success(message)
  }

  function addProduct(event: React.FormEvent) {
    event.preventDefault()
    if (!isSecureUrl(form.productUrl) || !isSecureUrl(form.affiliateUrl) || !isSecureUrl(form.imageUrl)) {
      toast.error("Product, affiliate, and image URLs must use HTTPS.")
      return
    }
    if (!form.name.trim() || !form.productUrl || Number(form.estimatedPrice) <= 0) {
      toast.error("Add a product name, official URL, and estimated price.")
      return
    }
    const product: PartnerProduct = {
      id: crypto.randomUUID(),
      partner: form.partner,
      name: form.name.trim(),
      productUrl: form.productUrl.trim(),
      affiliateUrl: form.affiliateUrl.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      estimatedPrice: Number(form.estimatedPrice),
      tags: form.tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean),
      enabled: true,
    }
    persist({ ...settings, products: [...settings.products, product] }, "Partner product added")
    setForm(blankForm)
  }

  return (
    <div className="mt-10 space-y-8">
      <section className="rounded-xl border bg-card p-5 md:p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold">External partner results</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Show approved affiliate listings only when PR Handlooms has no close local image match.</p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) => persist({ ...settings, enabled })}
            aria-label="Enable external partner results"
          />
        </div>
        <div className="mt-5 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          Use official affiliate/API feeds or images you have permission to display. Never paste scraped product images. Every result is labelled as sold by the selected partner.
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5 md:p-6">
        <h2 className="font-serif text-2xl font-semibold">Add partner product</h2>
        <p className="mt-2 text-sm text-muted-foreground">The affiliate URL is used for the Buy button when supplied; otherwise the official product URL is used.</p>
        <form onSubmit={addProduct} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">Website badge
            <select value={form.partner} onChange={(event) => setForm({ ...form, partner: event.target.value as PartnerName })} className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              {partners.map((partner) => <option key={partner}>{partner}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-medium">Product name
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Banarasi silk floral saree" />
          </label>
          <label className="space-y-1.5 text-sm font-medium">Official product URL
            <Input type="url" required value={form.productUrl} onChange={(event) => setForm({ ...form, productUrl: event.target.value })} placeholder="https://…" />
          </label>
          <label className="space-y-1.5 text-sm font-medium">Commission / affiliate URL
            <Input type="url" value={form.affiliateUrl} onChange={(event) => setForm({ ...form, affiliateUrl: event.target.value })} placeholder="https://… (optional)" />
          </label>
          <label className="space-y-1.5 text-sm font-medium">Approved image URL
            <Input type="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="Official feed URL (optional)" />
          </label>
          <label className="space-y-1.5 text-sm font-medium">Estimated price (₹)
            <Input type="number" min="1" required value={form.estimatedPrice} onChange={(event) => setForm({ ...form, estimatedPrice: event.target.value })} placeholder="12999" />
          </label>
          <label className="space-y-1.5 text-sm font-medium md:col-span-2">Fabric/type tags
            <Input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="silk saree, banarasi, zari border, floral" />
          </label>
          <div className="md:col-span-2"><Button type="submit"><PlusIcon /> Add approved listing</Button></div>
        </form>
      </section>

      <section className="rounded-xl border bg-card p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl font-semibold">Approved listings</h2>
          <Badge variant="secondary">{settings.products.length} products</Badge>
        </div>
        {settings.products.length ? (
          <div className="mt-5 divide-y rounded-lg border">
            {settings.products.map((product) => (
              <div key={product.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <Badge className="w-fit">{product.partner}</Badge>
                <div className="min-w-0 flex-1"><p className="truncate font-medium">{product.name}</p><p className="mt-1 text-xs text-muted-foreground">₹{product.estimatedPrice.toLocaleString("en-IN")} · {product.affiliateUrl ? "Affiliate link enabled" : "Official URL"}</p></div>
                <div className="flex items-center gap-2">
                  <Switch checked={product.enabled} onCheckedChange={(enabled) => persist({ ...settings, products: settings.products.map((item) => item.id === product.id ? { ...item, enabled } : item) })} aria-label={`Enable ${product.name}`} />
                  <Button nativeButton={false} variant="ghost" size="icon" render={<a href={product.affiliateUrl || product.productUrl} target="_blank" rel="noopener noreferrer" />} aria-label={`Open ${product.name}`}><ExternalLinkIcon /></Button>
                  <Button variant="ghost" size="icon" aria-label={`Remove ${product.name}`} onClick={() => persist({ ...settings, products: settings.products.filter((item) => item.id !== product.id) }, "Partner product removed")}><Trash2Icon /></Button>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="mt-5 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No approved partner listings yet.</p>}
      </section>
    </div>
  )
}
