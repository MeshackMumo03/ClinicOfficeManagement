import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Patient = {
    id: string;
    name: string;
    email: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    lastVisit: string;
    status: 'Active' | 'Inactive';
};

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

function InfoRow({ label, value }: { label: string; value?: string }) {
    if (!value) return null;
    return (
        <div className="grid gap-1">
            <p className="text-sm font-medium text-primary">{label}</p>
            <p className="text-foreground">{value}</p>
        </div>
    )
}

export function PatientProfile({ patient }: PatientProfileProps) {
  return (
    <div>
        <div className="mb-6">
            <h1 className="font-headline text-3xl font-bold">Patient Profile</h1>
            <p className="text-muted-foreground">Patient ID: {patient.id}</p>
        </div>
      <Tabs defaultValue="personal-info">
        <TabsList className="mb-6">
          <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
          <TabsTrigger value="consultation-history">Consultation History</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="billing-records">Billing Records</TabsTrigger>
        </TabsList>
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
