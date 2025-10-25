import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
    {
        title: "Total Patients",
        value: "1,250",
        change: "+10%",
    },
    {
        title: "Appointments this Month",
        value: "320",
        change: "+5%",
    },
    {
        title: "Revenue Summary",
        value: "$45,000",
        change: "+8%",
    },
];

export function StatsCards() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
                <Card key={stat.title} className="bg-muted/20 border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium text-muted-foreground">
                            {stat.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stat.value}</div>
                        <p className="text-sm text-green-500">{stat.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
