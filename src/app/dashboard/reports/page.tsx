
"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from "recharts";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Loader } from "@/components/layout/loader";
import { subMonths, format } from "date-fns";

const COLORS = {
  Scheduled: "hsl(var(--chart-1))",
  Completed: "hsl(var(--chart-2))",
  Canceled: "hsl(var(--chart-3))",
};


/**
 * ReportsPage component to display financial and operational reports.
 */
export default function ReportsPage() {
  const firestore = useFirestore();

  // Fetch appointments for reporting
  const appointmentsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, "appointments") : null),
    [firestore]
  );
  const { data: appointments, isLoading: appointmentsLoading } =
    useCollection(appointmentsQuery);

  // Fetch billings for reporting
  const billingsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, "billings") : null),
    [firestore]
  );
  const { data: billings, isLoading: billingsLoading } =
    useCollection(billingsQuery);

  if (appointmentsLoading || billingsLoading) {
    return <Loader />;
  }

  // --- Process Appointment Data ---
  const appointmentStatusData = (appointments || []).reduce((acc: any, app: any) => {
    const status = app.status || "Unknown";
    const existing = acc.find((item: any) => item.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, []);

  // --- Process Billings Data for the last 6 months ---
  const sixMonthsAgo = subMonths(new Date(), 5); // 5 months ago to include the current month
  sixMonthsAgo.setDate(1); // Start from the beginning of that month

  const monthlyRevenue = (billings || [])
    .filter((bill: any) => bill.paymentStatus === 'paid' && new Date(bill.billingDate) >= sixMonthsAgo)
    .reduce((acc: any, bill: any) => {
      const month = format(new Date(bill.billingDate), "MMM yyyy");
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += bill.amount;
      return acc;
    }, {});
  
  const revenueChartData = Object.keys(monthlyRevenue).map(month => ({
    month,
    revenue: monthlyRevenue[month],
  })).sort((a, b) => new Date(`01 ${a.month}`) > new Date(`01 ${b.month}`) ? 1 : -1);


  return (
    <div className="flex flex-col gap-8">
      {/* Header section with page title and description. */}
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">Reports</h1>
        <p className="text-muted-foreground">
          Financial and operational reports for your clinic.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status Distribution</CardTitle>
            <CardDescription>
              A breakdown of all appointments by their current status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={(props) => `${props.name}: ${props.value}`}
                >
                    {appointmentStatusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue (Last 6 Months)</CardTitle>
            <CardDescription>
              Total revenue from paid bills over the past six months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `Ksh${value/1000}k`} />
                    <Tooltip formatter={(value: number) => `Ksh${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
