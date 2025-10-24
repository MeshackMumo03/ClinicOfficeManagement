"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { WandSparkles, Loader2, Bot, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDiagnosisSuggestion } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { patients } from "@/lib/data";


const formSchema = z.object({
  patientId: z.string().min(1, "Please select a patient."),
  patientMedicalHistory: z.string().min(10, "Please provide some medical history."),
  symptoms: z.string().min(10, "Please describe the symptoms."),
  examFindings: z.string().min(10, "Please provide examination findings."),
  labResults: z.string().min(10, "Please include recent lab results."),
});

type FormData = z.infer<typeof formSchema>;

export function DiagnosisSupportTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      patientMedicalHistory: "",
      symptoms: "",
      examFindings: "",
      labResults: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setAiResponse(null);

    const result = await getDiagnosisSuggestion({
        patientMedicalHistory: data.patientMedicalHistory,
        symptoms: data.symptoms,
        examFindings: data.examFindings,
        labResults: data.labResults,
    });
    
    setIsLoading(false);

    if (result.success && result.data) {
      setAiResponse(result.data.diagnosisConsiderations);
    } else {
      toast({
        variant: "destructive",
        title: "AI Assistant Error",
        description: result.error || "An unknown error occurred.",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>New Consultation</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Persistent cough for 2 weeks, low-grade fever, fatigue..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="examFindings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physical Exam Findings</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Lungs clear on auscultation, mild pharyngeal erythema..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="labResults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab Results</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., CBC: WBC 12.5 (High), CRP 45 (High)..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="patientMedicalHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevant Medical History</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., History of asthma, non-smoker, no known allergies..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <WandSparkles className="mr-2 h-4 w-4" />
                    )}
                    Get Diagnosis Support
                </Button>
                <Button variant="outline" type="button">
                    <FileText className="mr-2 h-4 w-4" />
                    Save as Prescription
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot />
            AI Assistant Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">
                Analyzing patient data...
              </p>
            </div>
          )}
          {aiResponse && (
            <div className="prose prose-sm dark:prose-invert max-w-full">
                <p className="whitespace-pre-wrap">{aiResponse}</p>
            </div>
          )}
          {!isLoading && !aiResponse && (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                    <Bot className="h-10 w-10 text-primary" />
                </div>
              <p className="mt-4 text-muted-foreground">
                Diagnosis considerations from the AI assistant will appear here once you submit the patient's information.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
