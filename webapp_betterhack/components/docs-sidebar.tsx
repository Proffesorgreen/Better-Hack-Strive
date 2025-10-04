"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const docsSections = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { title: "Schema Format", href: "/docs/schema-format" },
      { title: "Field Types", href: "/docs/field-types" },
      { title: "Validation", href: "/docs/validation" },
    ],
  },
  {
    title: "Examples",
    items: [
      { title: "Login Form", href: "/docs/examples/login" },
      { title: "Signup Form", href: "/docs/examples/signup" },
      { title: "Password Reset", href: "/docs/examples/password-reset" },
    ],
  },
]

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-card/50 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <nav className="p-6 space-y-8">
        {docsSections.map((section) => (
          <div key={section.title}>
            <h4 className="font-semibold text-sm mb-3">{section.title}</h4>
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block text-sm py-1.5 px-3 rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
