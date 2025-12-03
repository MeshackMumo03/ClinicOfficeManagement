
"use client";

import { useState } from "react";
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, doc } from "firebase/firestore";
import { Loader } from "@/components/layout/loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientList } from "@/components/patients/patient-list";
import { AlertTriangle } from "lucide-react";

function HistoryDisplay({ patientId }: { patientId: string }) {
    const firestore = useFirestore();

    const doctorsQuery = useMemoFirebase(
      () => (firestore ? collection(firestore, "doctors") : null),
      [firestore]
    );
    const { data: doctors, isLoading: doctorsLoading } = useCollection(doctorsQuery);

    const consultationsQuery = useMemoFirebase(() => {
        if (!firestore || !patientId) return null;
        return query(
            collection(firestore, 'consultations'),
            where('patientId', '==', patientId),
            orderBy('consultationDateTime', 'desc')
        );
    }, [firestore, patientId]);

    const { data: consultations, isLoading, error } = useCollection(consultationsQuery);

    const getDoctorName = (doctorId: string) => {
        if (!doctors) return "Loading...";
        const doctor = doctors.find((d: any) => d.id === doctorId);
        return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Unknown Doctor";
    };

    if (isLoading || doctorsLoading) {
        return <div className="flex justify-center items-center h-40"><Loader /></div>;
    }

    if (error) {
        return <p className="text-destructive">Error loading consultation history: {error.message}</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Consultation History</CardTitle>
                <CardDescription>A record of all past consultations.</CardDescription>
            </CardHeader>
            <CardContent>
                {consultations && consultations.length > 0 ? (
                    <div className="space-y-4">
                        {consultations.map((c: any) => (
                            <div key={c.id} className="border p-4 rounded-lg bg-muted/20">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold">{new Date(c.consultationDateTime).toLocaleDateString()}</h4>
                                    <span className="text-sm text-muted-foreground">{getDoctorName(c.doctorId)}</span>
                                </div>
                                <p className="font-medium">Diagnosis: <span className="font-normal">{c.diagnosis || 'N/A'}</span></p>
                                {c.notes && <p className="text-sm text-muted-foreground mt-2"><strong>Notes:</strong> {c.notes}</p>}
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

export default function HistoryPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    const userDocRef = useMemoFirebase(
      () => (user ? doc(firestore, "users", user.uid) : null),
      [user, firestore]
    );
    const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);
    const userRole = userData?.role;

    const canViewAllPatients = userRole === 'admin' || userRole === 'doctor' || userRole === 'receptionist';

    const patientsQuery = useMemoFirebase(
      () => (firestore && canViewAllPatients ? collection(firestore, "patients") : null),
      [firestore, canViewAllPatients]
    );
    const { data: patients, isLoading: patientsLoading } = useCollection(patientsQuery);

    const isLoading = isUserLoading || isUserDataLoading || (canViewAllPatients && patientsLoading);

    if (isLoading) {
        return <Loader />;
    }
    
    if (userRole === 'patient') {
        return (
            <div className="flex flex-col gap-8">
                 <div>
                    <h1 className="font-headline text-3xl md:text-4xl">My History</h1>
                    <p className="text-muted-foreground">Review your past consultations.</p>
                </div>
                <HistoryDisplay patientId={user!.uid} />
            </div>
        )
    }

    if (canViewAllPatients) {
        const patientToDisplay = selectedPatientId || (patients && patients.length > 0 ? patients[0].id : null);

        return (
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl">Consultation History</h1>
                    <p className="text-muted-foreground">Select a patient to view their history.</p>
                </div>
                <div className="grid md:grid-cols-[350px_1fr] gap-8 items-start">
                    {patients ? (
                        <PatientList patients={patients} selectedPatientId={patientToDisplay} onSelectPatient={setSelectedPatientId} />
                    ) : (
                        <div className="border rounded-lg bg-card text-card-foreground p-6 text-center">
                            <p className="text-muted-foreground">No patients found.</p>
                        </div>
                    )}
                    {patientToDisplay ? (
                        <HistoryDisplay patientId={patientToDisplay} />
                    ) : (
                         patients && patients.length > 0 ? (
                            <div className="border rounded-lg bg-card text-card-foreground p-6 text-center">
                                <h2 className="text-2xl font-bold mb-2">No Patient Selected</h2>
                                <p className="text-muted-foreground">Select a patient from the list to view their history.</p>
                            </div>
                        ) : (
                             <div className="border rounded-lg bg-card text-card-foreground p-6 text-center">
                                <p className="text-muted-foreground">There are no patients in the system to display history for.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        )
    }

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
