"use client";

import { Session } from "@prisma/client";
import { MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import LogoutButton from "~/components/shared/logout-button";
import { buttonVariants } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import ThemeToggle from "~/components/shared/theme-toggle";
import { cn } from "~/lib/utils";
export default function Navbar({
  session,
  headerText,
}: {
  session: Session;
  headerText: {
    changelog: string;
    about: string;
    login: string;
    dashboard: string;
    [key: string]: string;
  };
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <nav className="flex h-full items-center justify-between">
      <div className="flex items-center">
        {/* Empty space for future logo */}
      </div>
      <div className="hidden items-center gap-x-2 lg:flex">
        <ThemeToggle />
        {session ? (
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "bg-secondary"
            )}
            onClick={() => setIsModalOpen(false)}
          >
            {headerText.dashboard}
          </Link>
        ) : (
          <Link href="/login" className={buttonVariants()}>
            {headerText.login}
          </Link>
        )}
      </div>
      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetTrigger className="lg:hidden">
          <span className="sr-only">Open Menu</span>
          <MenuIcon />
        </SheetTrigger>
        <SheetContent>
          <div className="flex flex-col items-center space-y-10 py-10">
            <div className="space-y-4 text-center">
              <div className="mb-6">
                <ThemeToggle />
              </div>
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block font-semibold hover:underline hover:underline-offset-4"
                    onClick={() => setIsModalOpen(false)}
                  >
                    {headerText.dashboard}
                  </Link>
                  <LogoutButton className="!mt-20" />
                </>
              ) : (
                <Link
                  href="/login"
                  className={buttonVariants()}
                  onClick={() => setIsModalOpen(false)}
                >
                  {headerText.login}
                </Link>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
