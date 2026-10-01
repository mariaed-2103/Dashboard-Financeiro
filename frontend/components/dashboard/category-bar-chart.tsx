"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CategorySummary, UserCategory } from "@/types/transaction"
import { resolveCategoryName } from "@/utils/category-utils"

interface Props {
    data: CategorySummary[]
    userCategories?: UserCategory[]
}

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const LEGEND_ITEMS = [
    { label: "Receitas", color: "#22d3a0" },
    { label: "Despesas", color: "#f87171" },
]

function CustomLegend() {
    return (
        <div className="flex items-center justify-center gap-4 pt-2">
            {LEGEND_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                    <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground/80 font-medium uppercase tracking-wider">{item.label}</span>
                </div>
            ))}
        </div>
    )
}

export function CategoryBarChart({ data, userCategories }: Props) {
    const chartData = data
        .filter((item) => item.income > 0 || item.expense > 0)
        .map((item) => ({
            name: resolveCategoryName(item, userCategories),
            shortName: (() => {
                const n = resolveCategoryName(item, userCategories)
                return n.length > 10 ? `${n.substring(0, 9)}…` : n
            })(),
            Receitas: item.income,
            Despesas: item.expense,
        }))

    if (chartData.length === 0) {
        return (
            <Card className="border-[rgba(147,51,234,0.12)] bg-[#0f0f1a] flex-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base text-foreground">
                        Receitas x Despesas por Categoria
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground/60">
                        Nenhuma movimentação neste período.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-[rgba(147,51,234,0.12)] bg-[#0f0f1a] flex-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#fe5000] to-transparent opacity-30" />
            <CardHeader className="pb-2">
                <CardTitle className="text-base text-foreground">
                    Receitas x Despesas por Categoria
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        barGap={4}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(147,51,234,0.1)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="shortName"
                            tick={{ fill: "#6b6b8a", fontSize: 11, fontWeight: 600 }}
                            axisLine={{ stroke: "rgba(147,51,234,0.2)" }}
                            tickLine={false}
                            angle={-20}
                            textAnchor="end"
                            height={55}
                        />
                        <YAxis
                            tick={{ fill: "#6b6b8a", fontSize: 11, fontWeight: 600 }}
                            axisLine={{ stroke: "rgba(147,51,234,0.2)" }}
                            tickLine={false}
                            tickFormatter={(v) =>
                                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                            }
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(147,51,234,0.05)" }}
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null
                                const fullName = chartData.find((d) => d.shortName === label)?.name ?? label
                                return (
                                    <div className="bg-[#0f0f1a]/95 backdrop-blur-xl border border-[rgba(147,51,234,0.2)] rounded-xl shadow-[0_16px_48px_rgba(8,8,15,0.9)] p-3">
                                        <p className="text-foreground font-bold mb-2 break-words">
                                            {fullName}
                                        </p>
                                        {payload.map((entry: any) => (
                                            <p key={entry.name} style={{ color: entry.fill }} className="text-sm font-semibold mb-1">
                                                {entry.name}: {formatCurrency(entry.value as number)}
                                            </p>
                                        ))}
                                    </div>
                                )
                            }}
                        />
                        <Legend content={<CustomLegend />} />
                        <Bar dataKey="Receitas" fill="#22d3a0" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Despesas" fill="#f87171" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}