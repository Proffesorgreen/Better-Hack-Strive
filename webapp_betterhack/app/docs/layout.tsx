import type React from "react"
import { Navigation } from "@/components/navigation"
import { DocsSidebar } from "@/components/docs-sidebar"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="flex pt-16">
        <DocsSidebar />
        <main className="flex-1 max-w-4xl mx-auto px-8 py-12">{children}</main>
      </div>
    </div>
  )
}
