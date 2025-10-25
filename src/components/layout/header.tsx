"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Stethoscope, Menu, X } from "lucide-react";
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
    { href: "/dashboard/reports", label: "Reports" },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center gap-4 border-b bg-background px-6">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <div className="bg-primary text-primary-foreground rounded-md p-2">
            <Stethoscope className="h-6 w-6" />
        </div>
        <span className="text-xl font-headline">ClinicOffice</span>
      </Link>
      <nav className="hidden flex-1 items-center justify-center lg:flex">
        <ul className="flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-muted-foreground transition-colors hover:text-foreground",
                  pathname === link.href && "text-foreground"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center gap-4 ml-auto">
        <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://picsum.photos/seed/Amelia/100/100" alt="Amelia" />
                <AvatarFallback>A</AvatarFallback>
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
                        <div className="bg-primary text-primary-foreground rounded-md p-2">
                            <Stethoscope className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-headline">ClinicOffice</span>
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
      </div>
    </header>
  );
}
