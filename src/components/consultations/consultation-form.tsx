
"use client";

import { useForm } from "react-hook-form";
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
import { useEffect, useState } from "react";

const formSchema = z.object({
  patientId: z.string().min(1, "Patient selection is required."),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  drugName: z.string().optional(),
  dosage: z.string().optional(),
  instructions: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function ConsultationForm() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

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
      notes: "",
      diagnosis: "",
      drugName: "",
      dosage: "",
      instructions: "",
    },
  });

  useEffect(() => {
    if (selectedPatient) {
      form.setValue("patientId", selectedPatient.id);
    }
  }, [selectedPatient, form]);

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

      if (data.drugName && consultationRef) {
        const prescriptionData = {
          consultationId: consultationRef.id,
          drugName: data.drugName,
          dosage: data.dosage,
          frequency: data.instructions, // Assuming instructions map to frequency
          notes: data.instructions,
        };
        await addDocumentNonBlocking(collection(firestore, "prescriptions"), prescriptionData);
        // Here you might want to update the consultation with the prescription ID.
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
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Doctor's Notes</h3>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter doctor's notes here..." {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Diagnosis</h3>
              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter diagnosis..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Prescription</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="drugName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drug Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter drug name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter dosage..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter instructions..." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

    