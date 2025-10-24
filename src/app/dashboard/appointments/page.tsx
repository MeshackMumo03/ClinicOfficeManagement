"use client"

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { appointments, type Appointment } from "@/lib/data";

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('');
}


export default function AppointmentsPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const selectedDayAppointments = appointments.filter(
    (app) => {
        const appDate = new Date(app.date);
        return date && appDate.toDateString() === date.toDateString();
    }
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Appointments</h1>
        <p className="text-muted-foreground">
          View and manage patient appointments.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardContent className="p-2 sm:p-4">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md w-full"
                    />
                </CardContent>
            </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                Appointments for {date ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'}) : ''}
              </CardTitle>
              <CardDescription>
                {selectedDayAppointments.length} appointments scheduled for this day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {selectedDayAppointments.map((app) => (
                    <div key={app.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted">
                      <Avatar>
                        <AvatarImage data-ai-hint="person face" src={`https://picsum.photos/seed/${app.patientName.replace(/\s/g, '')}/100/100`} />
                        <AvatarFallback>{getInitials(app.patientName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{app.patientName}</p>
                        <p className="text-sm text-muted-foreground">{app.time} - {app.type}</p>
                      </div>
                      <Badge variant={app.status === 'Scheduled' ? 'default' : app.status === 'Completed' ? 'secondary' : 'destructive'} className="capitalize bg-accent text-accent-foreground">{app.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No appointments for this day.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
