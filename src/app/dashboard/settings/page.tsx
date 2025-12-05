
"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { UserProfile } from "@/components/profile/user-profile";
import { Loader } from "@/components/layout/loader";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { Button } from "@/components/ui/button";

/**
 * SettingsPage component to display and manage user settings.
 * It fetches the current user's data and provides options to edit the profile.
 */
export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Fetch the user's /users document
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  // If the user is a patient, also fetch their /patients document
  const patientDocRef = useMemoFirebase(() => {
    if (user && userData?.role === 'patient') {
      return doc(firestore, 'patients', user.uid);
    }
    return null;
  }, [user, userData, firestore]);
  const { data: patientData, isLoading: isPatientDataLoading } = useDoc(patientDocRef);

  const pageIsLoading = isUserLoading || isUserDataLoading || (userData?.role === 'patient' && isPatientDataLoading);

  if (pageIsLoading) {
    return <Loader />;
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Could not load user profile.</p>
      </div>
    );
  }
  
  // Combine data for the profile component
  const combinedUserData = {
    ...userData,
    ...(patientData && {
      dateOfBirth: patientData.dateOfBirth,
      gender: patientData.gender,
      contactNumber: patientData.contactNumber,
      address: patientData.address,
    })
  }


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Settings</h1>
        <p className="text-muted-foreground">
          View and manage your account and personal information.
        </p>
      </div>
      <UserProfile user={combinedUserData} />
    </div>
  );
}
