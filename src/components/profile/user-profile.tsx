
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

      {/* Profile Details */}
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
    </div>
  );
}
