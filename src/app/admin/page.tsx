
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Loader } from "@/components/layout/loader";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, CheckCircle, ShieldAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";


const roleColorClass: Record<string, string> = {
  admin: 'bg-role-admin',
  doctor: 'bg-role-doctor',
  receptionist: 'bg-role-receptionist',
  patient: 'bg-role-patient',
};

/**
 * AdminPage component to display the admin dashboard.
 * Includes a user management table with actions to create, edit, and delete users.
 */
export default function AdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, "users") : null),
    [firestore]
  );
  const { data: users, isLoading: usersLoading, error } = useCollection(usersQuery);

  const handleDeleteUser = (userId: string) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, "users", userId);
    
    // Note: This only deletes the Firestore user document.
    // The actual Firebase Auth user needs to be deleted via a Cloud Function for security reasons.
    deleteDocumentNonBlocking(userDocRef);

    toast({
      title: "User Deletion Initiated",
      description: "The user document has been scheduled for deletion. Auth user must be deleted separately.",
    });
  };

  const handleVerifyUser = (user: any) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, "users", user.uid);
    setDocumentNonBlocking(userDocRef, { verified: true }, { merge: true });
    toast({
      title: "User Verified",
      description: `${user.name} has been verified and can now access the system.`,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
            <h1 className="font-headline text-3xl md:text-4xl">Admin Dashboard</h1>
            <p className="text-muted-foreground">
            Manage users and system settings from here.
            </p>
        </div>
        <CreateUserDialog>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create User
            </Button>
        </CreateUserDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View, create, edit, and manage all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader />
            </div>
          ) : error ? (
            <div className="text-destructive text-center">
              <p>Error loading users: {error.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">UID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.map((user: any) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                    <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", roleColorClass[user.role] || 'bg-primary')}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        {(user.role === 'doctor' || user.role === 'receptionist') ? (
                             user.verified ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Verified
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">
                                    <ShieldAlert className="mr-1 h-3 w-3" />
                                    Unverified
                                </Badge>
                            )
                        ) : (
                            <Badge variant="outline">N/A</Badge>
                        )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{user.uid}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                             <EditUserDialog user={user}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    Edit User
                                </DropdownMenuItem>
                             </EditUserDialog>
                             { (user.role === 'doctor' || user.role === 'receptionist') && !user.verified && (
                                <DropdownMenuItem onClick={() => handleVerifyUser(user)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Verify User
                                </DropdownMenuItem>
                             )}
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                    Delete User
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user's
                                account data from the database. The Firebase Auth user must be deleted separately.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.uid)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
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

    