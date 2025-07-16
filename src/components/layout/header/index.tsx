import { Button } from "~/components/ui/button";
import ThemeToggle from "~/components/shared/theme-toggle";
import Image from "next/image";

export default function Header() {
  return (
    <header className="h-20 w-full">
      <div className="container flex h-full items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image
            src="/FlowQL Logo.png"
            alt="FlowQL Logo"
            width={540}
            height={180}
            className="h-36 w-auto"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="default" size="sm">
            Login
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
