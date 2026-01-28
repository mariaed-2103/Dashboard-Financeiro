import { api } from "./api";
import {
    Transaction,
    TransactionFormData,
    TransactionSummary,
    MonthlyTransactionsParams,
} from "@/types/transaction";

export async function createTransaction(
    data: TransactionFormData
): Promise<Transaction> {
    const response = await api.post("/transactions", data);
    return response.data;
}

export async function getTransactions(): Promise<Transaction[]> {
    const response = await api.get("/transactions");
    return response.data;
}

export async function getTransactionSummary(): Promise<TransactionSummary> {
    const response = await api.get("/transactions/summary");
    return response.data;
}

export async function getTransactionsByMonth(
    params: MonthlyTransactionsParams
): Promise<Transaction[]> {
    const response = await api.get("/transactions/by-month", {
        params,
    });
    return response.data;
}
