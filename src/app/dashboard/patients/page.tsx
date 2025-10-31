// Import necessary components and data.
import { PatientList } from "@/components/patients/patient-list";
import { PatientProfile } from "@/components/patients/patient-profile";
import { patients } from "@/lib/data";

/**
 * PatientsPage component to display a list of patients and a profile of the selected patient.
 * It serves as the main page for managing patient information.
 */
export default function PatientsPage() {
  // Find the selected patient from the list, or set to null if not found.
  const selectedPatient = patients.length > 0 ? patients.find(p => p.id === 'PT12345') : null;

  return (
    // Grid layout to display patient list and profile side-by-side on medium screens and larger.
    <div className="grid md:grid-cols-[350px_1fr] gap-8 items-start">
      {/* PatientList component to display the list of patients. */}
      <PatientList patients={patients} selectedPatientId={selectedPatient?.id} />
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
