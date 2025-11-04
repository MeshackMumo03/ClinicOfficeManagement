
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Loader } from "@/components/layout/loader";
import { cn } from "@/lib/utils";

const roleColorClass: Record<string, string> = {
  admin: 'bg-role-admin',
  doctor: 'bg-role-doctor',
  receptionist: 'bg-role-receptionist',
  patient: 'bg-role-patient',
};

/**
 * AdminPage component to display the admin dashboard.
 * Includes a user management table.
 */
export default function AdminPage() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, "users") : null),
    [firestore]
  );
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users and system settings from here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>UID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.map((user: any) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", roleColorClass[user.role] || 'bg-primary')}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.uid}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
