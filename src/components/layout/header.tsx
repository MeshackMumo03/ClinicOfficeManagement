"use client";

// Import necessary hooks, components, and Firebase functions.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Stethoscope, Menu, Bell } from "lucide-react";
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
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useAuth } from "@/firebase";

// Navigation links for the header.
const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/appointments", label: "Appointments" },
    { href: "/dashboard/patients", label: "Patients" },
    { href: "/dashboard/consultations", label: "Consultations" },
    { href: "/dashboard/billing", label: "Billing" },
    { href: "/dashboard/reports", label: "Reports" },
    { href: "/dashboard/chat", label: "Messages" },
];

/**
 * A utility function to get initials from a name.
 * @param name The full name.
 * @returns The initials of the name.
 */
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

/**
 * Header component for the dashboard layout.
 * It includes navigation links, user menu, and a mobile menu.
 */
export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();

  // Memoized reference to the user's document in Firestore.
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  // Fetch user data from Firestore.
  const { data: userData } = useDoc(userDocRef);

  // Determine display name and avatar fallback.
  const displayName = userData?.name || user?.email || "User";
  const avatarFallback = displayName ? getInitials(displayName) : "U";


  // Handle user logout.
  const handleLogout = async () => {
    try {
        await signOut(auth);
        router.push('/login');
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center gap-4 border-b bg-background px-6">
      {/* Logo and site title. */}
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <div className="bg-primary text-primary-foreground rounded-md p-2">
          <Stethoscope className="h-6 w-6" />
        </div>
        <span className="text-xl font-headline">ClinicOffice</span>
      </Link>
      {/* Desktop navigation links. */}
      <nav className="hidden md:flex items-center gap-6 ml-10">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-muted-foreground transition-colors hover:text-foreground font-medium",
              (pathname.startsWith(link.href) && link.href !== "/dashboard") || pathname === link.href ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
       {/* Right section of the header with notifications and user menu. */}
       <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Toggle notifications</span>
            </Button>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-9 w-9">
                    <AvatarImage data-ai-hint="person face" src={user?.photoURL || undefined} alt={displayName} />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
            {/* Mobile menu. */}
            <div className="md:hidden">
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
                                    pathname.startsWith(link.href)
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
