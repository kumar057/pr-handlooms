import { NextResponse } from "next/server"

type CheckoutItem = {
  sku?: string
  name?: string
  price?: number
  quantity?: number
}

function formatItems(items: CheckoutItem[] = []) {
  return items
    .map((item) => {
      const quantity = Number(item.quantity || 0)
      const price = Number(item.price || 0)
      return `${quantity} x ${item.name || "Item"} (${item.sku || "No SKU"}) - INR ${price * quantity}`
    })
    .join("\n")
}

async function sendToFormspree(payload: Record<string, unknown>) {
  const endpoint = process.env.FORMSPREE_ENDPOINT

  if (!endpoint) {
    return { configured: false }
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Formspree submission failed")
  }

  return { configured: true }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const customer = body.customer || {}
    const totals = body.totals || {}
    const items = Array.isArray(body.items) ? body.items : []

    const result = await sendToFormspree({
      _subject: "New PR Handlooms checkout request",
      type: "checkout",
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      notes: customer.notes,
      itemCount: totals.itemCount,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
      orderItems: formatItems(items),
    })

    return NextResponse.json({
      ok: true,
      emailConfigured: result.configured,
    })
  } catch {
    return NextResponse.json(
      { ok: false, message: "Unable to submit checkout request" },
      { status: 500 },
    )
  }
}
