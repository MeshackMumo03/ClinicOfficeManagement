
"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { InfoCard } from "./info-card";
import { cn } from "@/lib/utils";
import { EditProfileDialog } from "./edit-profile-dialog";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Loader } from "../layout/loader";

// Define the shape of the user object
type User = {
  uid: string;
  name: string;
  email: string | null;
  role: "admin" | "doctor" | "receptionist" | "patient";
  registrationNumber?: string;
  workId?: string;
  photoURL?: string;
  verified?: boolean;
};

interface UserProfileProps {
  user: User;
}

/**
 * A component to display the consultation history for the logged-in user.
 * It fetches consultations where the user's ID matches the patientId or doctorId.
 */
function UserConsultationHistory() {
    const { user } = useUser();
    const firestore = useFirestore();

    const consultationsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        // CRITICAL FIX: The query must be filtered by patientId to match security rules.
        return query(
            collection(firestore, 'consultations'),
            where('patientId', '==', user.uid), // This 'where' clause is the fix.
            orderBy('consultationDateTime', 'desc')
        );
    }, [firestore, user]);

    const { data: consultations, isLoading, error } = useCollection(consultationsQuery);
    
    // Fetch all doctors to resolve names, this is fine as doctor list is public.
    const doctorsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'doctors') : null, [firestore]);
    const { data: doctors, isLoading: doctorsLoading } = useCollection(doctorsQuery);

    const getDoctorName = (doctorId: string) => {
        if (!doctors) return "Loading...";
        const doctor = doctors.find((d: any) => d.id === doctorId);
        return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Unknown Doctor";
    };

    if (isLoading || doctorsLoading) {
        return <div className="flex justify-center items-center h-40"><Loader /></div>;
    }

    if (error) {
        return <p className="text-destructive">Error loading your consultation history. Please check permissions.</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Consultation History</CardTitle>
                <CardDescription>A record of all your past consultations.</CardDescription>
            </CardHeader>
            <CardContent>
                {consultations && consultations.length > 0 ? (
                    <div className="space-y-4">
                        {consultations.map((c: any) => (
                            <div key={c.id} className="border p-4 rounded-lg bg-muted/20">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold">{new Date(c.consultationDateTime).toLocaleDateString()}</h4>
                                    <span className="text-sm text-muted-foreground">{getDoctorName(c.doctorId)}</span>
                                </div>
                                <p className="font-medium">Diagnosis: <span className="font-normal">{c.diagnosis || 'N/A'}</span></p>
                                {c.notes && <p className="text-sm text-muted-foreground mt-2"><strong>Notes:</strong> {c.notes}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">You have no consultation history.</p>
                )}
            </CardContent>
        </Card>
    );
}


/**
 * A utility function to get initials from a name.
 * @param name The full name of the person.
 * @returns The initials of the person.
 */
function getInitials(name: string) {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const roleColors = {
    admin: 'bg-role-admin',
    doctor: 'bg-role-doctor',
    receptionist: 'bg-role-receptionist',
    patient: 'bg-role-patient',
}

/**
 * A component to display the profile of a user, adapting to their role.
 * @param {UserProfileProps} props The properties for the component.
 */
export function UserProfile({ user }: UserProfileProps) {
  const { name, email, role, photoURL, registrationNumber, workId, verified } = user;
  const avatarFallback = getInitials(name);

  const personalInfo = [
    { label: "Full Name", value: name },
    { label: "Email Address", value: email },
  ];

  const roleSpecificInfo = [
    { label: "Registration Number", value: registrationNumber },
    { label: "Work ID", value: workId },
  ];

  const roleColorClass = roleColors[role] || 'bg-primary';

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage data-ai-hint="person face" src={photoURL} alt={name} />
          <AvatarFallback className="text-3xl">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <h2 className="text-3xl font-bold font-headline">{name}</h2>
            <Badge className={cn("text-sm capitalize", roleColorClass)}>
                {role}
            </Badge>
            { (role === 'doctor' || role === 'receptionist') && verified && (
                 <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    Verified
                </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{email}</p>
        </div>
        <EditProfileDialog user={user} />
      </div>

      {/* Profile Details Tabs */}
      <Tabs defaultValue="personal-info">
        <TabsList className="mb-6">
          <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
          {role === 'patient' && <TabsTrigger value="consultation-history">Consultation History</TabsTrigger>}
        </TabsList>

        <TabsContent value="personal-info">
            <div className="space-y-6">
                <InfoCard title="Personal Information" items={personalInfo} />
                
                {role === 'admin' && (
                    <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <ShieldCheck className="h-8 w-8 text-role-admin" />
                        <CardTitle className="text-xl">Admin Privileges</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                        As an administrator, you have full access to all system features, including user management, billing, and reports.
                        </p>
                    </CardContent>
                    </Card>
                )}

                {role !== 'admin' && roleSpecificInfo.some(item => item.value) && (
                    <InfoCard title="Professional Information" items={roleSpecificInfo} />
                )}
            </div>
        </TabsContent>
        {role === 'patient' && (
            <TabsContent value="consultation-history">
                <UserConsultationHistory />
            </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
