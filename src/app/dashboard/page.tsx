import { StatsCards } from '@/components/dashboard/stats-cards';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { RecentAppointments } from '@/components/dashboard/recent-appointments';
import { NewPatients } from '@/components/dashboard/new-patients';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">
          Welcome back, Dr. Smith
        </h1>
        <p className="text-muted-foreground">
          Here's a summary of your clinic's activity today.
        </p>
      </div>

      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <OverviewChart />
        </div>
        <div className="lg:col-span-3">
          <RecentAppointments />
        </div>
      </div>
      
      <NewPatients />

    </div>
  );
}
