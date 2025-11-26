
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { collection, doc } from "firebase/firestore";

const formSchema = z.object({
  patientId: z.string().min(1, "Patient is required."),
  doctorId: z.string().min(1, "Doctor is required."),
  appointmentDateTime: z.date({
    required_error: "A date and time is required.",
  }),
  reasonForVisit: z.string().min(1, "Reason for visit is required."),
  status: z.string().min(1, "Status is required"),
});

type FormData = z.infer<typeof formSchema>;

export function EditAppointmentDialog({ children, appointment }: { children: React.ReactNode, appointment: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const patientsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, "patients") : null),
    [firestore]
  );
  const { data: patients, isLoading: patientsLoading } = useCollection(patientsQuery);

  const doctorsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, "doctors") : null),
    [firestore]
  );
  const { data: doctors, isLoading: doctorsLoading } = useCollection(doctorsQuery);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: appointment.patientId || "",
      doctorId: appointment.doctorId || "",
      appointmentDateTime: new Date(appointment.appointmentDateTime) || new Date(),
      reasonForVisit: appointment.reasonForVisit || "",
      status: appointment.status || "Scheduled",
    },
  });

  const { formState, handleSubmit, control, reset } = form;

  const onSubmit = async (data: FormData) => {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Database not available.",
        });
        return;
    }
    try {
      const appointmentData = {
        ...data,
        appointmentDateTime: data.appointmentDateTime.toISOString(),
      };
      
      const appointmentRef = doc(firestore, "appointments", appointment.id);
      await setDocumentNonBlocking(appointmentRef, appointmentData, { merge: true });

      toast({
        title: "Appointment Updated",
        description: "The appointment has been successfully updated.",
      });
      
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "An error occurred while updating the appointment.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
          <DialogDescription>
            Update the details for this appointment.
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormField
                control={control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={doctorsLoading}>
                          <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors?.map((d: any) => (
                          <SelectItem key={d.id} value={d.id}>
                            Dr. {d.firstName} {d.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="appointmentDateTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date and Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP HH:mm")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                            <Input 
                                type="time"
                                value={field.value ? format(field.value, "HH:mm") : ""}
                                onChange={(e) => {
                                    const time = e.target.value;
                                    if (!time) return;
                                    const [hours, minutes] = time.split(':').map(Number);
                                    const newDate = field.value ? new Date(field.value) : new Date();
                                    newDate.setHours(hours, minutes);
                                    field.onChange(newDate);
                                }}
                            />
                        </div>

                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Canceled">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="reasonForVisit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Visit</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Annual check-up, consultation..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={formState.isSubmitting}>
                {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
