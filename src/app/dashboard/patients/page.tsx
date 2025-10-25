import { PatientList } from "@/components/patients/patient-list";
import { PatientProfile } from "@/components/patients/patient-profile";
import { patients } from "@/lib/data";

export default function PatientsPage() {
  const selectedPatient = patients.find(p => p.id === 'PT12345');

  return (
    <div className="grid md:grid-cols-[350px_1fr] gap-8 items-start">
      <PatientList patients={patients} selectedPatientId="PT12345" />
      {selectedPatient && <PatientProfile patient={selectedPatient} />}
    </div>
  );
}
