"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Star, Target, LayoutDashboard } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/goals", label: "Goals", icon: Target },
];

export function AppHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            Metis
          </Link>
          <h1 className="text-2xl font-bold mt-1">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <nav className="flex items-center gap-1" aria-label="Main">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    active && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="size-4" aria-hidden="true" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
