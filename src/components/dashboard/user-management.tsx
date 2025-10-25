import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { users } from "@/lib/data";


export function UserManagement() {
  return (
    <div>
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <div className="border rounded-lg w-full">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {users.map((user) => (
                    <TableRow key={user.email}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                        <Badge variant="secondary" className="font-normal">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 font-normal">{user.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="link" className="text-primary p-0 h-auto">Edit</Button>
                        <span className="text-muted-foreground mx-1">|</span>
                        <Button variant="link" className="text-primary p-0 h-auto">Delete</Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}
