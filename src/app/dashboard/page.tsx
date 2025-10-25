import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarIcon,
  ClockIcon,
  CreditCardIcon,
  DollarSignIcon,
  InboxIcon,
  ReceiptIcon,
  UserIcon,
} from "lucide-react";
import Image from "next/image";

const recentDocuments = [
  { name: "Lab Results", date: "June 1, 2024", status: "Completed" },
  { name: "Referral Letter", date: "May 15, 2024", status: "Processed" },
  { name: "Insurance Card", date: "April 20, 2024", status: "Verified" },
];

export default function PatientPortalPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div className="flex flex-col gap-8">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src="https://picsum.photos/seed/sophiaclark/200/200" data-ai-hint="person face" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">Sophia Clark</h2>
          <p className="text-muted-foreground">Patient ID: 123456</p>
        </Card>
        <Card>
          <CardContent className="p-6 grid gap-4">
            <div className="flex items-start gap-4">
              <UserIcon className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-semibold">Primary Care Physician</p>
                <p className="text-muted-foreground">Dr. Emily Carter</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-semibold">Upcoming Appointment</p>
                <p className="text-muted-foreground">
                  Next Appointment: July 15, 2024, 2:00 PM
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <ClockIcon className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-semibold">Recent Visit</p>
                <p className="text-muted-foreground">Last Visit: June 1, 2024</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CreditCardIcon className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-semibold">Billing Status</p>
                <p className="text-muted-foreground">No outstanding balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Patient Portal</h1>
          <p className="text-muted-foreground">
            Manage your health information, appointments, and communication
            with your healthcare provider.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button>Book Appointment</Button>
          <Button variant="outline">Upload Documents</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-sm text-muted-foreground">July 15, 2024, 2:00 PM</p>
              <h3 className="text-lg font-semibold mt-1">
                Annual Check-up with Dr. Emily Carter
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Location: Main Clinic, Room 201
              </p>
            </div>
            <div className="hidden md:block">
                <Image 
                    data-ai-hint="clinic waiting room"
                    src="https://picsum.photos/seed/clinic-room/600/400"
                    width={300}
                    height={200}
                    alt="Clinic room"
                    className="rounded-lg object-cover"
                />
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentDocuments.map((doc) => (
                        <div key={doc.name} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                            <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-sm text-muted-foreground">{doc.date}</p>
                            </div>
                            <Button variant="secondary" size="sm" className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900">{doc.status}</Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="flex items-center gap-4">
                        <DollarSignIcon className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">Current Balance</p>
                            <p className="text-muted-foreground">No outstanding balance</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <ReceiptIcon className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">Recent Payment</p>
                            <p className="text-muted-foreground">Last Payment: $150 on June 1, 2024</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Messages</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="flex items-center gap-4">
                        <InboxIcon className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">Recent Messages</p>
                            <p className="text-muted-foreground">Last message received: June 10, 2024</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}