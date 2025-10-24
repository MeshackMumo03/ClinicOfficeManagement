import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { patients } from "@/lib/data"

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('');
}

export function NewPatients() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Patients</CardTitle>
        <CardDescription>
          Recently registered patients in your clinic.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {patients.slice(0, 4).map((patient) => (
            <div key={patient.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage data-ai-hint="person face" src={`https://picsum.photos/seed/new-${patient.id}/100/100`} alt="Avatar" />
                <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{patient.name}</p>
                <p className="text-sm text-muted-foreground">
                  {patient.email}
                </p>
              </div>
              <div className="ml-auto font-medium">
                <Button variant="outline" size="sm">View Profile</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
