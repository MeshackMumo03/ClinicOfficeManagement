"use client";

// Import necessary hooks and components from react-hook-form, zod, ShadCN, and local data.
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { patients } from "@/lib/data";

// Define the schema for the consultation form using Zod.
const formSchema = z.object({
  patientName: z.string().min(1, "Patient name is required."),
  dateOfBirth: z.string().min(1, "Date of birth is required."),
  gender: z.string().min(1, "Gender is required."),
  contactNumber: z.string().min(1, "Contact number is required."),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  drugName: z.string().optional(),
  dosage: z.string().optional(),
  instructions: z.string().optional(),
});

// Infer the type of the form data from the schema.
type FormData = z.infer<typeof formSchema>;

/**
 * ConsultationForm component to capture patient consultation details.
 * It uses react-hook-form for form management and zod for validation.
 */
export function ConsultationForm() {
  // Initialize the form with react-hook-form.
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        patientName: "",
        dateOfBirth: "",
        gender: "",
        contactNumber: "",
        notes: "",
        diagnosis: "",
        drugName: "",
        dosage: "",
        instructions: "",
    },
  });

  // Handle form submission.
  const onSubmit = async (data: FormData) => {
    console.log(data);
    // TODO: Handle form submission logic, e.g., save to a database.
  };

  return (
    <Card className="max-w-3xl mx-auto">
        <CardHeader>
            <CardTitle className="text-2xl">Consultation Form</CardTitle>
            <CardDescription>Fill out the consultation details for the patient.</CardDescription>
        </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Patient Information section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Patient Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Patient Name" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                            <Input placeholder="Date of Birth" {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                            <Input placeholder="Gender" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                            <Input placeholder="Contact Number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>

            {/* Doctor's Notes section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Doctor's Notes</h3>
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Enter doctor's notes here..."
                            {...field}
                            rows={5}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            {/* Diagnosis section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Diagnosis</h3>
                <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Diagnosis</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="Enter diagnosis..."
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            {/* Prescription section */}
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
                            <Input
                                placeholder="Enter drug name..."
                                {...field}
                            />
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
                            <Input
                                placeholder="Enter dosage..."
                                {...field}
                            />
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
                        <Textarea
                            placeholder="Enter instructions..."
                            {...field}
                            rows={3}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-4">
              <Button type="submit">Save Consultation</Button>
              <Button variant="outline" type="button">Print/Export PDF</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
