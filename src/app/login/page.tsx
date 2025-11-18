

"use client";

// Import necessary hooks and components.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser, useAuth, useFirestore } from "@/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/layout/loader";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

/**
 * Ensures that a corresponding role-specific document exists for a user.
 * If the document doesn't exist, it creates one.
 * @param db Firestore instance.
 * @param user The authenticated user object.
 * @param userDocData The user's data from the /users/{uid} document.
 */
const ensureRoleDocumentExists = async (db: any, user: User, userDocData: any) => {
  if (!userDocData?.role || !user) return;

  const userRole = userDocData.role;
  const name = userDocData.name || user.displayName || 'Unnamed User';
  const [firstName, ...lastNameParts] = name.split(' ');
  const lastName = lastNameParts.join(' ') || ' ';


  if (userRole === 'patient') {
    const patientDocRef = doc(db, 'patients', user.uid);
    const patientDoc = await getDoc(patientDocRef);
    if (!patientDoc.exists()) {
      const patientData = {
        id: user.uid,
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        dateOfBirth: 'N/A',
        gender: 'N/A',
        contactNumber: 'N/A',
        address: 'N/A',
      };
      // Using non-blocking update for responsiveness
      setDocumentNonBlocking(patientDocRef, patientData, { merge: true });
    }
  } else if (userRole === 'doctor') {
    const doctorDocRef = doc(db, 'doctors', user.uid);
    const doctorDoc = await getDoc(doctorDocRef);
    if (!doctorDoc.exists()) {
      const doctorData = {
        id: user.uid,
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        specialization: 'General Practice',
        contactNumber: 'N/A',
      };
      setDocumentNonBlocking(doctorDocRef, doctorData, { merge: true });
    }
  }
};


/**
 * Handles the post-login logic: checking role, ensuring data exists, and redirecting.
 * @param db Firestore instance.
 * @param user The authenticated user object.
 * @param router The Next.js router instance.
 */
const handlePostLogin = async (db: any, user: User, router: any) => {
    const userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        const userData = docSnap.data();
        await ensureRoleDocumentExists(db, user, userData);

        if (userData.role === 'admin') {
            router.push("/admin");
        } else {
            // For all other roles, verified or not, go to the main dashboard.
            // The dashboard layout will handle showing the "pending" page if needed.
            router.push("/dashboard");
        }
    } else {
        // Fallback for users who might not have a user document yet.
        // This can happen with Google sign-in if the user record isn't created yet.
        // We'll create a basic user doc here.
        const basicUserData = {
            uid: user.uid,
            name: user.displayName || 'New User',
            email: user.email,
            role: 'patient', // Default to patient
            verified: true, // Patients are auto-verified
        };
        await setDoc(userDocRef, basicUserData, { merge: true });
        await ensureRoleDocumentExists(db, user, basicUserData);
        router.push("/dashboard");
    }
};


/**
 * LoginPage component for user authentication.
 * It handles both email/password and Google sign-in.
 */
export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  // Redirect to dashboard if user is already logged in.
  useEffect(() => {
    if (!isUserLoading && user && firestore) {
        handlePostLogin(firestore, user, router);
    }
  }, [user, isUserLoading, router, firestore]);

  // Handle email and password login.
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;
    try {
      // This will trigger the useEffect hook above upon successful login
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    }
  };

  // If user is loading or already logged in, show loader.
  if (isUserLoading || user) {
    return <Loader />;
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-headline text-gray-900 dark:text-white">ClinicOffice</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back! Please log in to your account.
          </p>
        </div>
        <form onSubmit={handleLogin} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline text-primary">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

    