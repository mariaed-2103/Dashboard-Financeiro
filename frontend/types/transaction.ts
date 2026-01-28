export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: TransactionType;
    category: Category;
    date: string;
}

export interface TransactionSummary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

export interface TransactionFormData {
    description: string;
    amount: number;
    type: TransactionType;
    category: Category;
    date: string;
}

export interface MonthlyTransactionsParams {
    year: number;
    month: number;
}

export interface ApiError {
    message: string;
    statusCode: number;
}

export type Category =
    | "ALIMENTACAO"
    | "TRANSPORTE"
    | "MORADIA"
    | "SAUDE"
    | "EDUCACAO"
    | "LAZER"
    | "SALARIO"
    | "INVESTIMENTOS"
    | "OUTROS";

