
"use client";

// Import necessary components and hooks.
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useDoc,
  useUser,
  useFirestore,
  useMemoFirebase,
  useCollection,
} from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/layout/loader";

/**
 * DashboardPage component to display the main dashboard.
 * It shows a welcome message and role-based key metrics and quick actions.
 */
export default function DashboardPage() {
  const { user, isUserLoading: isUserAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);
  const userRole = userData?.role;
  const displayName = userData?.name || user?.email || "User";

  // --- Role-Aware Data Fetching ---

  // 1. Appointments Query
  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !userRole) return null;
    const appointmentsCollection = collection(firestore, "appointments");

    if (userRole === "patient") {
      return query(appointmentsCollection, where("patientId", "==", user.uid));
    }
    if (userRole === 'admin' || userRole === 'doctor' || userRole === 'receptionist') {
      return appointmentsCollection;
    }
    return null;
  }, [firestore, user, userRole]);

  const { data: appointments, isLoading: appointmentsLoading } = useCollection(appointmentsQuery);

  // 2. Patients Query (only for staff)
  const patientsQuery = useMemoFirebase(() => {
    if (!firestore || !userRole) return null;
    if (userRole === 'admin' || userRole === 'doctor' || userRole === 'receptionist') {
      return collection(firestore, "patients");
    }
    return null;
  }, [firestore, userRole]);

  const { data: patients, isLoading: patientsLoading } = useCollection(patientsQuery);

  // 3. Billings Query (Role-Aware)
  const billingsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !userRole) return null;
    const billingsCollection = collection(firestore, "billings");

    if (userRole === "patient") {
      return query(billingsCollection, where("patientId", "==", user.uid));
    }
    if (userRole === 'admin' || userRole === 'receptionist') {
      return billingsCollection;
    }
    return null;
  }, [firestore, user, userRole]);
  
  const { data: billings, isLoading: billingsLoading } = useCollection(billingsQuery);

  // --- Loading State and Calculations ---
  
  const pageIsLoading = isUserAuthLoading || isUserDataLoading || (userRole && (appointmentsLoading || (patientsLoading && (userRole !== 'patient')) || (billingsLoading && (userRole !== 'doctor'))));

  if (pageIsLoading) {
    return <Loader />;
  }
  
  const totalPayments =
    billings
      ?.filter((billing: any) => billing.paymentStatus === "paid")
      .reduce((sum: number, billing: any) => sum + (billing.amount || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Header section with a welcome message. */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, {displayName}</p>
        </div>
      </div>

      {/* Grid of cards displaying key metrics based on role. */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-normal text-muted-foreground">
              {userRole === 'patient' ? "Your Upcoming Appointments" : "Appointments Booked"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{appointments?.length || 0}</p>
          </CardContent>
        </Card>

        {(userRole === 'admin' || userRole === 'doctor' || userRole === 'receptionist') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-normal text-muted-foreground">
                New Patients Registered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{patients?.length || 0}</p>
            </CardContent>
          </Card>
        )}
        
        {(userRole === 'admin' || userRole === 'receptionist') && (
             <Card>
             <CardHeader>
               <CardTitle className="text-base font-normal text-muted-foreground">
                 Payments Processed
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-4xl font-bold">
                 Ksh{totalPayments.toLocaleString()}
               </p>
             </CardContent>
           </Card>
        )}

        {userRole === 'patient' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-normal text-muted-foreground">
                Total Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                Ksh{totalPayments.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick actions section with buttons for common tasks. */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          {userRole === 'receptionist' && <Button>Register New Patient</Button>}
          {userRole !== 'patient' && <Button variant="secondary">Book Appointment</Button>}
          {userRole === 'patient' && <Button variant="secondary">Book New Appointment</Button>}
          {userRole === 'receptionist' && <Button variant="secondary">Generate Receipt</Button>}
        </div>
      </div>
    </div>
  );
}
