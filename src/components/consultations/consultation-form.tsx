
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
import { documentTagging } from "@/ai/flows/document-tagging-flow";
import { Sparkles, Mic, StopCircle, Loader2, Plus, Trash2, Upload, File as FileIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const treatmentSchema = z.object({
  drugName: z.string().optional(),
  dosage: z.string().optional(),
  instructions: z.string().optional(),
});

// Define the document schema and types here, in the client component.
export const DocumentTaggingInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A medical document (e.g., lab result, imaging report), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DocumentTaggingInput = z.infer<typeof DocumentTaggingInputSchema>;

export const DocumentTaggingOutputSchema = z.object({
  tags: z.array(z.string()).describe('A list of 1-3 relevant tags for the document (e.g., "blood test", "x-ray", "MRI report").'),
});
export type DocumentTaggingOutput = z.infer<typeof DocumentTaggingOutputSchema>;


const documentSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  downloadURL: z.string(),
  storagePath: z.string(),
  tags: z.array(z.string()).optional(),
});

const formSchema = z.object({
  patientId: z.string().min(1, "Patient selection is required."),
  symptoms: z.string().optional(),
  examFindings: z.string().optional(),
  labResults: z.string().optional(),
  documents: z.array(documentSchema).optional(),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  treatments: z.array(treatmentSchema).optional(),
});

type FormData = z.infer<typeof formSchema>;
type DocumentFormData = z.infer<typeof documentSchema>;


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

  // Document upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


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
      documents: [],
      notes: "",
      diagnosis: "",
      treatments: [{ drugName: "", dosage: "", instructions: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "treatments",
  });

  const { fields: documentFields, append: appendDocument, remove: removeDocument } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !selectedPatientId) {
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Please select a patient before uploading documents.",
        });
        return;
    };

    setIsUploading(true);
    try {
        // 1. Upload to Firebase Storage
        const storage = getStorage();
        const storagePath = `documents/${selectedPatientId}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);

        const newDocument: DocumentFormData = {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            downloadURL: downloadURL,
            storagePath: storagePath,
            tags: [],
        };
        
        appendDocument(newDocument);
        
        toast({
            title: "Upload Successful",
            description: `${file.name} has been added. Generating AI tags...`,
        });

        // 2. Get AI Tags
        const fileDataUri = await blobToBase64(file);
        const tagResult = await documentTagging({ documentDataUri: fileDataUri });

        if (tagResult.tags) {
            // Find the document we just added and update its tags
            const currentDocs = form.getValues('documents') || [];
            const docIndex = currentDocs.findIndex(doc => doc.storagePath === storagePath);
            if (docIndex !== -1) {
                const updatedDocs = [...currentDocs];
                updatedDocs[docIndex].tags = tagResult.tags;
                form.setValue('documents', updatedDocs);
            }
            toast({
                title: "AI Tags Generated",
                description: `Tags have been added to ${file.name}.`,
            });
        }
    } catch (error) {
        console.error("Error during file upload and tagging:", error);
        toast({
            variant: "destructive",
            title: "Processing Failed",
            description: "Could not upload the file or generate tags. Please try again.",
        });
    } finally {
        setIsUploading(false);
        if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };


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

  const handleTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
        const base64Audio = (await blobToBase64(blob)).split(',')[1];
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
        prescriptionIds: [], // This will be populated by prescription creation
        documentIds: data.documents?.map(doc => doc.storagePath) || [],
      };

      const consultationRef = await addDocumentNonBlocking(collection(firestore, "consultations"), consultationData);
      
      // Save documents to the patient's subcollection
      if (data.documents && data.documents.length > 0 && consultationRef) {
        const documentPromises = data.documents.map(docData => {
            const docCollectionRef = collection(firestore, 'users', data.patientId, 'documents');
            return addDocumentNonBlocking(docCollectionRef, { ...docData, consultationId: consultationRef.id });
        });
        await Promise.all(documentPromises);
      }


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
                            {p.firstName} {p.lastName}
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
                <h3 className="text-lg font-medium">Associated Documents</h3>
                <div className="space-y-4 rounded-lg border p-4">
                    {documentFields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <div className="flex items-center gap-3">
                                <FileIcon className="h-5 w-5 text-muted-foreground"/>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{field.fileName}</span>
                                    <div className="flex gap-2 mt-1">
                                        {field.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                    </div>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeDocument(index)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isUploading || !selectedPatientId}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        {isUploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                    <Input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                    {!selectedPatientId && <p className="text-xs text-center text-muted-foreground">Please select a patient to enable document uploads.</p>}
                </div>
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
