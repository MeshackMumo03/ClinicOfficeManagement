
"use client";

// Import the ConsultationForm component and other necessary modules.
import { ConsultationForm } from "@/components/consultations/consultation-form";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Loader } from "@/components/layout/loader";

/**
 * ConsultationsPage component to display the consultation form.
 * It serves as a container for the form where doctors can input consultation details.
 * It also restricts access to non-doctor roles.
 */
export default function ConsultationsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);
  const userRole = userData?.role;
  const isDoctor = userRole === 'doctor' || userRole === 'admin';

  if (isUserLoading || isUserDataLoading) {
    return <Loader />;
  }
  
  if (!isDoctor) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 flex flex-col items-center text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
                This page is for clinic doctors only. You do not have permission to view this page.
            </p>
        </CardContent>
    </Card>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header section with page title and description. */}
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">
          Consultation Form
        </h1>
        <p className="text-muted-foreground">
          Fill out the consultation details for the patient.
        </p>
      </div>

      {/* The ConsultationForm component is rendered here. */}
      <ConsultationForm />
    </div>
  );
}
