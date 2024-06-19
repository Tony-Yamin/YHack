import * as React from "react"
import Link from "next/link"

import { NavItem } from "@/types/nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface MainNavProps {
}

export function MainNav({}: MainNavProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center">
        <span className="inline-block font-mono font-bold text-2xl pl-2">Y</span>
        <span className="inline-block font-mono font-bold text-2xl">Groove</span>
      </Link>
    </div>
  )
}
