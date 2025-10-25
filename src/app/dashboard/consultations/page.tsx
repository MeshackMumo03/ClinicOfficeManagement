import { ConsultationForm } from "@/components/consultations/consultation-form";

export default function ConsultationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">
          Consultation Form
        </h1>
        <p className="text-muted-foreground">
          Fill out the consultation details for the patient.
        </p>
      </div>

      <ConsultationForm />
    </div>
  );
}
