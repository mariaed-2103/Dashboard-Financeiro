"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Loader2 } from "lucide-react";
import type { TransactionSummary } from "@/types/transaction";

interface SummaryCardsProps {
  summary: TransactionSummary | null;
  isLoading: boolean;
  error: string | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function SummaryCards({ summary, isLoading, error }: SummaryCardsProps) {
  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-destructive/50">
            <CardContent className="flex items-center justify-center py-6">
              <p className="text-sm text-destructive">Erro ao carregar dados</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isLoading || !summary) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Receitas",
      value: summary.totalIncome,
      icon: TrendingUp,
      iconColor: "text-income",
      bgColor: "bg-income/10",
    },
    {
      title: "Despesas",
      value: summary.totalExpense,
      icon: TrendingDown,
      iconColor: "text-expense",
      bgColor: "bg-expense/10",
    },
    {
      title: "Saldo",
      value: summary.balance,
      icon: Wallet,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                card.title === "Saldo"
                  ? card.value >= 0
                    ? "text-income"
                    : "text-expense"
                  : card.iconColor
              }`}
            >
              {formatCurrency(card.value)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
