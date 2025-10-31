
"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { UserProfile } from "@/components/profile/user-profile";
import { Loader } from "@/components/layout/loader";

/**
 * ProfilePage component to display the user's profile information.
 * It fetches the current user's data and passes it to the UserProfile component.
 */
export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  if (isUserLoading || isUserDataLoading) {
    return <Loader />;
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Could not load user profile.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your personal information.
        </p>
      </div>
      <UserProfile user={userData} />
    </div>
  );
}
