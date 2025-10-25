"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import {
    ChartContainer
} from "@/components/ui/chart"

const chartData = [
    { month: "Jan", trend: 186 },
    { month: "Feb", trend: 305 },
    { month: "Mar", trend: 237 },
    { month: "Apr", trend: 73 },
    { month: "May", trend: 209 },
    { month: "Jun", trend: 214 },
]

const chartConfig = {
    trend: {
        label: "Appointment Trends",
        color: "hsl(var(--primary))",
    },
}

export function AppointmentTrendsChart() {
    return (
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <XAxis
                        dataKey="month"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        hide={true}
                        domain={[0, 400]}
                    />
                    <Bar dataKey="trend" fill="var(--color-trend)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}
