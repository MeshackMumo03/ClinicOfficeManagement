
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
import { Pencil } from "lucide-react";

// Define the shape of the user object, including optional role-specific fields
type User = {
    uid: string;
    name: string;
    role: "admin" | "doctor" | "receptionist" | "patient";
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
  photoURL: z.string().optional(),
  registrationNumber: z.string().optional(),
  workId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function EditProfileDialog({ user }: EditProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const firestore = useFirestore();
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
    try {
        setDocumentNonBlocking(userDocRef, data, { merge: true });
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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, you'd upload the file and get a URL.
    // Here, we'll just use a new placeholder image for demonstration.
    const newImageId = Math.floor(Math.random() * 1000);
    const newPhotoURL = `https://picsum.photos/seed/${newImageId}/200/200`;
    form.setValue("photoURL", newPhotoURL);
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
                <FormField
                control={form.control}
                name="photoURL"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                        <Input type="file" onChange={handleFileChange} />
                    </FormControl>
                    <FormMessage />
                    {field.value && (
                        <p className="text-sm text-muted-foreground mt-2">
                            New photo preview will be visible after saving.
                        </p>
                    )}
                    </FormItem>
                )}
                />

                {/* Conditionally render role-specific fields */}
                {user.role === 'doctor' && (
                    <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Registration Number</FormLabel>
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
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
