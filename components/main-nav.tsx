"use client"

import { useLanguage } from "@/components/language-provider"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const routes = [
    {
      href: "/",
      label: t("nav.home"),
      active: pathname === "/",
    },
    {
      href: "/processes",
      label: t("nav.processes"),
      active: pathname === "/processes",
    },
    {
      href: "/proposals",
      label: t("nav.proposals"),
      active: pathname === "/proposals",
    },
    {
      href: "/discussions",
      label: t("nav.discussions"),
      active: pathname === "/discussions",
    },
    {
      href: "/about",
      label: t("nav.about"),
      active: pathname === "/about",
    },
  ]

  return (
    <nav className="hidden md:flex gap-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
