
"use client";
// Import necessary components and data.
import { PatientList } from "@/components/patients/patient-list";
import { PatientProfile } from "@/components/patients/patient-profile";
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Loader } from "@/components/layout/loader";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

/**
 * PatientsPage component to display a list of patients and a profile of the selected patient.
 * It serves as the main page for managing patient information.
 */
export default function PatientsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Get user role
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);
  const userRole = userData?.role;

  const canViewPatients = userRole === 'admin' || userRole === 'doctor' || userRole === 'receptionist';

  const patientsQuery = useMemoFirebase(
    () => (firestore && canViewPatients ? collection(firestore, "patients") : null),
    [firestore, canViewPatients]
  );
  const { data: patients, isLoading: patientsLoading } = useCollection(patientsQuery);

  if (isUserLoading || isUserDataLoading) {
    return <Loader />;
  }

  // If the user is a patient, show an access denied message.
  if (userRole === 'patient') {
    return (
        <Card className="max-w-md mx-auto">
            <CardContent className="p-6 flex flex-col items-center text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground">
                    This page is for clinic staff only. You do not have permission to view the patient list.
                </p>
            </CardContent>
        </Card>
    );
  }

  if (patientsLoading) {
    return <Loader />;
  }

  // Find the selected patient from the list, or set to null if not found.
  const selectedPatient = patients?.find(p => p.id === selectedPatientId) || (patients && patients.length > 0 && !selectedPatientId ? patients[0] : null);

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
  }

  return (
    // Grid layout to display patient list and profile side-by-side on medium screens and larger.
    <div className="grid md:grid-cols-[350px_1fr] gap-8 items-start">
      {/* PatientList component to display the list of patients. */}
      {patients ? (
        <PatientList patients={patients} selectedPatientId={selectedPatient?.id} onSelectPatient={handleSelectPatient} />
      ) : (
        <div className="border rounded-lg bg-card text-card-foreground p-6 text-center">
          <p className="text-muted-foreground">No patients found or you do not have permission to view them.</p>
        </div>
      )}
      {/* Conditionally render PatientProfile if a patient is selected, otherwise show a message. */}
      {selectedPatient ? (
        <PatientProfile patient={selectedPatient} />
      ) : (
        <div className="border rounded-lg bg-card text-card-foreground p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">No Patient Selected</h2>
            <p className="text-muted-foreground">Select a patient from the list to view their profile.</p>
        </div>
      )}
    </div>
  );
}
