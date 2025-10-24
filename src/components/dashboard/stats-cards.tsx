import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, MessageSquare } from "lucide-react";

const stats = [
    {
        title: "Total Patients",
        value: "1,254",
        change: "+20.1% from last month",
        icon: Users,
    },
    {
        title: "Upcoming Appointments",
        value: "42",
        change: "+15 since yesterday",
        icon: Calendar,
    },
    {
        title: "Revenue Today",
        value: "$4,820.50",
        change: "+5.2% from last week",
        icon: DollarSign,
    },
    {
        title: "Unread Messages",
        value: "3",
        change: "1 new message",
        icon: MessageSquare,
    },
];

export function StatsCards() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm !font-body !font-medium">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
