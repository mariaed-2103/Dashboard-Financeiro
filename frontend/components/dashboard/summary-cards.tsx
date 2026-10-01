import type { TransactionSummary } from "@/types/transaction"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"

interface Props {
    summary: TransactionSummary | null
    isLoading: boolean
    error?: string | null
    isBlurred?: boolean
}

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function SummaryCards({ summary, isLoading, error, isBlurred }: Props) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { from: "#fe5000", to: "#c026d3" },
                    { from: "#c026d3", to: "#9333ea" },
                    { from: "#9333ea", to: "#fe5000" },
                ].map((g, i) => (
                    <div
                        key={i}
                        className="relative rounded-2xl overflow-hidden animate-pulse"
                        style={{ background: "#0f0f1a", border: "1px solid rgba(147,51,234,0.1)" }}
                    >
                        <div
                            className="absolute top-0 left-0 right-0 h-[3px]"
                            style={{ background: `linear-gradient(90deg, ${g.from}, ${g.to})` }}
                        />
                        <div className="p-6 flex flex-col gap-3">
                            <div className="h-3 rounded-full w-20" style={{ background: "rgba(147,51,234,0.1)" }} />
                            <div className="h-9 rounded-lg w-36" style={{ background: "rgba(147,51,234,0.07)" }} />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) return <p className="text-destructive">{error}</p>
    if (!summary) return null

    const cards = [
        {
            title: "Receitas",
            value: summary.totalIncome,
            icon: TrendingUp,
            valueColor: "#22d3a0",
            glowColor: "rgba(34,211,160,0.25)",
            lineGradient: "linear-gradient(90deg, #22d3a0, #059669)",
            iconBg: "linear-gradient(135deg, rgba(34,211,160,0.2), rgba(5,150,105,0.1))",
            iconBorder: "rgba(34,211,160,0.25)",
            label: "↑ Entradas",
            labelColor: "#22d3a0",
        },
        {
            title: "Despesas",
            value: summary.totalExpense,
            icon: TrendingDown,
            valueColor: "#f87171",
            glowColor: "rgba(248,113,113,0.2)",
            lineGradient: "linear-gradient(90deg, #ef4444, #dc2626)",
            iconBg: "linear-gradient(135deg, rgba(248,113,113,0.2), rgba(220,38,38,0.1))",
            iconBorder: "rgba(248,113,113,0.25)",
            label: "↓ Saídas",
            labelColor: "#f87171",
        },
        {
            title: "Saldo",
            value: summary.balance,
            icon: Wallet,
            valueColor: summary.balance >= 0 ? "#c084fc" : "#f87171",
            glowColor: summary.balance >= 0 ? "rgba(192,132,252,0.25)" : "rgba(248,113,113,0.2)",
            lineGradient: summary.balance >= 0
                ? "linear-gradient(90deg, #fe5000, #c026d3, #9333ea)"
                : "linear-gradient(90deg, #ef4444, #dc2626)",
            iconBg: summary.balance >= 0
                ? "linear-gradient(135deg, rgba(254,80,0,0.2), rgba(147,51,234,0.15))"
                : "linear-gradient(135deg, rgba(248,113,113,0.2), rgba(220,38,38,0.1))",
            iconBorder: summary.balance >= 0 ? "rgba(192,132,252,0.3)" : "rgba(248,113,113,0.25)",
            label: summary.balance >= 0 ? "✦ Positivo" : "✦ Negativo",
            labelColor: summary.balance >= 0 ? "#c084fc" : "#f87171",
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map((card, idx) => (
                <div
                    key={card.title}
                    className="relative rounded-2xl overflow-hidden group cursor-default"
                    style={{
                        background: "#0f0f1a",
                        border: "1px solid rgba(147,51,234,0.1)",
                        boxShadow: "0 8px 32px rgba(8,8,15,0.7)",
                        transition: "all 0.3s ease",
                    }}
                    onMouseEnter={e => {
                        const el = e.currentTarget as HTMLDivElement
                        el.style.border = `1px solid ${card.iconBorder}`
                        el.style.boxShadow = `0 8px 40px rgba(8,8,15,0.9), 0 0 30px ${card.glowColor}`
                        el.style.transform = "translateY(-2px)"
                    }}
                    onMouseLeave={e => {
                        const el = e.currentTarget as HTMLDivElement
                        el.style.border = "1px solid rgba(147,51,234,0.1)"
                        el.style.boxShadow = "0 8px 32px rgba(8,8,15,0.7)"
                        el.style.transform = "translateY(0)"
                    }}
                >
                    {/* Linha de cor no topo */}
                    <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: card.lineGradient }} />

                    {/* Brilho no canto superior direito */}
                    <div
                        className="absolute -top-12 -right-12 size-32 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                        style={{
                            background: `radial-gradient(circle at center, ${card.valueColor}, transparent 70%)`,
                            filter: "blur(20px)",
                        }}
                    />

                    <div className="p-6">
                        {/* Linha superior: label + ícone */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                                    {card.title}
                                </span>
                                <span className="text-[11px] font-semibold" style={{ color: card.labelColor }}>
                                    {card.label}
                                </span>
                            </div>

                            {/* Ícone circular */}
                            <div
                                className="size-10 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                                style={{
                                    background: card.iconBg,
                                    border: `1px solid ${card.iconBorder}`,
                                    boxShadow: `0 0 16px ${card.glowColor}`,
                                }}
                            >
                                <card.icon className="size-5" style={{ color: card.valueColor }} />
                            </div>
                        </div>

                        {/* Valor principal */}
                        <div
                            className={`text-2xl sm:text-3xl font-black tracking-tight transition-all duration-300 ${isBlurred ? "blur-sm select-none" : ""}`}
                            style={{
                                color: card.valueColor,
                                textShadow: `0 0 30px ${card.glowColor}`,
                            }}
                        >
                            {formatCurrency(card.value)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
