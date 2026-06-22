import { NextResponse } from "next/server"

type CartAlertItem = {
  sku?: string
  name?: string
  price?: number
  quantity?: number
}

function formatItems(items: CartAlertItem[] = []) {
  return items
    .map((item) => {
      const quantity = Number(item.quantity || 0)
      const price = Number(item.price || 0)
      return `${quantity} x ${item.name || "Item"} (${item.sku || "No SKU"}) - INR ${price * quantity}`
    })
    .join("\n")
}

export async function POST(request: Request) {
  try {
    const endpoint = process.env.FORMSPREE_ENDPOINT
    const body = await request.json()

    if (!endpoint) {
      return NextResponse.json({ ok: true, emailConfigured: false })
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _subject: "PR Handlooms cart alert: 4+ items added",
        type: "large-cart-alert",
        itemCount: body.itemCount,
        subtotal: body.subtotal,
        cartItems: formatItems(Array.isArray(body.items) ? body.items : []),
      }),
    })

    if (!response.ok) {
      throw new Error("Formspree submission failed")
    }

    return NextResponse.json({ ok: true, emailConfigured: true })
  } catch {
    return NextResponse.json(
      { ok: false, message: "Unable to send cart alert" },
      { status: 500 },
    )
  }
}
