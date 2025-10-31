
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

/**
 * DashboardPage component to display the main dashboard.
 * It shows a welcome message and role-based key metrics and quick actions.
 */
export default function DashboardPage() {
  // Get the current authenticated user and Firestore instance.
  const { user } = useUser();
  const firestore = useFirestore();

  // Create a memoized reference to the user's document in Firestore.
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  // Fetch the user's data from Firestore.
  const { data: userData } = useDoc(userDocRef);
  const userRole = userData?.role;

  // Determine the display name, defaulting to email if name is not available.
  const displayName = userData?.name || user?.email || "User";

  // Fetch data from Firestore based on the user's role.
  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    if (userRole === "patient") {
      // Patients only see their own appointments.
      return query(
        collection(firestore, "appointments"),
        where("patientId", "==", user.uid)
      );
    }
    // Other roles see all appointments.
    return collection(firestore, "appointments");
  }, [firestore, user, userRole]);
  const { data: appointments } = useCollection(appointmentsQuery);

  const patientsQuery = useMemoFirebase(
    () => (firestore && userRole !== 'patient' ? collection(firestore, "patients") : null),
    [firestore, userRole]
  );
  const { data: patients } = useCollection(patientsQuery);

  const billingsQuery = useMemoFirebase(
    () => (firestore && userRole !== 'patient' ? collection(firestore, "billings") : null),
    [firestore, userRole]
  );
  const { data: billings } = useCollection(billingsQuery);

  // Calculate total payments processed for non-patient roles.
  const totalPayments =
    billings
      ?.filter((billing: any) => billing.paymentStatus === "Paid")
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

        {userRole !== 'patient' && (
          <>
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
          </>
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
