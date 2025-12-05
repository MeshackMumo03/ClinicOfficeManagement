
"use client";

import { useState } from "react";
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, doc } from "firebase/firestore";
import { Loader } from "@/components/layout/loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientList } from "@/components/patients/patient-list";
import { AlertTriangle } from "lucide-react";

/**
 * HistoryDisplay Component
 * Fetches and displays the consultation history for a given patient ID.
 */
function HistoryDisplay({ patientId }: { patientId: string }) {
    const firestore = useFirestore();

    // Query to fetch all doctors to resolve names later.
    const doctorsQuery = useMemoFirebase(
      () => (firestore ? collection(firestore, "doctors") : null),
      [firestore]
    );
    const { data: doctors, isLoading: doctorsLoading } = useCollection(doctorsQuery);

    // Secure query to fetch consultations only for the specified patientId.
    const consultationsQuery = useMemoFirebase(() => {
        if (!firestore || !patientId) return null;
        return query(
            collection(firestore, 'consultations'),
            where('patientId', '==', patientId),
            orderBy('consultationDateTime', 'desc')
        );
    }, [firestore, patientId]);

    const { data: consultations, isLoading, error } = useCollection(consultationsQuery);

    // Helper function to find and display the doctor's name from the fetched doctors list.
    const getDoctorName = (doctorId: string) => {
        if (!doctors) return "Loading...";
        const doctor = doctors.find((d: any) => d.id === doctorId);
        return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Unknown Doctor";
    };

    if (isLoading || doctorsLoading) {
        return <div className="flex justify-center items-center h-40"><Loader /></div>;
    }

    if (error) {
        return <p className="text-destructive p-4">Error loading consultation history: {error.message}</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Consultation History</CardTitle>
                <CardDescription>A record of all past consultations for the selected patient.</CardDescription>
            </CardHeader>
            <CardContent>
                {consultations && consultations.length > 0 ? (
                    <div className="space-y-4">
                        {consultations.map((c: any) => (
                            <div key={c.id} className="border p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-semibold text-lg">{c.diagnosis || 'General Consultation'}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(c.consultationDateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <span className="text-sm font-medium text-primary">{getDoctorName(c.doctorId)}</span>
                                </div>
                                {c.notes && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium">Notes:</p>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.notes}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">No consultation history found for this patient.</p>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * HistoryPage Component
 * Main page component that handles role-based logic for viewing consultation history.
 */
export default function HistoryPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    // Fetch user's role from the /users collection.
    const userDocRef = useMemoFirebase(
      () => (user ? doc(firestore, "users", user.uid) : null),
      [user, firestore]
    );
    const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);
    const userRole = userData?.role;

    // Determine if the current user is staff (and can therefore see the patient list).
    const isStaff = userRole === 'admin' || userRole === 'doctor' || userRole === 'receptionist';

    // Fetch all patients only if the user is a staff member.
    const patientsQuery = useMemoFirebase(
      () => (firestore && isStaff ? collection(firestore, "patients") : null),
      [firestore, isStaff]
    );
    const { data: patients, isLoading: patientsLoading } = useCollection(patientsQuery);

    const isLoading = isUserLoading || isUserDataLoading || (isStaff && patientsLoading);

    const handleSelectPatient = (id: string) => {
        setSelectedPatientId(id);
    };

    if (isLoading) {
        return <Loader />;
    }
    
    // --- PATIENT VIEW ---
    // If the user is a patient, show their history directly.
    if (userRole === 'patient' && user) {
        return (
            <div className="flex flex-col gap-8">
                 <div>
                    <h1 className="font-headline text-3xl md:text-4xl">My History</h1>
                    <p className="text-muted-foreground">Review your past consultations.</p>
                </div>
                <HistoryDisplay patientId={user.uid} />
            </div>
        )
    }

    // --- STAFF VIEW ---
    // If the user is staff, show the patient list and the history for the selected patient.
    if (isStaff) {
        return (
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl">Consultation History</h1>
                    <p className="text-muted-foreground">Select a patient to view their history.</p>
                </div>
                <div className="grid md:grid-cols-[350px_1fr] gap-8 items-start">
                    {patients && patients.length > 0 ? (
                        <PatientList patients={patients} selectedPatientId={selectedPatientId} onSelectPatient={handleSelectPatient} />
                    ) : (
                        <Card>
                            <CardContent className="p-6 text-center">
                                <p className="text-muted-foreground">No patients found.</p>
                            </CardContent>
                        </Card>
                    )}
                    
                    {selectedPatientId ? (
                        <HistoryDisplay patientId={selectedPatientId} />
                    ) : (
                         <Card className="h-full">
                            <CardContent className="p-6 text-center h-full flex flex-col justify-center items-center">
                                <h2 className="text-2xl font-bold mb-2">No Patient Selected</h2>
                                <p className="text-muted-foreground">Please select a patient from the list to view their consultation history.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        )
    }

    // --- ACCESS DENIED VIEW ---
    // If the user has no valid role for this page.
    return (
        <Card className="max-w-md mx-auto">
            <CardContent className="p-6 flex flex-col items-center text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground">
                    You do not have permission to view this page.
                </p>
            </CardContent>
        </Card>
    );
}
