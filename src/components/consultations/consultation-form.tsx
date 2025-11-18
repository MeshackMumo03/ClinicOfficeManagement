
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "../layout/loader";
import { useEffect, useState, useRef } from "react";
import { getDiagnosisSuggestion } from "@/lib/actions";
import { audioTranscription } from "@/ai/flows/audio-transcription-flow";
import { Sparkles, Mic, StopCircle, Loader2, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";


const treatmentSchema = z.object({
  drugName: z.string().optional(),
  dosage: z.string().optional(),
  instructions: z.string().optional(),
});

const formSchema = z.object({
  patientId: z.string().min(1, "Patient selection is required."),
  symptoms: z.string().optional(),
  examFindings: z.string().optional(),
  labResults: z.string().optional(),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  treatments: z.array(treatmentSchema).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function ConsultationForm() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);


  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);
  const userRole = userData?.role;

  const canViewPatients = userRole === 'admin' || userRole === 'doctor' || userRole === 'receptionist';

  const patientsQuery = useMemoFirebase(
    () => (firestore && canViewPatients ? collection(firestore, "patients") : null),
    [firestore, canViewPatients]
  );
  const { data: patients, isLoading: patientsLoading } = useCollection(patientsQuery);

  const selectedPatientDocRef = useMemoFirebase(
    () => (selectedPatientId ? doc(firestore, "patients", selectedPatientId) : null),
    [selectedPatientId, firestore]
  );
  const { data: selectedPatient } = useDoc(selectedPatientDocRef);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      symptoms: "",
      examFindings: "",
      labResults: "",
      notes: "",
      diagnosis: "",
      treatments: [{ drugName: "", dosage: "", instructions: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "treatments",
  });

  useEffect(() => {
    if (selectedPatient) {
      form.setValue("patientId", selectedPatient.id);
    }
  }, [selectedPatient, form]);

  const handleGetAiSuggestion = async () => {
    const formData = form.getValues();
    if (!selectedPatient) {
        toast({
            variant: "destructive",
            title: "Patient Not Selected",
            description: "Please select a patient before getting an AI suggestion.",
        });
        return;
    }
    setIsAiLoading(true);
    const result = await getDiagnosisSuggestion({
        patientMedicalHistory: selectedPatient.medicalHistory || 'No history provided.',
        symptoms: formData.symptoms || 'Not specified.',
        examFindings: formData.examFindings || 'Not specified.',
        labResults: formData.labResults || 'Not specified.',
    });
    setIsAiLoading(false);
    if (result.success && result.data) {
        form.setValue('diagnosis', result.data.diagnosisConsiderations);
        toast({
            title: "AI Suggestion Received",
            description: "The diagnosis has been populated with AI-powered considerations.",
        });
    } else {
        toast({
            variant: "destructive",
            title: "AI Suggestion Failed",
            description: result.error || "An unknown error occurred.",
        });
    }
  }

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioBlob(audioBlob);
            handleTranscription(audioBlob);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
    } catch (error) {
        console.error("Error accessing microphone:", error);
        toast({
            variant: "destructive",
            title: "Microphone Access Denied",
            description: "Please enable microphone permissions in your browser.",
        });
    }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          // Get the tracks and stop them to turn off the microphone light
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // The result includes the data URL prefix, so we strip it.
            const content = base64String.split(',')[1];
            resolve(content);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  }


  const handleTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
        const base64Audio = await blobToBase64(blob);
        const result = await audioTranscription({ audioB64: base64Audio });
        
        if (result.transcript) {
            const currentNotes = form.getValues('notes');
            form.setValue('notes', currentNotes ? `${currentNotes}\n${result.transcript}` : result.transcript);
            toast({
                title: "Transcription Successful",
                description: "Your audio has been transcribed and added to the notes.",
            });
        } else {
            throw new Error("Empty transcript returned.");
        }
    } catch (error) {
        console.error("Transcription error:", error);
        toast({
            variant: "destructive",
            title: "Transcription Failed",
            description: "Could not transcribe the audio. Please try again.",
        });
    } finally {
        setIsTranscribing(false);
    }
  }


  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to save a consultation." });
      return;
    }

    try {
      const consultationData = {
        patientId: data.patientId,
        doctorId: user.uid,
        consultationDateTime: new Date().toISOString(),
        notes: data.notes,
        diagnosis: data.diagnosis,
        prescriptionIds: [],
      };

      const consultationRef = await addDocumentNonBlocking(collection(firestore, "consultations"), consultationData);

      if (data.treatments && data.treatments.length > 0 && consultationRef) {
        const prescriptionPromises = data.treatments
            .filter(treatment => treatment.drugName) // Only create prescriptions if there's a drug name
            .map(treatment => {
                const prescriptionData = {
                    consultationId: consultationRef.id,
                    drugName: treatment.drugName,
                    dosage: treatment.dosage,
                    frequency: treatment.instructions, // Assuming instructions contain frequency
                    notes: treatment.instructions,
                };
                return addDocumentNonBlocking(collection(firestore, "prescriptions"), prescriptionData);
            });

        await Promise.all(prescriptionPromises);
      }


      toast({
        title: "Consultation Saved",
        description: "The consultation details have been successfully saved.",
      });
      form.reset();
      setSelectedPatientId(null);
    } catch (error) {
      console.error("Error saving consultation:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "An error occurred while saving the consultation.",
      });
    }
  };

  const isLoading = isUserLoading || isUserDataLoading || patientsLoading;
  if (isLoading) {
    return <Loader />;
  }

  if (userRole === 'patient') {
      return (
        <Card>
            <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">This form is for doctor use only.</p>
            </CardContent>
        </Card>
      )
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Consultation Form</CardTitle>
        <CardDescription>Fill out the consultation details for the patient.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Patient Information</h3>
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Patient</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedPatientId(value);
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.firstName} {p.lastName} (ID: {p.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedPatient && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border p-4">
                  <div className="space-y-1">
                      <FormLabel>Date of Birth</FormLabel>
                      <p className="text-sm">{selectedPatient.dateOfBirth}</p>
                  </div>
                  <div className="space-y-1">
                      <FormLabel>Gender</FormLabel>
                      <p className="text-sm">{selectedPatient.gender}</p>
                  </div>
                  <div className="space-y-1">
                      <FormLabel>Contact Number</FormLabel>
                      <p className="text-sm">{selectedPatient.contactNumber}</p>
                  </div>
                  <div className="space-y-1">
                      <FormLabel>Email</FormLabel>
                      <p className="text-sm">{selectedPatient.email}</p>
                  </div>
                   <div className="md:col-span-2 space-y-1">
                        <FormLabel>Medical History</FormLabel>
                        <p className="text-sm text-muted-foreground">{selectedPatient.medicalHistory || "No history provided."}</p>
                   </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Consultation Details</h3>
                <FormField
                    control={form.control} name="symptoms"
                    render={({ field }) => (
                        <FormItem><FormLabel>Symptoms</FormLabel><FormControl><Textarea placeholder="Patient's reported symptoms" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                />
                <FormField
                    control={form.control} name="examFindings"
                    render={({ field }) => (
                        <FormItem><FormLabel>Exam Findings</FormLabel><FormControl><Textarea placeholder="Physical examination findings" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                />
                <FormField
                    control={form.control} name="labResults"
                    render={({ field }) => (
                        <FormItem><FormLabel>Lab Results</FormLabel><FormControl><Textarea placeholder="Summary of recent lab results" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Diagnosis</h3>
                    <Button type="button" variant="outline" size="sm" onClick={handleGetAiSuggestion} disabled={isAiLoading || !selectedPatientId}>
                        {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Get AI Suggestion
                    </Button>
                </div>
              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter diagnosis..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Doctor's Notes</h3>
                <Button type="button" variant={isRecording ? "destructive" : "outline"} size="sm" onClick={isRecording ? stopRecording : startRecording} disabled={isTranscribing}>
                    {isRecording ? <><StopCircle className="mr-2 h-4 w-4" />Stop</> : isTranscribing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Transcribing...</> : <><Mic className="mr-2 h-4 w-4" />Record Audio</>}
                </Button>
              </div>
               {isTranscribing && (
                    <Alert>
                        <AlertTitle>Processing Audio</AlertTitle>
                        <AlertDescription>Your recording is being transcribed. This may take a moment...</AlertDescription>
                    </Alert>
               )}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter doctor's notes here, or use the audio recorder..." {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Treatment Plan</h3>
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                    {index > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`treatments.${index}.drugName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Paracetamol" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`treatments.${index}.dosage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 500mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`treatments.${index}.instructions`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions & Other Treatments</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detail prescription instructions, recommended lab tests, lifestyle changes, or specialist referrals."
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ drugName: "", dosage: "", instructions: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Treatment
              </Button>
            </div>


            <div className="flex justify-end gap-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>Save Consultation</Button>
              <Button variant="outline" type="button">Print/Export PDF</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
