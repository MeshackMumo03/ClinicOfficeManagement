// Import the Tabs components from ShadCN.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define the type for a patient.
type Patient = {
    id: string;
    name: string;
    email: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    lastVisit: string;
    status: 'Active' | 'Inactive';
};

// Define the props for the PatientProfile component.
interface PatientProfileProps {
  patient: Patient & {
    dob?: string,
    contactNumber?: string,
    address?: string,
    insuranceProvider?: string,
    policyNumber?: string,
    emergencyContact?: {
        name: string;
        relationship: string;
        contactNumber: string;
    }
  };
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
export function PatientProfile({ patient }: PatientProfileProps) {
  return (
    <div>
        {/* Header with patient's name and ID. */}
        <div className="mb-6">
            <h1 className="font-headline text-3xl font-bold">Patient Profile</h1>
            <p className="text-muted-foreground">Patient ID: {patient.id}</p>
        </div>
      {/* Tabs to navigate between different sections of the patient's profile. */}
      <Tabs defaultValue="personal-info">
        <TabsList className="mb-6">
          <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
          <TabsTrigger value="consultation-history">Consultation History</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="billing-records">Billing Records</TabsTrigger>
        </TabsList>
        {/* Personal Information tab content. */}
        <TabsContent value="personal-info">
          <div className="divide-y rounded-lg border">
            <div className="p-6">
                <h3 className="text-xl font-bold mb-4 font-headline">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoRow label="Full Name" value={patient.name} />
                    <InfoRow label="Date of Birth" value={patient.dob} />
                    <InfoRow label="Gender" value={patient.gender} />
                    <InfoRow label="Contact Number" value={patient.contactNumber} />
                    <InfoRow label="Email Address" value={patient.email} />
                    <InfoRow label="Address" value={patient.address} />
                    <InfoRow label="Insurance Provider" value={patient.insuranceProvider} />
                    <InfoRow label="Policy Number" value={patient.policyNumber} />
                </div>
            </div>
            {/* Emergency Contact information. */}
            <div className="p-6">
                <h3 className="text-xl font-bold mb-4 font-headline">Emergency Contact</h3>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoRow label="Contact Name" value={patient.emergencyContact?.name} />
                    <InfoRow label="Relationship" value={patient.emergencyContact?.relationship} />
                    <InfoRow label="Contact Number" value={patient.emergencyContact?.contactNumber} />
                </div>
            </div>
          </div>
        </TabsContent>
        {/* Placeholder content for other tabs. */}
        <TabsContent value="consultation-history">
          <p className="text-muted-foreground">Consultation history will be displayed here.</p>
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
