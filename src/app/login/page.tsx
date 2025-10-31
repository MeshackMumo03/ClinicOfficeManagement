"use client";

// Import necessary hooks and components.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser, useAuth } from "@/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/layout/loader";

/**
 * LoginPage component for user authentication.
 * It handles both email/password and Google sign-in.
 */
export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  // Redirect to dashboard if user is already logged in.
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  // Handle email and password login.
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
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
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
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
