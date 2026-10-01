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
import type { CategorySummary, UserCategory } from "@/types/transaction"
import { resolveCategoryName } from "@/utils/category-utils"

interface Props {
    data: CategorySummary[]
    type: "expense" | "income"
    userCategories?: UserCategory[]
}

const EXPENSE_COLORS = [
    "#ef4444", // red-500
    "#fe5000", // brand orange
    "#c026d3", // brand pink
    "#9333ea", // brand purple
    "#f43f5e", // rose-500
    "#d946ef", // fuchsia-500
    "#fb923c", // orange-400
]

const INCOME_COLORS = [
    "#22d3a0", // success green
    "#10b981", // emerald-500
    "#14b8a6", // teal-500
    "#06b6d4", // cyan-500
    "#3b82f6", // blue-500
    "#6366f1", // indigo-500
    "#8b5cf6", // violet-500
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
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 max-h-20 overflow-y-auto">
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 min-w-0">
                    <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_8px_currentColor]"
                        style={{ backgroundColor: entry.color, color: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground/80 font-medium truncate max-w-[120px]" title={entry.value}>
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    )
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
    if (!active || !payload?.length) return null
    const { name, value } = payload[0]
    return (
        <div className="bg-[#0f0f1a]/95 backdrop-blur-xl border border-[rgba(147,51,234,0.2)] rounded-xl shadow-[0_16px_48px_rgba(8,8,15,0.9)] p-3">
            <p className="text-foreground font-bold mb-1">{name}</p>
            <p className="text-[#c4b5fd] font-semibold">{formatCurrency(value)}</p>
        </div>
    )
}

export function CategoryPieChart({ data, type, userCategories }: Props) {
    const colors = type === "expense" ? EXPENSE_COLORS : INCOME_COLORS
    const title = type === "expense" ? "Despesas por Categoria" : "Receitas por Categoria"

    const chartData = data
        .filter((item) => (type === "expense" ? item.expense > 0 : item.income > 0))
        .map((item) => ({
            name: resolveCategoryName(item, userCategories),
            value: type === "expense" ? item.expense : item.income,
        }))

    if (chartData.length === 0) {
        return (
            <Card className="border-[rgba(147,51,234,0.12)] bg-[#0f0f1a] flex-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base text-foreground">{title}</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground/60">
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
        <Card className="border-[rgba(147,51,234,0.12)] bg-[#0f0f1a] flex-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#9333ea] to-transparent opacity-30" />
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
                            cy="45%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                            stroke="none"
                        >
                            {chartData.map((_entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={colors[index % colors.length]}
                                    style={{ filter: `drop-shadow(0px 0px 8px ${colors[index % colors.length]}60)` }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            content={<CustomLegend payload={legendPayload} />}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}