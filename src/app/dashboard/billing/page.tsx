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
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Loader } from "@/components/layout/loader";

/**
 * BillingPage component to display and manage invoices.
 * It includes a table of invoices with actions for each.
 */
export default function BillingPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const billingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "billings"), where("patientId", "==", user.uid));
  }, [firestore, user]);

  const { data: invoices, isLoading: billingsLoading } = useCollection(billingsQuery);

  if (isUserLoading || billingsLoading) {
    return <Loader />;
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
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Map through invoices to create a table row for each invoice. */}
              {invoices && invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.patientId}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
