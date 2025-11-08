
"use client";

// Import React and necessary components from ShadCN and Lucide-React.
import React from "react";
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { PlusCircle, ListFilter } from "lucide-react";
import { Loader } from "@/components/layout/loader";
import { NewAppointmentDialog } from "@/components/appointments/new-appointment-dialog";

/**
 * AppointmentsPage component to display and manage appointments.
 * It includes a table of appointments and filters for doctors, date, and status.
 */
export default function AppointmentsPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const userDocRef = useMemoFirebase(
      () => (user ? doc(firestore, "users", user.uid) : null),
      [user, firestore]
    );
    const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);
    const userRole = userData?.role;
    
    // Role-aware query for appointments.
    const appointmentsQuery = useMemoFirebase(() => {
      if (!firestore || !user || !userRole) return null;
      
      const appointmentsCollection = collection(firestore, "appointments");

      if (userRole === "patient") {
        // Patients can only see their own appointments.
        return query(appointmentsCollection, where("patientId", "==", user.uid));
      }

      if (userRole === 'admin' || userRole === 'doctor' || userRole === 'receptionist') {
        // Staff can see all appointments.
        return appointmentsCollection;
      }

      return null; // For roles with no access.
    }, [firestore, user, userRole]);

    const { data: appointments, isLoading: appointmentsLoading } = useCollection(appointmentsQuery);

    const doctorsQuery = useMemoFirebase(
      () => (firestore ? collection(firestore, "doctors") : null),
      [firestore]
    );
    const { data: doctors, isLoading: doctorsLoading } = useCollection(doctorsQuery);

    const canFetchAllPatients = userRole === 'admin' || userRole === 'doctor' || userRole === 'receptionist';

    // Fetch all patients only if the user has the right role.
    const patientsQuery = useMemoFirebase(() => {
      if (!firestore || !canFetchAllPatients) return null;
      return collection(firestore, "patients");
    }, [firestore, canFetchAllPatients]);
    const { data: patients, isLoading: patientsLoading } = useCollection(patientsQuery);

    // If the user is a patient, fetch only their own patient document for name display.
    const singlePatientDocRef = useMemoFirebase(() => {
        if (!firestore || !user || userRole !== 'patient') return null;
        // The patient document ID in /patients can be the same as the user UID if you set it that way on creation
        return doc(firestore, 'patients', user.uid);
    }, [firestore, user, userRole]);
    const { data: singlePatient, isLoading: singlePatientLoading } = useDoc(singlePatientDocRef);


    const getPatientName = (patientId: string) => {
        if (userRole === 'patient' && singlePatient) {
            // A patient should see their own name
            return `${singlePatient.firstName} ${singlePatient.lastName}`;
        }
        if (patients) {
            const patient = patients.find(p => p.id === patientId);
            return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
        }
        return "Loading...";
    }

    const getDoctorName = (doctorId: string) => {
        if (doctors) {
            const doctor = doctors.find(d => d.id === doctorId);
            return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Unknown Doctor";
        }
        return "Loading...";
    }
    
    // Get unique statuses from appointments for the filter dropdown.
    const statuses = appointments ? Array.from(new Set(appointments.map((a: any) => a.status))) : [];

    const pageIsLoading = isUserLoading || isUserDataLoading || appointmentsLoading || doctorsLoading || (canFetchAllPatients && patientsLoading) || (userRole === 'patient' && singlePatientLoading);

    if (pageIsLoading) {
        return <Loader />;
    }

  return (
    <div className="flex flex-col gap-8">
      {/* Header section with page title and a button to add a new appointment. */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl">Appointments</h1>
        </div>
        <NewAppointmentDialog>
            <Button>
                <PlusCircle className="mr-2" />
                New Appointment
            </Button>
        </NewAppointmentDialog>
      </div>

      {/* Filter section with dropdown menus for doctor, date, and status. */}
      <div className="flex items-center gap-4">
        {userRole !== 'patient' && (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    Doctor
                    <ListFilter className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filter by Doctor</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Map through doctors to create checkbox items for the filter. */}
                {doctors?.map((doctor: any) => (
                    <DropdownMenuCheckboxItem key={doctor.id}>
                        {doctor.firstName} {doctor.lastName}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
            </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
                Date
                <ListFilter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
             <DropdownMenuSeparator />
             {/* TODO: Add date filtering component */}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
                Status
                <ListFilter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Map through statuses to create checkbox items for the filter. */}
            {statuses.map((status: any) => (
                <DropdownMenuCheckboxItem key={status}>
                    {status}
                </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table section to display appointments. */}
      <div className="border rounded-lg w-full">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Map through appointments to create a table row for each appointment. */}
              {appointments && appointments.map((appointment: any) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    {getPatientName(appointment.patientId)}
                  </TableCell>
                  <TableCell className="text-primary hover:underline cursor-pointer">{getDoctorName(appointment.doctorId)}</TableCell>
                  <TableCell>{new Date(appointment.appointmentDateTime).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                  <TableCell>
                    {/* Display a badge with a color corresponding to the appointment status. */}
                    <Badge
                      variant={
                        appointment.status === "Scheduled"
                          ? "default"
                          : appointment.status === "Completed"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        appointment.status === "Canceled" ? "bg-muted text-muted-foreground" : 
                        appointment.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                        'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      }
                    >
                      {appointment.status}
                    </Badge>
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
