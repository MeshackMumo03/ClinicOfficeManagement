"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
  } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import React from "react";

const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/patients", label: "Patients" },
    { href: "/dashboard/appointments", label: "Appointments" },
    { href: "/dashboard/billing", label: "Billing" },
    { href: "/dashboard/chat", label: "Messages" },
    { href: "/dashboard/reports", label: "Reports" },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center gap-4 border-b bg-background px-6">
       <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                <div className="flex h-full flex-col py-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold px-6">
                        <Avatar className="h-10 w-10">
                            <AvatarImage data-ai-hint="professional person" src="https://picsum.photos/seed/evelyn/100/100" alt="Dr. Evelyn Reed" />
                            <AvatarFallback>ER</AvatarFallback>
                        </Avatar>
                        <span className="text-lg font-semibold">Dr. Evelyn Reed</span>
                    </Link>
                    <nav className="flex-1 mt-8">
                        <ul className="grid gap-2 px-6">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                            <Link
                                href={link.href}
                                className={cn(
                                "flex items-center gap-4 rounded-md px-4 py-2 text-lg font-medium transition-colors hover:bg-muted",
                                pathname === link.href
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "text-muted-foreground"
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                            </li>
                        ))}
                        </ul>
                    </nav>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      <div className="flex items-center gap-4 ml-auto">
        <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage data-ai-hint="professional person" src="https://picsum.photos/seed/evelyn/100/100" alt="Dr. Evelyn Reed" />
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
