import type { Metadata } from "next"

import { CategoriesSection } from "@/components/home/categories-section"

export const metadata: Metadata = { title: "Categories" }

export default function CategoriesPage() {
  return <CategoriesSection />
}
