
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
  };

interface EditProfileDialogProps {
  user: User;
}

// Update the schema to include optional role-specific fields
const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  photoURL: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  registrationNumber: z.string().optional(),
  workId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function EditProfileDialog({ user }: EditProfileDialogProps) {
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
    },
  });

  const onSubmit = async (data: FormData) => {
    const userDocRef = doc(firestore, "users", user.uid);
    
    // Logic to reset verification status if critical info changes for doctors
    const updateData: Partial<User> & { [key: string]: any } = { ...data };
    if (user.role === 'doctor' && data.registrationNumber !== user.registrationNumber) {
        updateData.verified = false;
        toast({
            title: "Re-verification Required",
            description: "Your registration number changed. Your account is pending re-verification by an admin.",
            variant: "default",
        });
    }

    try {
        setDocumentNonBlocking(userDocRef, updateData, { merge: true });
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
      <DialogTrigger asChild>
        <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
