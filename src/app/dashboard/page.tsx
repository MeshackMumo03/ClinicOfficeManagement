
"use client";

// --- IMPORTS ---
// Import necessary hooks and components from React, Firebase, and your UI library.
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
import { NewAppointmentDialog } from "@/components/appointments/new-appointment-dialog";
import { CreatePatientDialog } from "@/components/patients/create-patient-dialog";
import { CreateInvoiceDialog } from "@/components/billing/create-invoice-dialog";

/**
 * DashboardPage: The main landing page for logged-in users.
 * It displays a welcome message and a set of key metrics and quick actions
 * that are tailored to the user's specific role (e.g., admin, doctor, patient).
 */
export default function DashboardPage() {
  // --- 1. USER AND ROLE SETUP ---
  // Get the current authenticated user and their loading status from the useUser hook.
  const { user, isUserLoading: isUserAuthLoading } = useUser();
  // Get the Firestore instance.
  const firestore = useFirestore();

  // Create a memoized reference to the user's document in the 'users' collection.
  // This is used to fetch the user's role and other profile information.
  // useMemoFirebase ensures the reference is stable and prevents re-renders.
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  // Fetch the user's data from the document reference.
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);
  // Extract the user's role and a display name for the welcome message.
  const userRole = userData?.role;
  const displayName = userData?.name || user?.email || "User";

  // --- 2. ROLE-AWARE DATA FETCHING ---
  // This section fetches data from Firestore based on the user's role to prevent
  // permission errors and ensure users only see data they are allowed to see.

  // APPOINTMENTS: Fetch appointments relevant to the user's role.
  const appointmentsQuery = useMemoFirebase(() => {
    // Do not run the query until we have all the necessary information.
    if (!firestore || !user || !userRole) return null;
    
    const appointmentsCollection = collection(firestore, "appointments");

    // Patients can only see their own appointments.
    if (userRole === "patient") {
      return query(appointmentsCollection, where("patientId", "==", user.uid));
    }
    // Doctors should only see appointments assigned to them.
    if (userRole === 'doctor') {
      return query(appointmentsCollection, where("doctorId", "==", user.uid));
    }
    // Staff (admin, receptionist) can see all appointments.
    if (userRole === 'admin' || userRole === 'receptionist') {
      return appointmentsCollection;
    }
    // Return null for any other case to be safe.
    return null;
  }, [firestore, user, userRole]);
  const { data: appointments, isLoading: appointmentsLoading } = useCollection(appointmentsQuery);

  // PATIENTS: Fetch the list of all patients, but only if the user is staff.
  const patientsQuery = useMemoFirebase(() => {
    // Only run this query if the user is a staff member.
    if (firestore && (userRole === 'admin' || userRole === 'doctor' || userRole === 'receptionist')) {
      return collection(firestore, "patients");
    }
    // For patients or other roles, do not fetch the patient list.
    return null;
  }, [firestore, userRole]);
  const { data: patients, isLoading: patientsLoading } = useCollection(patientsQuery);

  // BILLINGS: Fetch billings, carefully respecting role permissions.
  const billingsQuery = useMemoFirebase(() => {
    // Do not run the query until we have all necessary information.
    if (!firestore || !user || !userRole) return null;
  
    // CRITICAL FIX: Doctors should not query for billings at all.
    // Returning null here prevents the useCollection hook from making a Firestore request.
    if (userRole === 'doctor') {
      return null;
    }
  
    const billingsCollection = collection(firestore, "billings");
  
    // Patients can only see their own billing records.
    if (userRole === "patient") {
      return query(billingsCollection, where("patientId", "==", user.uid));
    }
    
    // Only admins and receptionists are allowed to query the entire collection.
    if (userRole === 'admin' || userRole === 'receptionist') {
      return billingsCollection;
    }
    
    // Return null for any other case to prevent unauthorized queries.
    return null; 
  }, [firestore, user, userRole]);
  // The useCollection hook will now receive 'null' for doctors and will not attempt a fetch.
  const { data: billings, isLoading: billingsLoading } = useCollection(billingsQuery);


  // --- 3. LOADING STATE & CALCULATIONS ---
  
  // Determine if the page is still loading any essential data.
  const pageIsLoading = isUserAuthLoading || isUserDataLoading || appointmentsLoading || patientsLoading || (userRole !== 'doctor' && billingsLoading);

  // Show a full-screen loader while data is being fetched.
  if (pageIsLoading) {
    return <Loader />;
  }
  
  // Calculate total payments. If billings is null or undefined (e.g., for a doctor),
  // the '|| 0' ensures this defaults to 0 instead of causing an error.
  const totalPayments =
    billings
      ?.filter((billing: any) => billing.paymentStatus === "paid")
      .reduce((sum: number, billing: any) => sum + (billing.amount || 0), 0) || 0;

  // --- 4. RENDER THE DASHBOARD UI ---
  return (
    <div className="flex flex-col gap-8">
      {/* Header section with a personalized welcome message. */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, {displayName}</p>
        </div>
      </div>

      {/* Grid of cards displaying key metrics based on the user's role. */}
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

        {/* Only show the 'New Patients' card to staff roles. */}
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
        
        {/* Only show the 'Payments' card to roles who can see billing info. */}
        {/* This card will not be rendered for doctors, as `billings` will be null. */}
        {(userRole === 'admin' || userRole === 'receptionist' || userRole === 'patient') && (
             <Card>
             <CardHeader>
               <CardTitle className="text-base font-normal text-muted-foreground">
                 {userRole === 'patient' ? "Total Paid" : "Payments Processed"}
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

      {/* Quick actions section with buttons for common tasks based on role. */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          {(userRole === 'admin' || userRole === 'receptionist') && (
            <CreatePatientDialog>
              <Button>Register New Patient</Button>
            </CreatePatientDialog>
          )}
          {(userRole === 'admin' || userRole === 'doctor' || userRole === 'receptionist') && (
            <NewAppointmentDialog>
                <Button variant="secondary">Book Appointment</Button>
            </NewAppointmentDialog>
          )}
          {userRole === 'patient' && (
            <NewAppointmentDialog>
                <Button variant="secondary">Book New Appointment</Button>
            </NewAppointmentDialog>
          )}
          {(userRole === 'admin' || userRole === 'receptionist') && (
            <CreateInvoiceDialog>
              <Button variant="secondary">Generate Receipt</Button>
            </CreateInvoiceDialog>
          )}
        </div>
      </div>
    </div>
  );
}
