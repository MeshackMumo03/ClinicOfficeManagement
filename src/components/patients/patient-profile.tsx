// Import the Tabs components from ShadCN and other necessary modules.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Loader } from "../layout/loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { EditPatientDialog } from "./edit-patient-dialog";
import { DocumentManager } from "./document-manager";


// Define the type for a patient.
export type Patient = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    contactNumber: string;
    address: string;
    medicalHistory?: string;
};

// Define the props for the PatientProfile component.
interface PatientProfileProps {
  patient: Patient;
  canManagePatients: boolean;
}

/**
 * A component to display the consultation history for a patient.
 * It now filters consultations by the logged-in doctor.
 * @param {object} props - The properties for the component.
 * @param {string} props.patientId - The ID of the patient.
 */
function ConsultationHistory({ patientId }: { patientId: string }) {
    const firestore = useFirestore();
    const { user } = useUser(); // Get the currently logged-in user

    // Fetch doctors to resolve names in the history
    const doctorsQuery = useMemoFirebase(
      () => (firestore ? collection(firestore, "doctors") : null),
      [firestore]
    );
    const { data: doctors, isLoading: doctorsLoading } = useCollection(doctorsQuery);

    const consultationsQuery = useMemoFirebase(() => {
        if (!firestore || !patientId || !user?.uid) return null;
        // CRITICAL FIX: Add a `where` clause to filter by the current doctor's ID.
        // This ensures doctors only see consultations they conducted.
        return query(
            collection(firestore, 'consultations'),
            where('patientId', '==', patientId),
            where('doctorId', '==', user.uid), // Only get consultations for the logged-in doctor
            orderBy('consultationDateTime', 'desc')
        );
    }, [firestore, patientId, user?.uid]);

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
                <CardDescription>A record of all past consultations for this patient.</CardDescription>
            </CardHeader>
            <CardContent>
                {consultations && consultations.length > 0 ? (
                    <ul className="space-y-4">
                        {consultations.map((c: any) => (
                            <li key={c.id} className="border-b pb-2">
                                <p><strong>Date:</strong> {new Date(c.consultationDateTime).toLocaleDateString()}</p>
                                <p><strong>Doctor:</strong> {getDoctorName(c.doctorId)}</p>
                                <p><strong>Diagnosis:</strong> {c.diagnosis || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground"><strong>Notes:</strong> {c.notes || 'No notes available.'}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground">No consultation history found for this patient with the current doctor.</p>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * InfoRow component to display a label and value pair.
 * @param {object} props - The properties for the component.
 * @param {string} props.label - The label for the information.
 * @param {string} [props.value] - The value of the information.
 */
function InfoRow({ label, value }: { label:string; value?: string }) {
    if (!value) return null;
    return (
        <div className="grid gap-1">
            <p className="text-sm font-medium text-primary">{label}</p>
            <p className="text-foreground">{value}</p>
        </div>
    )
}

/**
 * PatientProfile component to display detailed information about a patient.
 * It uses tabs to organize the information into different sections.
 * @param {PatientProfileProps} props - The properties for the component.
 */
export function PatientProfile({ patient, canManagePatients }: PatientProfileProps) {
  // All staff can view documents, but only certain roles can upload/manage.
  const canManageDocs = canManagePatients;

  return (
    <div>
        {/* Header with patient's name and ID. */}
        <div className="mb-6 flex justify-between items-start">
            <div>
                <h1 className="font-headline text-3xl font-bold">Patient Profile</h1>
                <p className="text-muted-foreground">Patient ID: {patient.id}</p>
            </div>
            {canManagePatients && <EditPatientDialog patient={patient} />}
        </div>
      {/* Tabs to navigate between different sections of the patient's profile. */}
      <Tabs defaultValue="personal-info">
        <TabsList className="mb-6">
          <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
          <TabsTrigger value="consultation-history">Consultation History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="billing-records">Billing Records</TabsTrigger>
        </TabsList>
        {/* Personal Information tab content. */}
        <TabsContent value="personal-info">
          <div className="divide-y rounded-lg border">
            <div className="p-6">
                <h3 className="text-xl font-bold mb-4 font-headline">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoRow label="Full Name" value={`${patient.firstName} ${patient.lastName}`} />
                    <InfoRow label="Date of Birth" value={patient.dateOfBirth} />
                    <InfoRow label="Gender" value={patient.gender} />
                    <InfoRow label="Contact Number" value={patient.contactNumber} />
                    <InfoRow label="Email Address" value={patient.email} />
                    <InfoRow label="Address" value={patient.address} />
                </div>
            </div>
            {/* Medical History information. */}
            <div className="p-6">
                <h3 className="text-xl font-bold mb-4 font-headline">Medical History</h3>
                <div className="grid gap-1">
                  <p className="text-foreground">{patient.medicalHistory || 'No medical history available.'}</p>
                </div>
            </div>
          </div>
        </TabsContent>
        {/* Consultation history tab content. */}
        <TabsContent value="consultation-history">
            <ConsultationHistory patientId={patient.id} />
        </TabsContent>
        <TabsContent value="documents">
            <DocumentManager patientId={patient.id} canManage={canManageDocs} />
        </TabsContent>
        <TabsContent value="prescriptions">
          <p className="text-muted-foreground">Prescription records will be displayed here.</p>
        </TabsContent>
        <TabsContent value="billing-records">
          <p className="text-muted-foreground">Billing records will be displayed here.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
