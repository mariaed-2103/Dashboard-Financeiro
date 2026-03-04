import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TransactionSummary } from "@/types/transaction"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"

interface Props {
  summary: TransactionSummary | null
  isLoading: boolean
  error?: string | null
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function SummaryCards({ summary, isLoading, error }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50 animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-24 mb-3" />
              <div className="h-7 bg-muted rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-destructive">{error}</p>
  }

  if (!summary) return null

  const cards = [
    {
      title: "Receitas",
      value: summary.totalIncome,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      title: "Despesas",
      value: summary.totalExpense,
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
    {
      title: "Saldo",
      value: summary.balance,
      icon: Wallet,
      color: summary.balance >= 0 ? "text-accent" : "text-red-400",
      bg: summary.balance >= 0 ? "bg-accent/10" : "bg-red-400/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">
                  {card.title}
                </span>
                <span className={`text-2xl font-bold ${card.color}`}>
                  {formatCurrency(card.value)}
                </span>
              </div>
              <div
                className={`size-10 rounded-lg ${card.bg} flex items-center justify-center`}
              >
                <card.icon className={`size-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
