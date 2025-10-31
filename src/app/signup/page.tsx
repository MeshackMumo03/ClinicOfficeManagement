
"use client";

// Import necessary hooks, components, and Firebase functions.
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope } from "lucide-react";
import { useAuth, useUser, useFirestore } from "@/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/layout/loader";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

// GoogleIcon component to display the Google logo.
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.58 3.18-7.11 3.18-5.52 0-10.02-4.48-10.02-10.01s4.5-10.01 10.02-10.01c3.18 0 5.22 1.25 6.42 2.39l2.84-2.73C18.44 1.16 15.7.0 12.48 0 5.88 0 .42 5.44.42 12.02s5.46 11.98 12.06 11.98c6.96 0 11.52-4.88 11.52-11.72 0-.79-.07-1.54-.19-2.32H12.48z" />
  </svg>
);

/**
 * SignupPage component for user registration.
 * It handles both email/password and Google sign-up, with role-specific fields.
 */
export default function SignupPage() {
  const [role, setRole] = useState("patient");
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  // Redirect to dashboard if user is already logged in.
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  // Handle email and password sign-up.
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = e.currentTarget.name.value;
    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;
    const confirmPassword = e.currentTarget["confirm-password"].value;
    const registrationNumber = e.currentTarget["registration-number"]?.value;
    const workId = e.currentTarget["work-id"]?.value;

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Passwords do not match.",
      });
      return;
    }

    if (!role) {
        toast({
            variant: "destructive",
            title: "Sign Up Failed",
            description: "Please select a role.",
          });
          return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;

      // Save user info to Firestore.
      const userDocRef = doc(firestore, "users", newUser.uid);
      const userData: {
        uid: string,
        name: string,
        email: string | null,
        role: string,
        registrationNumber?: string,
        workId?: string,
      } = {
        uid: newUser.uid,
        name: name,
        email: newUser.email,
        role: role,
      };

      if (role === 'doctor' && registrationNumber) {
        userData.registrationNumber = registrationNumber;
      }

      if (role === 'receptionist' && workId) {
        userData.workId = workId;
      }

      setDocumentNonBlocking(userDocRef, userData, { merge: true });

      toast({
        title: "Sign Up Successful",
        description: "Your account has been created.",
      });

      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message,
      });
    }
  };

  // Handle Google sign-in.
  const handleGoogleSignIn = async () => {
    if (!role) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Please select a role before signing up with Google.",
      });
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const newUser = result.user;

      const userDocRef = doc(firestore, "users", newUser.uid);
      const userData = {
        uid: newUser.uid,
        name: newUser.displayName,
        email: newUser.email,
        role: role,
      };

      setDocumentNonBlocking(userDocRef, userData, { merge: true });

      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message || "Could not sign in with Google.",
      });
    }
  };

  // If user is loading or already logged in, show loader.
  if (isUserLoading || user) {
    return <Loader />;
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <header className="flex h-20 items-center gap-4 border-b bg-background px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <div className="bg-primary text-primary-foreground rounded-md p-2">
            <Stethoscope className="h-6 w-6" />
          </div>
          <span className="text-xl font-headline">ClinicOffice</span>
        </Link>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Create your account</h1>
          </div>
          <form onSubmit={handleSignUp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your full name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={setRole} defaultValue="patient">
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "doctor" && (
              <div className="grid gap-2">
                <Label htmlFor="registration-number">
                  Registration Number
                </Label>
                <Input
                  id="registration-number"
                  placeholder="Enter your registration number"
                  required
                />
              </div>
            )}

            {role === "receptionist" && (
              <div className="grid gap-2">
                <Label htmlFor="work-id">Work ID</Label>
                <Input id="work-id" placeholder="Enter your work ID" required />
              </div>
            )}

            <Button type="submit" className="w-full">
              Sign Up
            </Button>
            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={handleGoogleSignIn}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Sign up with Google
            </Button>
          </form>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
