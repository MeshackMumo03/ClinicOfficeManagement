import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, Amelia</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-normal text-muted-foreground">
              Appointments Booked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">25</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-normal text-muted-foreground">
              New Patients Registered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">10</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-normal text-muted-foreground">
              Payments Processed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">$5,000</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Register New Patient</Button>
          <Button variant="secondary">Book Appointment</Button>
          <Button variant="secondary">Generate Receipt</Button>
        </div>
      </div>
    </div>
  );
}
