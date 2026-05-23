"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { VeynMark } from "@/components/brand/VeynMark";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Product", href: "/product" },
  { label: "Integrations", href: "/integrations" },
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
];

export function PublicNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080b12]/88 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" aria-label="Veyn home" className="shrink-0">
          <VeynMark />
        </Link>

        <nav className="mx-auto hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="sm" className="bg-[#5fa4ff] text-[#f7fbff] hover:bg-[#74b1ff]">
            <Link href="/signup">Start free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
