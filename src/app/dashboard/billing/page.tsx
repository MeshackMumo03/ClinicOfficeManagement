// Import necessary components from ShadCN and Lucide-React.
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { invoices } from "@/lib/data";

/**
 * BillingPage component to display and manage invoices.
 * It includes a table of invoices with actions for each.
 */
export default function BillingPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header section with page title and description. */}
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Billing</h1>
        <p className="text-muted-foreground">
          Manage invoices and payments.
        </p>
      </div>

      {/* Table section to display invoices. */}
      <div className="border rounded-lg w-full">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Map through invoices to create a table row for each invoice. */}
              {invoices.map((invoice) => (
                <TableRow key={invoice.invoiceId}>
                  <TableCell className="font-medium">{invoice.invoiceId}</TableCell>
                  <TableCell>{invoice.patientName}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {/* Display a badge with a color corresponding to the invoice status. */}
                    <Badge variant={
                      invoice.status === 'Paid' ? 'secondary' : invoice.status === 'Pending' ? 'outline' : 'destructive'
                    } className={invoice.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : ''}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* Dropdown menu with actions for each invoice. */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
