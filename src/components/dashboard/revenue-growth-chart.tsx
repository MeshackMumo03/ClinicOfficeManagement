"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import {
    ChartContainer
} from "@/components/ui/chart"

const chartData = [
    { quarter: "Q1", growth: 100 },
    { quarter: "Q2", growth: 150 },
    { quarter: "Q3", growth: 250 },
    { quarter: "Q4", growth: 200 },
    { quarter: "Q1_2", growth: 300 },
    { quarter: "Q2_2", growth: 250 },
    { quarter: "Q3_2", growth: 350 },
    { quarter: "Q4_2", growth: 400 },
]

const chartConfig = {
    growth: {
        label: "Revenue Growth",
        color: "hsl(var(--primary))",
    },
}

export function RevenueGrowthChart() {
    return (
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="quarter"
                        tickFormatter={(value) => value.replace('_2', '')}
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                     <YAxis
                        hide={true}
                        domain={[0, 500]}
                    />
                    <Area type="monotone" dataKey="growth" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorGrowth)" />
                </AreaChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}
