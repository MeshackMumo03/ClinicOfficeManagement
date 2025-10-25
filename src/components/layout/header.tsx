"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/appointments", label: "Appointments" },
  { href: "/dashboard/patients", label: "Patients" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/consultations", label: "Reports" },
];

export function Header() {
  const pathname = usePathname();

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
      </div>
    </header>
  );
}
