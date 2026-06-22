import type { Metadata } from "next"

import { AccountPageClient } from "@/components/account-page-client"

export const metadata: Metadata = { title: "Your Account" }

export default function AccountPage() {
  return <AccountPageClient />
}
