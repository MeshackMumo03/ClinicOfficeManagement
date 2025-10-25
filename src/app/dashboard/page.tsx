import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const overviewStats = [
  { title: "Upcoming Appointments", value: "12" },
  { title: "Today's Patients", value: "8" },
  { title: "Pending Prescriptions", value: "3" },
];

const todaysAppointments = [
    { time: "9:00 AM", patient: "Chloe Bennett", type: "Check-up", status: "Confirmed" },
    { time: "10:30 AM", patient: "Owen Harper", type: "Consultation", status: "Confirmed" },
    { time: "1:00 PM", patient: "Isabella Hayes", type: "Follow-up", status: "Confirmed" },
    { time: "2:30 PM", patient: "Lucas Foster", type: "Check-up", status: "Confirmed" },
    { time: "4:00 PM", patient: "Ava Coleman", type: "Consultation", status: "Confirmed" },
];


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-4xl font-bold tracking-tight">
          Dashboard
        </h1>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {overviewStats.map((stat) => (
            <Card key={stat.title} className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-normal text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Today's Appointments</h2>
        <Card className="shadow-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todaysAppointments.map((appointment) => (
                  <TableRow key={appointment.time}>
                    <TableCell className="font-medium text-primary">{appointment.time}</TableCell>
                    <TableCell>{appointment.patient}</TableCell>
                    <TableCell className="text-primary">{appointment.type}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        {appointment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </Card>
      </div>

    </div>
  )
}
