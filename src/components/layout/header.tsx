
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import React from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useAuth } from "@/firebase";

// Navigation links for the header, with role-based access control.
const allNavLinks = [
    { href: "/dashboard", label: "Dashboard", roles: ["admin", "doctor", "receptionist", "patient"] },
    { href: "/dashboard/appointments", label: "Appointments", roles: ["admin", "doctor", "receptionist", "patient"] },
    { href: "/dashboard/patients", label: "Patients", roles: ["admin", "doctor", "receptionist"] },
    { href: "/dashboard/consultations", label: "Consultations", roles: ["admin", "doctor"] },
    { href: "/dashboard/billing", label: "Billing", roles: ["admin", "receptionist", "patient"] },
    { href: "/dashboard/reports", label: "Reports", roles: ["admin"] },
    { href: "/dashboard/chat", label: "Messages", roles: ["admin", "doctor", "receptionist", "patient"] },
];

/**
 * A utility function to get initials from a name.
 * @param {string} name The full name.
 * @returns {The initials of the name.}
 */
function getInitials(name: string) {
  if (!name) return "U";
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
  const userRole = userData?.role;

  // Filter navigation links based on user role. Admin sees all links.
  const navLinks = userRole === 'admin'
    ? allNavLinks
    : allNavLinks.filter(link => userRole && link.roles.includes(userRole));

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

  const roleColorClass = {
    admin: 'bg-role-admin',
    doctor: 'bg-role-doctor',
    receptionist: 'bg-role-receptionist',
    patient: 'bg-role-patient',
  }[userRole] || 'bg-primary';

  return (
    <header className="sticky top-0 z-40 flex h-20 flex-col items-center gap-4 border-b bg-background px-6">
      {/* Animated Role Bar */}
      <div className="w-full absolute top-0 left-0 h-1">
        <div className={cn('h-full animate-role-bar-in', roleColorClass)} />
      </div>

      <div className="flex items-center w-full h-full">
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
                (pathname.startsWith(link.href) && (link.href !== "/dashboard" && link.href !== "/admin" )) || pathname === link.href ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
           {userRole === 'admin' && (
             <Link
                href="/admin"
                className={cn(
                    "text-muted-foreground transition-colors hover:text-foreground font-medium",
                    pathname.startsWith('/admin') ? "text-foreground" : "text-muted-foreground"
                )}
             >
                Admin
             </Link>
           )}
        </nav>
        {/* Right section of the header with notifications and user menu. */}
        <div className="ml-auto flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Toggle notifications</span>
              </Button>
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-2 h-12">
                  <Avatar className="h-9 w-9">
                      <AvatarImage data-ai-hint="person face" src={user?.photoURL || undefined} alt={displayName} />
                      <AvatarFallback>{avatarFallback}</AvatarFallback>
                  </Avatar>
                   <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">{displayName}</span>
                        {userRole && <Badge className={cn("text-xs capitalize -ml-0.5", roleColorClass)}>{userRole}</Badge>}
                    </div>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
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
                               {userRole === 'admin' && (
                                 <li>
                                  <Link
                                      href="/admin"
                                      className={cn(
                                      "flex items-center gap-4 rounded-md px-4 py-2 text-lg font-medium transition-colors hover:bg-muted",
                                      pathname.startsWith('/admin')
                                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                          : "text-muted-foreground"
                                      )}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                      Admin
                                  </Link>
                                  </li>
                               )}
                              </ul>
                          </nav>
                          </div>
                      </SheetContent>
                  </Sheet>
              </div>
        </div>
      </div>
    </header>
  );
}
