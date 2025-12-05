
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doc } from "firebase/firestore";

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
import { useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Pencil, Loader2 } from "lucide-react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUser } from "@/firebase";

// Define the shape of the user object, including optional role-specific fields
type User = {
    uid: string;
    name: string;
    role: "admin" | "doctor" | "receptionist" | "patient";
    verified?: boolean;
    photoURL?: string;
    registrationNumber?: string;
    workId?: string;
    dateOfBirth?: string;
    gender?: string;
    contactNumber?: string;
    address?: string;
  };

interface EditProfileDialogProps {
  user: User;
  children: React.ReactNode;
}

// Update the schema to include optional role-specific fields
const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  photoURL: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  registrationNumber: z.string().optional(),
  workId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function EditProfileDialog({ user, children }: EditProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      photoURL: user.photoURL || "",
      registrationNumber: user.registrationNumber || "",
      workId: user.workId || "",
      dateOfBirth: user.dateOfBirth || "",
      gender: user.gender || "",
      contactNumber: user.contactNumber || "",
      address: user.address || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    // We need to update two documents: the user profile and the patient record
    const userDocRef = doc(firestore, "users", user.uid);
    const patientDocRef = doc(firestore, "patients", user.uid);
    
    // Logic to reset verification status if critical info changes for doctors
    const updateData: Partial<User> & { [key: string]: any } = { name: data.name, photoURL: data.photoURL };
    
    if (user.role === 'doctor') {
      updateData.registrationNumber = data.registrationNumber;
      if (data.registrationNumber !== user.registrationNumber) {
          updateData.verified = false;
          toast({
              title: "Re-verification Required",
              description: "Your registration number changed. Your account is pending re-verification by an admin.",
              variant: "default",
          });
      }
    }
    
    if (user.role === 'receptionist') {
      updateData.workId = data.workId;
    }

    try {
        // Update the user document
        setDocumentNonBlocking(userDocRef, updateData, { merge: true });

        // If the user is a patient, update the corresponding patient document as well
        if (user.role === 'patient') {
            const [firstName, ...lastNameParts] = data.name.split(' ');
            const lastName = lastNameParts.join(' ');
            
            const patientData = {
                firstName,
                lastName,
                dateOfBirth: data.dateOfBirth,
                gender: data.gender,
                contactNumber: data.contactNumber,
                address: data.address,
            };
            setDocumentNonBlocking(patientDocRef, patientData, { merge: true });
        }

        toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
        });
        setIsOpen(false);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "Could not update profile.",
        });
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser) return;

    setIsUploading(true);
    const storage = getStorage();
    const storagePath = `avatars/${authUser.uid}/${file.name}`;
    const storageRef = ref(storage, storagePath);

    try {
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      form.setValue("photoURL", downloadURL);
      toast({ title: "Image Uploaded", description: "Image is ready to be saved with your profile." });
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload the image." });
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                        <Input type="file" onChange={handleFileChange} disabled={isUploading} />
                    </FormControl>
                    <FormMessage />
                    {isUploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                    {form.getValues('photoURL') && !isUploading &&(
                        <p className="text-sm text-muted-foreground mt-2">
                           New photo selected. Click Save to apply.
                        </p>
                    )}
                </FormItem>

                {/* Conditionally render role-specific fields */}
                {user.role === 'doctor' && (
                    <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>LSK Registration Number</FormLabel>
                        <FormControl>
                            <Input placeholder="Your registration number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                {user.role === 'receptionist' && (
                    <FormField
                    control={form.control}
                    name="workId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Work ID</FormLabel>
                        <FormControl>
                            <Input placeholder="Your work ID" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                {/* Patient specific fields */}
                {user.role === 'patient' && (
                  <>
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                          </Select>
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
                            <Input placeholder="Your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Your address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting || isUploading}>
                    {(form.formState.isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save changes
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
