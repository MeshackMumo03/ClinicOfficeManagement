import { PatientList } from "@/components/patients/patient-list";
import { PatientProfile } from "@/components/patients/patient-profile";
import { patients } from "@/lib/data";

export default function PatientsPage() {
  const selectedPatient = patients.length > 0 ? patients.find(p => p.id === 'PT12345') : null;

  return (
    <div className="grid md:grid-cols-[350px_1fr] gap-8 items-start">
      <PatientList patients={patients} selectedPatientId={selectedPatient?.id} />
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
