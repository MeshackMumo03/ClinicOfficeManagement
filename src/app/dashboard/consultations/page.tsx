import { DiagnosisSupportTool } from "@/components/consultations/diagnosis-support-tool";

export default function ConsultationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">
          Consultation & Diagnosis Support
        </h1>
        <p className="text-muted-foreground">
          Record consultation notes and use the AI assistant for diagnosis considerations.
        </p>
      </div>

      <DiagnosisSupportTool />
    </div>
  );
}
