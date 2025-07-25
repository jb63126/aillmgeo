"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import Icons from "../shared/icons";
import LogoutButton from "../shared/logout-button";
import ThemeToggle from "../shared/theme-toggle";

const navItems = [
  {
    title: "Dashboard",
    href: "/en/dashboard",
    icon: Icons.dashboard,
  },
  {
    title: "Analytics",
    href: "/en/dashboard/analytics",
    icon: Icons.analytics,
  },
  {
    title: "Analysis Lab",
    href: "/en/dashboard/analysis-lab",
    icon: Icons.analysisLab,
  },
  {
    title: "Assets",
    href: "/en/dashboard/assets",
    icon: Icons.assets,
  },
  {
    title: "Settings",
    href: "/en/dashboard/settings",
    icon: Icons.settings,
  },
];

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export default function SidebarNav({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  return (
    <nav
      className={cn("flex h-full gap-x-2 lg:flex-col lg:gap-y-1.5", className)}
      {...props}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            isActive(item.href)
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start"
          )}
        >
          {<item.icon className="mr-2 h-4 w-4" />} {item.title}
        </Link>
      ))}

      <div className="mt-auto hidden space-y-1.5 lg:block">
        <div className="flex justify-start">
          <ThemeToggle />
        </div>
        <LogoutButton />
      </div>
    </nav>
  );
}
