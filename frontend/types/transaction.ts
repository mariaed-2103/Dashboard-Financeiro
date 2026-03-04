export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: TransactionType;
    categoryId: string; // pode ser global ou custom
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
    categoryId: string // pode ser global ou custom
    date: string;
}

export interface ApiError {
    message: string;
    statusCode: number;
}

// Categorias globais fixas
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

// Representa uma categoria custom criada pelo usuário
export interface UserCategory {
    id: string;
    userId: string;
    name: string;
    createdAt: string;
}

export type CategorySummary =
    | {
    type: "global"
    category: Category
    income: number
    expense: number
}
    | {
    type: "custom"
    category: string
    income: number
    expense: number
}

// Labels das categorias globais
export const CATEGORY_LABELS: Record<Category, string> = {
    ALIMENTACAO: "Alimentação",
    TRANSPORTE: "Transporte",
    MORADIA: "Moradia",
    SAUDE: "Saúde",
    EDUCACAO: "Educação",
    LAZER: "Lazer",
    SALARIO: "Salário",
    INVESTIMENTOS: "Investimentos",
    OUTROS: "Outros",
};