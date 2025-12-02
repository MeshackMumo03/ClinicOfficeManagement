
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
import { MoreHorizontal, CreditCard, Loader2, PlusCircle } from "lucide-react";
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Loader } from "@/components/layout/loader";
import { useToast } from "@/hooks/use-toast";
import { createPaymentLink } from "@/lib/lipana-actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateInvoiceDialog } from "@/components/billing/create-invoice-dialog";


/**
 * BillingPage component to display and manage invoices.
 * It includes a table of invoices with actions for each.
 */
export default function BillingPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);


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

    // Doctors shouldn't see any billing info.
    return null;
  }, [firestore, user, userRole]);

  const { data: invoices, isLoading: billingsLoading } = useCollection(billingsQuery);

  const canManageBillings = userRole === 'admin' || userRole === 'receptionist';

  // Fetch patient data only if needed to resolve names
  const patientsQuery = useMemoFirebase(() => {
    if (!firestore || !canManageBillings) return null;
    return collection(firestore, "patients");
  }, [firestore, canManageBillings]);
  const { data: patients, isLoading: patientsLoading } = useCollection(patientsQuery);

  // Fetch the patient's own patient document if they are a patient
  const singlePatientDocRef = useMemoFirebase(() => {
    if (!firestore || !user || userRole !== 'patient') return null;
    return doc(firestore, 'patients', user.uid);
  }, [firestore, user, userRole]);
  const { data: singlePatient, isLoading: singlePatientLoading } = useDoc(singlePatientDocRef);

  const getPatientName = (patientId: string) => {
      if (userRole === 'patient' && singlePatient) {
          return `${singlePatient.firstName} ${singlePatient.lastName}`;
      }
      if (patients) {
          const patient = patients.find(p => p.id === patientId);
          return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
      }
      return "Loading...";
  }

  const getPatientPhoneNumber = (patientId: string) => {
    if (userRole === 'patient' && singlePatient) {
        return singlePatient.contactNumber;
    }
    if (patients) {
      const patient = patients.find(p => p.id === patientId);
      return patient?.contactNumber;
    }
    return undefined;
  }

  const handlePayment = async (invoice: any) => {
    setPayingInvoiceId(invoice.id);
    const phoneNumber = getPatientPhoneNumber(invoice.patientId);
  
    if (!phoneNumber) {
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: 'Patient phone number is missing. Please have a receptionist update it.',
      });
      setPayingInvoiceId(null);
      return;
    }
  
    try {
      // CRITICAL FIX: The 'await' is necessary to get the result from the server action.
      const result = await createPaymentLink({
        amount: invoice.amount,
        phoneNumber: phoneNumber,
        title: `Invoice #${invoice.id.substring(0, 8)}`,
        description: `Payment for medical services.`,
        invoiceId: invoice.id,
      });
  
      if (result.success && result.paymentLinkUrl) {
        toast({
          title: 'Redirecting to Payment',
          description: 'You are being redirected to the Lipa Na M-Pesa payment page.',
        });
        // CRITICAL FIX: Redirect the user to the payment link using the browser's location object.
        window.location.href = result.paymentLinkUrl;
      } else {
        throw new Error(result.error || 'Failed to create payment link.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: error.message || 'Could not initiate the payment process. Please try again.',
      });
       // Only set loading to false in case of an error.
       // On success, the page redirects away anyway.
      setPayingInvoiceId(null);
    }
  };

  const pageIsLoading = isUserLoading || isUserDataLoading || billingsLoading || (canManageBillings && patientsLoading) || (userRole === 'patient' && singlePatientLoading);

  if (pageIsLoading) {
    return <Loader />;
  }

  // Handle case for roles that shouldn't see any billing info (e.g., doctors).
  if (!canManageBillings && userRole !== 'patient') {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl md:text-4xl">Billing</h1>
                <p className="text-muted-foreground mt-4">
                You do not have permission to view billing information.
                </p>
            </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header section with page title and description. */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl md:text-4xl">Billing</h1>
            <p className="text-muted-foreground">
            Manage invoices and payments.
            </p>
        </div>
        {canManageBillings && (
            <CreateInvoiceDialog>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Invoice
                </Button>
            </CreateInvoiceDialog>
        )}
      </div>

      {/* Table section to display invoices. */}
      <div className="border rounded-lg w-full">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                {canManageBillings && <TableHead>Patient</TableHead>}
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                    Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Map through invoices to create a table row for each invoice. */}
              {invoices && invoices.length > 0 ? invoices.map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id.substring(0, 8)}...</TableCell>
                  {canManageBillings && <TableCell>{getPatientName(invoice.patientId)}</TableCell>}
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
                  <TableCell className="text-right">
                      {userRole === 'patient' && invoice.paymentStatus !== 'paid' && (
                        <Button 
                            onClick={() => handlePayment(invoice)} 
                            disabled={payingInvoiceId === invoice.id}
                        >
                            {payingInvoiceId === invoice.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CreditCard className="mr-2 h-4 w-4" />
                            )}
                            Pay Now
                        </Button>
                      )}
                      {canManageBillings && (
                        /* Dropdown menu with actions for each invoice. */
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
                      )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={canManageBillings ? 6 : 5} className="text-center h-24">
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
