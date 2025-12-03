
// Import the Tabs components from ShadCN and other necessary modules.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
 * InfoRow component to display a label and value pair.
 * @param {object} props - The properties for the component.
 * @param {string} props.label - The label for the information.
 * @param {string} [props.value] - The value of the information.
 */
function InfoRow({ label, value }: { label:string; value?: string }) {
    if (!value) return null;
    return (
        <div className="grid gap-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
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
        {/* Header with patient's name. */}
        <div className="mb-6 flex justify-between items-start">
            <div>
                <h1 className="font-headline text-3xl font-bold">{`${patient.firstName} ${patient.lastName}`}</h1>
            </div>
            {canManagePatients && <EditPatientDialog patient={patient} />}
        </div>
      {/* Tabs to navigate between different sections of the patient's profile. */}
      <Tabs defaultValue="personal-info">
        <TabsList className="mb-6">
          <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
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
