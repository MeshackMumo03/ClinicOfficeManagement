import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { appointments } from "@/lib/data"

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('');
}

export function RecentAppointments() {
    const upcomingAppointments = appointments
        .filter(a => a.status === 'Scheduled')
        .slice(0, 5);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>
                    You have {upcomingAppointments.length} appointments today.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage data-ai-hint="person face" src={`https://picsum.photos/seed/${appointment.patientName.replace(/\s/g, '')}/100/100`} />
                                <AvatarFallback>{getInitials(appointment.patientName)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium leading-none">
                                    {appointment.patientName}
                                </p>
                                <p className="text-sm text-muted-foreground">{appointment.type}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-sm font-medium">{appointment.time}</p>
                             <p className="text-sm text-muted-foreground">Dr. Smith</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
