
// Import the Tabs components from ShadCN and other necessary modules.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Loader } from "../layout/loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { EditPatientDialog } from "./edit-patient-dialog";
import { Button } from "../ui/button";
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
 * A component to display the consultation history for a patient.
 * @param {object} props - The properties for the component.
 * @param {string} props.patientId - The ID of the patient.
 */
function ConsultationHistory({ patientId }: { patientId: string }) {
    const firestore = useFirestore();

    const consultationsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'consultations'),
            where('patientId', '==', patientId),
            orderBy('consultationDateTime', 'desc')
        );
    }, [firestore, patientId]);

    const { data: consultations, isLoading } = useCollection(consultationsQuery);

    if (isLoading) {
        return <Loader />;
    }

    if (!consultations || consultations.length === 0) {
        return <p className="text-muted-foreground">No consultation history available for this patient.</p>;
    }

    return (
        <div className="space-y-4">
            {consultations.map((consultation: any) => (
                <Card key={consultation.id}>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Consultation on {new Date(consultation.consultationDateTime).toLocaleDateString()}
                        </CardTitle>
                        <CardDescription>Doctor ID: {consultation.doctorId}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold">Diagnosis</h4>
                            <p>{consultation.diagnosis || "N/A"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Notes</h4>
                            <p>{consultation.notes || "N/A"}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}


/**
 * PatientProfile component to display detailed information about a patient.
 * It uses tabs to organize the information into different sections.
 * @param {PatientProfileProps} props - The properties for the component.
 */
export function PatientProfile({ patient, canManagePatients }: PatientProfileProps) {
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
            <DocumentManager patientId={patient.id} />
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
