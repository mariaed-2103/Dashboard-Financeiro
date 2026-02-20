import api from "./api";
import {
    Transaction,
    TransactionFormData,
    TransactionSummary,
    MonthlyTransactionsParams, Category,
} from "@/types/transaction";
import type { CategorySummary } from "@/types/transaction";

export async function getTransactionsByCategory(category: Category) {
    const res = await api.get(`/transactions/by-category?category=${category}`);
    return res.data;
}


export async function createTransaction(
    data: TransactionFormData
): Promise<Transaction> {
    const response = await api.post("/transactions", data);
    return response.data;
}

export async function getTransactions(): Promise<Transaction[]> {
    const res = await api.get("/transactions");
    return res.data;
}

export async function getTransactionSummary(): Promise<TransactionSummary> {
    const res = await api.get("/transactions/summary");
    return res.data;
}

export async function getTransactionsByMonth(
    params: MonthlyTransactionsParams
): Promise<Transaction[]> {
    const response = await api.get("/transactions/by-month", {
        params,
    });
    return response.data;
}

export async function getCategorySummary(year: number, month: number) {
    const res = await api.get(
        `/transactions/summary-by-category?year=${year}&month=${month}`
    );
    return res.data;
}

