"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import ThemeToggle from "~/components/shared/theme-toggle";

export default function Header() {
  const params = useParams();
  const locale = params?.locale || "en";

  return (
    <header className="h-20 w-full">
      <div className="container flex h-full items-center justify-between">
        <div className="flex items-center space-x-4">{/* Logo removed */}</div>
        <div className="flex items-center space-x-4">
          <Link href={`/${locale}/login`}>
            <Button variant="default" size="sm">
              Login
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
