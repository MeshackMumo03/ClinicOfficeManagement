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
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { PlusCircle, ListFilter } from "lucide-react";
import { Loader } from "@/components/layout/loader";

/**
 * AppointmentsPage component to display and manage appointments.
 * It includes a table of appointments and filters for doctors, date, and status.
 */
export default function AppointmentsPage() {
    const firestore = useFirestore();

    const appointmentsQuery = useMemoFirebase(
      () => (firestore ? collection(firestore, "appointments") : null),
      [firestore]
    );
    const { data: appointments, isLoading: appointmentsLoading } = useCollection(appointmentsQuery);

    const doctorsQuery = useMemoFirebase(
      () => (firestore ? collection(firestore, "doctors") : null),
      [firestore]
    );
    const { data: doctors, isLoading: doctorsLoading } = useCollection(doctorsQuery);
    
    // Get unique statuses from appointments for the filter dropdown.
    const statuses = appointments ? Array.from(new Set(appointments.map(a => a.status))) : [];

    if (appointmentsLoading || doctorsLoading) {
        return <Loader />;
    }

  return (
    <div className="flex flex-col gap-8">
      {/* Header section with page title and a button to add a new appointment. */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl">Appointments</h1>
        </div>
        <Button>
          <PlusCircle className="mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Filter section with dropdown menus for doctor, date, and status. */}
      <div className="flex items-center gap-4">
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
            {doctors?.map((doctor) => (
                <DropdownMenuCheckboxItem key={doctor.id}>
                    {doctor.firstName} {doctor.lastName}
                </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
            {statuses.map((status) => (
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
              {appointments && appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    {appointment.patientName}
                  </TableCell>
                  <TableCell className="text-primary hover:underline cursor-pointer">{appointment.doctorName}</TableCell>
                  <TableCell className="text-primary hover:underline cursor-pointer">{new Date(appointment.appointmentDateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}, {new Date(appointment.appointmentDateTime).toLocaleTimeString()}</TableCell>
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
