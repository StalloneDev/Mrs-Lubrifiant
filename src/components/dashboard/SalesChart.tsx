"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export function SalesChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center text-sm text-slate-500 italic">
                Aucune donnée de vente disponible pour cette période.
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value.toLocaleString()}`}
                />
                <Tooltip
                    cursor={{ fill: '#F1F5F9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`${Number(value).toLocaleString()} FCFA`, "Ventes"]}
                />
                <Bar
                    dataKey="total"
                    fill="#0B1F3A"
                    radius={[4, 4, 0, 0]}
                    activeBar={{ fill: '#C9A961' }}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
