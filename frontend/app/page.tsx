"use client";

import { useCallback, useEffect, useState } from "react";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { TransactionForm } from "@/components/dashboard/transaction-form";
import {
    getTransactions,
    getTransactionSummary,
    createTransaction,
} from "@/services/transactions";

import type {
  Transaction,
  TransactionSummary,
  TransactionFormData,
  ApiError,
} from "@/types/transaction";
import { Toaster, toast } from "sonner";
import { Wallet } from "lucide-react";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null
  );
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    setTransactionsError(null);
    try {
        const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      const apiError = error as ApiError;
      setTransactionsError(apiError.message);
      console.error("[v0] Error fetching transactions:", apiError);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    setSummaryError(null);
    try {
        const data = await getTransactionSummary();
      setSummary(data);
    } catch (error) {
      const apiError = error as ApiError;
      setSummaryError(apiError.message);
      console.error("[v0] Error fetching summary:", apiError);
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [fetchTransactions, fetchSummary]);

  const handleCreateTransaction = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
        await createTransaction(data);
      toast.success("Transação criada com sucesso!");
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Erro ao criar transação");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--card-foreground)",
            border: "1px solid var(--border)",
          },
        }}
      />

      <header className="border-b border-border/50 bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Dashboard Financeiro
              </h1>
              <p className="text-sm text-muted-foreground">
                Gerencie suas finanças com facilidade
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <SummaryCards
            summary={summary}
            isLoading={isLoadingSummary}
            error={summaryError}
          />

          <TransactionForm
            onSubmit={handleCreateTransaction}
            isSubmitting={isSubmitting}
          />

          <TransactionList
            transactions={transactions}
            isLoading={isLoadingTransactions}
            error={transactionsError}
          />
        </div>
      </main>

      <footer className="border-t border-border/50 bg-card mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Dashboard Financeiro - Gerencie suas finanças com facilidade
          </p>
        </div>
      </footer>
    </div>
  );
}
