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
    { label: "Receitas", color: "#22c55e" },
    { label: "Despesas", color: "#ef4444" },
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
                    <span className="text-xs text-muted-foreground">{item.label}</span>
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
            Receitas: item.income,
            Despesas: item.expense,
        }))

    if (chartData.length === 0) {
        return (
            <Card className="border-border/50 flex-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base text-foreground">
                        Receitas x Despesas por Categoria
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                        Nenhuma movimentação neste período.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border/50 flex-1">
            <CardHeader className="pb-2">
                <CardTitle className="text-base text-foreground">
                    Receitas x Despesas por Categoria
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barGap={4} barCategoryGap="20%">
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#2d4052"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: "#8a9bb0", fontSize: 11 }}
                            axisLine={{ stroke: "#2d4052" }}
                            tickLine={false}
                            angle={-25}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            tick={{ fill: "#8a9bb0", fontSize: 11 }}
                            axisLine={{ stroke: "#2d4052" }}
                            tickLine={false}
                            tickFormatter={(v) =>
                                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                            }
                        />
                        <Tooltip
                            cursor={false}
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                                backgroundColor: "#1a2a38",
                                border: "1px solid #2d4052",
                                borderRadius: "8px",
                                color: "#e8edf2",
                            }}
                            labelStyle={{ color: "#e8edf2" }}
                        />
                        <Legend content={<CustomLegend />} />
                        <Bar
                            dataKey="Receitas"
                            fill="#22c55e"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="Despesas"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
