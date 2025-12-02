
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, doc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Loader2 } from "lucide-react";

// Schema for invoice creation form
const formSchema = z.object({
  patientId: z.string().min(1, "Patient is required."),
  amount: z.coerce.number().min(1, "Amount must be greater than 0."),
  phoneNumber: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreateInvoiceDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const patientsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, "patients") : null),
    [firestore]
  );
  const { data: patients, isLoading: patientsLoading } = useCollection(patientsQuery);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      amount: 0,
      phoneNumber: "",
    },
  });

  const { formState, handleSubmit, control, reset, setValue } = form;

  const handlePatientChange = (patientId: string) => {
    const patient = patients?.find((p: any) => p.id === patientId);
    setSelectedPatient(patient || null);
    setValue("patientId", patientId);
    if (patient?.contactNumber) {
        setValue("phoneNumber", patient.contactNumber);
    } else {
        setValue("phoneNumber", "");
    }
  };


  const onSubmit = async (data: FormData) => {
    try {
      // 1. Create a new document reference for the invoice in the 'billings' collection
      const newInvoiceRef = doc(collection(firestore, "billings"));
      
      const invoiceData = {
        id: newInvoiceRef.id,
        patientId: data.patientId,
        amount: data.amount,
        billingDate: new Date().toISOString(),
        paymentStatus: 'unpaid',
      };
      
      // 2. Save the invoice data to Firestore using setDocumentNonBlocking
      setDocumentNonBlocking(newInvoiceRef, invoiceData, { merge: false });

      // 3. If a new phone number was entered, update the corresponding patient record
      if (data.phoneNumber && data.phoneNumber !== selectedPatient?.contactNumber) {
        const patientDocRef = doc(firestore, "patients", data.patientId);
        // Use merge:true to only update the contact number field
        setDocumentNonBlocking(patientDocRef, { contactNumber: data.phoneNumber }, { merge: true });
      }

      toast({
        title: "Invoice Created",
        description: `Successfully created invoice for ${selectedPatient?.firstName} ${selectedPatient?.lastName}.`,
      });
      reset();
      setSelectedPatient(null);
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Could not create the new invoice.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Select a patient and enter the amount to create a new invoice.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
            <FormField
                control={control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={handlePatientChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={patientsLoading}>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients?.map((p: any) => (
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
                 <FormField
                    control={control}
                    name="phoneNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Patient Phone Number</FormLabel>
                        <FormControl>
                        <Input placeholder="Enter patient's phone number for M-Pesa" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              )}

              <FormField
                control={control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (Ksh)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 1500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={formState.isSubmitting}>
                    {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Invoice
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
