import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Welcome back, Amelia
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-muted/40 rounded-xl p-6 flex flex-col gap-2">
            <p className="text-muted-foreground">Appointments Booked</p>
            <p className="text-4xl font-bold">25</p>
        </div>
        <div className="bg-muted/40 rounded-xl p-6 flex flex-col gap-2">
            <p className="text-muted-foreground">New Patients Registered</p>
            <p className="text-4xl font-bold">10</p>
        </div>
        <div className="bg-muted/40 rounded-xl p-6 flex flex-col gap-2">
            <p className="text-muted-foreground">Payments Processed</p>
            <p className="text-4xl font-bold">$5,000</p>
        </div>
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
