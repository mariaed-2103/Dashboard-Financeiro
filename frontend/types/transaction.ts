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

export interface CategorySummary {
    category: Category;
    income: number;
    expense: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
    ALIMENTACAO: "Alimenta\u00e7\u00e3o",
    TRANSPORTE: "Transporte",
    MORADIA: "Moradia",
    SAUDE: "Sa\u00fade",
    EDUCACAO: "Educa\u00e7\u00e3o",
    LAZER: "Lazer",
    SALARIO: "Sal\u00e1rio",
    INVESTIMENTOS: "Investimentos",
    OUTROS: "Outros",
}

