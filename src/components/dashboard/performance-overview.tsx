import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AppointmentTrendsChart } from "./appointment-trends-chart";
import { RevenueGrowthChart } from "./revenue-growth-chart";

export function PerformanceOverview() {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Performance Overview</h2>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Appointment Trends</CardTitle>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">+15%</span>
                            <span className="text-sm text-muted-foreground">Last 30 Days +15%</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <AppointmentTrendsChart />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Revenue Growth</CardTitle>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">+12%</span>
                            <span className="text-sm text-muted-foreground">Last 12 Months +12%</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <RevenueGrowthChart />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
