// Import the ConsultationForm component.
import { ConsultationForm } from "@/components/consultations/consultation-form";

/**
 * ConsultationsPage component to display the consultation form.
 * It serves as a container for the form where doctors can input consultation details.
 */
export default function ConsultationsPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header section with page title and description. */}
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">
          Consultation Form
        </h1>
        <p className="text-muted-foreground">
          Fill out the consultation details for the patient.
        </p>
      </div>

      {/* The ConsultationForm component is rendered here. */}
      <ConsultationForm />
    </div>
  );
}
