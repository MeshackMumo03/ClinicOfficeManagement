import { StatsCards } from "@/components/dashboard/stats-cards";
import { PerformanceOverview } from "@/components/dashboard/performance-overview";
import { UserManagement } from "@/components/dashboard/user-management";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl md:text-4xl">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of clinic performance and key metrics
        </p>
      </div>

      <StatsCards />
      <PerformanceOverview />
      <UserManagement />
      
    </div>
  );
}
