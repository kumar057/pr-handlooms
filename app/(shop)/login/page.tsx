import type { Metadata } from "next"

import { AuthPageClient } from "@/components/auth-page-client"

export const metadata: Metadata = { title: "Sign In" }

export default function LoginPage() {
  return <AuthPageClient />
}
