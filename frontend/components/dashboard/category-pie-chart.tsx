"use client"

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CategorySummary } from "@/types/transaction"
import { resolveCategoryName } from "@/utils/category-utils"

interface Props {
    data: CategorySummary[]
    type: "expense" | "income"
}

const EXPENSE_COLORS = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#ec4899",
    "#a855f7",
    "#f43f5e",
    "#d946ef",
    "#fb923c",
    "#fbbf24",
]

const INCOME_COLORS = [
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#55D9C1",
    "#34d399",
    "#2dd4bf",
    "#67e8f9",
    "#a7f3d0",
]

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

interface LegendEntry {
    value: string
    color: string
}

function CustomLegend({ payload }: { payload?: LegendEntry[] }) {
    if (!payload) return null
    return (
        <div className="flex items-center justify-center gap-4 pt-2">
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5">
                    <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground">{entry.value}</span>
                </div>
            ))}
        </div>
    )
}

export function CategoryPieChart({ data, type }: Props) {
    const colors = type === "expense" ? EXPENSE_COLORS : INCOME_COLORS
    const title = type === "expense" ? "Despesas por Categoria" : "Receitas por Categoria"

    const chartData = data
        .filter((item) => (type === "expense" ? item.expense > 0 : item.income > 0))
        .map((item) => ({
            name: resolveCategoryName(item),
            value: type === "expense" ? item.expense : item.income,
        }))

    if (chartData.length === 0) {
        return (
            <Card className="border-border/50 flex-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base text-foreground">{title}</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                        {type === "expense"
                            ? "Nenhuma despesa neste período."
                            : "Nenhuma receita neste período."}
                    </p>
                </CardContent>
            </Card>
        )
    }

    const legendPayload = chartData.map((entry, index) => ({
        value: entry.name,
        color: colors[index % colors.length],
    }))

    return (
        <Card className="border-border/50 flex-1">
            <CardHeader className="pb-2">
                <CardTitle className="text-base text-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            paddingAngle={2}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                        >
                            {chartData.map((_entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={colors[index % colors.length]}
                                    stroke="transparent"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                                backgroundColor: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "10px",
                                color: "#1a2a38",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                padding: "10px 14px",
                                fontWeight: 500,
                            }}
                            itemStyle={{
                                color: "#334155",
                            }}
                            labelStyle={{
                                color: "#0f172a",
                                fontWeight: 600,
                                marginBottom: "4px",
                            }}
                        />
                        <Legend
                            content={<CustomLegend payload={legendPayload} />}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
