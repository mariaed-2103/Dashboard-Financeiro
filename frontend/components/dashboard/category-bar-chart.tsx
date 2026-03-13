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

// Tooltip customizado que exibe o nome COMPLETO da categoria
function CustomTooltip({
                           active,
                           payload,
                           label,
                       }: {
    active?: boolean
    payload?: Array<{ name: string; value: number; fill: string }>
    label?: string
}) {
    if (!active || !payload?.length) return null
    return (
        <div
            style={{
                backgroundColor: "#1a2a38",
                border: "1px solid #2d4052",
                borderRadius: "8px",
                color: "#e8edf2",
                padding: "10px 14px",
                maxWidth: 220,
            }}
        >
            {/* label é o nome completo (sem truncar), vindo do dataKey original */}
            <p style={{ color: "#e8edf2", fontWeight: 600, marginBottom: 6, wordBreak: "break-word" }}>
                {label}
            </p>
            {payload.map((entry) => (
                <p key={entry.name} style={{ color: entry.fill, marginBottom: 2 }}>
                    {entry.name}: {formatCurrency(entry.value)}
                </p>
            ))}
        </div>
    )
}

export function CategoryBarChart({ data, userCategories }: Props) {
    const chartData = data
        .filter((item) => item.income > 0 || item.expense > 0)
        .map((item) => ({
            // `name` é o nome COMPLETO — usado no tooltip
            name: resolveCategoryName(item, userCategories),
            // `shortName` é o truncado — usado apenas no eixo X visual
            shortName: (() => {
                const n = resolveCategoryName(item, userCategories)
                return n.length > 10 ? `${n.substring(0, 9)}…` : n
            })(),
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
                    {/*
                        Usamos `shortName` no XAxis (visual truncado) e `name` no tooltip (nome completo).
                        O trick: XAxis dataKey="shortName", mas as Bars usam dataKey="Receitas"/"Despesas"
                        e o Tooltip recebe `label` = o valor de XAxis, então mostramos `name` no tooltip
                        passando nameKey pelo tooltipPayload via nameKey workaround abaixo.
                    */}
                    <BarChart
                        data={chartData}
                        barGap={4}
                        barCategoryGap="20%"
                        // Passa o nome completo para o tooltip via prop label usando o campo `name`
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#2d4052"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="shortName"
                            tick={{ fill: "#8a9bb0", fontSize: 11 }}
                            axisLine={{ stroke: "#2d4052" }}
                            tickLine={false}
                            angle={-20}
                            textAnchor="end"
                            height={55}
                            // Não precisamos mais de tickFormatter — já truncamos no shortName
                        />
                        <YAxis
                            tick={{ fill: "#8a9bb0", fontSize: 11 }}
                            axisLine={{ stroke: "#2d4052" }}
                            tickLine={false}
                            tickFormatter={(v) =>
                                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                            }
                        />
                        {/*
                            Para mostrar nome completo no tooltip, usamos um CustomTooltip
                            que recebe `label` (= shortName do XAxis) — isso ainda seria truncado.
                            Solução: passamos `name` diretamente pelos dados via um Bar "fantasma"
                            escondido, OU mais simples: renderizamos nosso tooltip customizado
                            com acesso ao índice + chartData completo.
                        */}
                        <Tooltip
                            cursor={false}
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null
                                // Busca o nome completo pelo shortName (label)
                                const fullName =
                                    chartData.find((d) => d.shortName === label)?.name ?? label
                                return (
                                    <div
                                        style={{
                                            backgroundColor: "#1a2a38",
                                            border: "1px solid #2d4052",
                                            borderRadius: "8px",
                                            color: "#e8edf2",
                                            padding: "10px 14px",
                                            maxWidth: 240,
                                        }}
                                    >
                                        <p
                                            style={{
                                                color: "#e8edf2",
                                                fontWeight: 600,
                                                marginBottom: 6,
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {fullName}
                                        </p>
                                        {payload.map((entry: { name: string; value: number; fill: string }) => (
                                            <p key={entry.name} style={{ color: entry.fill, marginBottom: 2 }}>
                                                {entry.name}: {formatCurrency(entry.value as number)}
                                            </p>
                                        ))}
                                    </div>
                                )
                            }}
                        />
                        <Legend content={<CustomLegend />} />
                        <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}