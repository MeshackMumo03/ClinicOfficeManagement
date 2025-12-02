
"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { InfoRow } from "../profile/info-card";
import { Badge } from "../ui/badge";

  
interface InvoiceDetailsDialogProps {
    invoice: any;
    patientName: string;
    children: React.ReactNode;
}
  

/**
 * A reusable component to display a label and a value.
 * It will not render if the value is not provided.
 */
function DetailRow({ label, value, isBadge, badgeClass }: { label:string; value?: string; isBadge?: boolean; badgeClass?: string; }) {
    if (!value) return null;
    return (
        <div className="flex justify-between items-center py-2 border-b last:border-none">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {isBadge ? (
                <Badge className={badgeClass}>{value}</Badge>
            ) : (
                <p className="text-sm text-foreground font-medium">{value}</p>
            )}
        </div>
    )
}


export function InvoiceDetailsDialog({ invoice, patientName, children }: InvoiceDetailsDialogProps) {

    const paymentStatusClass = invoice.paymentStatus === 'paid' 
    ? 'bg-green-100 text-green-800' 
    : invoice.paymentStatus === 'pending' 
    ? 'bg-yellow-100 text-yellow-800' 
    : 'bg-red-100 text-red-800';

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invoice Details</DialogTitle>
                    <DialogDescription>
                        Detailed view of invoice #{invoice.id.substring(0, 8)}...
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 mt-4">
                    <DetailRow label="Patient" value={patientName} />
                    <DetailRow label="Invoice ID" value={invoice.id} />
                    <DetailRow label="Billing Date" value={new Date(invoice.billingDate).toLocaleDateString()} />
                    <DetailRow label="Amount" value={`Ksh ${invoice.amount.toFixed(2)}`} />
                    <DetailRow label="Payment Status" value={invoice.paymentStatus} isBadge badgeClass={paymentStatusClass} />
                </div>
            </DialogContent>
        </Dialog>
    );
}

