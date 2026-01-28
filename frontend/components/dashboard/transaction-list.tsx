"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileText, TrendingUp, TrendingDown } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "dd MMM yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
}

export function TransactionList({
  transactions,
  isLoading,
  error,
}: TransactionListProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Transações Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && !error && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              Nenhuma transação encontrada
            </p>
            <p className="text-sm text-muted-foreground/70">
              Adicione sua primeira transação usando o formulário acima
            </p>
          </div>
        )}

        {!isLoading && !error && transactions.length > 0 && (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Data</TableHead>
                  <TableHead className="text-muted-foreground">
                    Descrição
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Categoria
                  </TableHead>
                  <TableHead className="text-muted-foreground">Tipo</TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    Valor
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="border-border/30 hover:bg-secondary/50"
                  >
                    <TableCell className="font-medium text-muted-foreground">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-normal bg-secondary text-secondary-foreground"
                      >
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.type === "INCOME" ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-income" />
                            <span className="text-income text-sm">Receita</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-4 w-4 text-expense" />
                            <span className="text-expense text-sm">
                              Despesa
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        transaction.type === "INCOME"
                          ? "text-income"
                          : "text-expense"
                      }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
