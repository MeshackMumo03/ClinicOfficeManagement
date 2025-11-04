
"use client";
// Import necessary components from ShadCN and Lucide-React.
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Loader } from "@/components/layout/loader";

/**
 * BillingPage component to display and manage invoices.
 * It includes a table of invoices with actions for each.
 */
export default function BillingPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);
  const userRole = userData?.role;
  
  // Role-aware query for billings.
  const billingsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !userRole) return null;

    const billingsCollection = collection(firestore, "billings");
    
    if (userRole === "patient") {
      // Patients can only see their own billings.
      return query(billingsCollection, where("patientId", "==", user.uid));
    }
    
    if (userRole === 'admin' || userRole === 'receptionist') {
      // Staff can see all billings.
      return billingsCollection;
    }

    return null; // For roles like doctors who can't see billings.
  }, [firestore, user, userRole]);

  const { data: invoices, isLoading: billingsLoading } = useCollection(billingsQuery);

  const canViewAllBillings = userRole === 'admin' || userRole === 'receptionist';

  const patientsQuery = useMemoFirebase(
    () => (firestore && canViewAllBillings ? collection(firestore, "patients") : null),
    [firestore, canViewAllBillings]
  );
  const { data: patients, isLoading: patientsLoading } = useCollection(patientsQuery);

  const getPatientName = (patientId: string) => {
    if (userRole === 'patient' && userData?.name) {
      return userData.name;
    }
     if (patients) {
        const patient = patients.find(p => p.id === patientId);
        return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
    }
    return "Loading...";
  }

  const pageIsLoading = isUserLoading || isUserDataLoading || billingsLoading || (canViewAllBillings && patientsLoading);

  if (pageIsLoading) {
    return <Loader />;
  }

  // Handle case for roles that shouldn't see any billing info (e.g., doctors).
  if (!canViewAllBillings && userRole !== 'patient') {
    return (
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Billing</h1>
        <p className="text-muted-foreground mt-4">
          You do not have permission to view billing information.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header section with page title and description. */}
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Billing</h1>
        <p className="text-muted-foreground">
          Manage invoices and payments.
        </p>
      </div>

      {/* Table section to display invoices. */}
      <div className="border rounded-lg w-full">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                {canViewAllBillings && <TableHead>Patient</TableHead>}
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                {userRole !== 'patient' && (
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Map through invoices to create a table row for each invoice. */}
              {invoices && invoices.length > 0 ? invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  {canViewAllBillings && <TableCell>{getPatientName(invoice.patientId)}</TableCell>}
                  <TableCell>{new Date(invoice.billingDate).toLocaleDateString()}</TableCell>
                  <TableCell>Ksh{invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {/* Display a badge with a color corresponding to the invoice status. */}
                    <Badge variant={
                      invoice.paymentStatus === 'paid' ? 'secondary' : invoice.paymentStatus === 'pending' ? 'outline' : 'destructive'
                    } className={invoice.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : ''}>
                      {invoice.paymentStatus}
                    </Badge>
                  </TableCell>
                  {userRole !== 'patient' && (
                    <TableCell>
                      {/* Dropdown menu with actions for each invoice. */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={canViewAllBillings ? 6 : 4} className="text-center">
                        No billing records found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
