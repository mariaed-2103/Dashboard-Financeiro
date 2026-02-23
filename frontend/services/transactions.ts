import type {
    Transaction,
    TransactionSummary,
    TransactionFormData,
    Category,
    CategorySummary,
} from "@/types/transaction"
import { getToken } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

function getAuthHeaders(): HeadersInit {
    const token = getToken()
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    }
    if (token) {
        headers["Authorization"] = `Bearer ${token}`
    }
    return headers
}

export async function getTransactions(): Promise<Transaction[]> {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
        headers: getAuthHeaders(),
    })
    if (!res.ok) throw await parseError(res)
    return res.json()
}

export async function getTransactionSummary(): Promise<TransactionSummary> {
    const res = await fetch(`${API_BASE_URL}/transactions/summary`, {
        headers: getAuthHeaders(),
    })
    if (!res.ok) throw await parseError(res)
    return res.json()
}

export async function getTransactionsByCategory(category: Category): Promise<Transaction[]> {
    const res = await fetch(
        `${API_BASE_URL}/transactions/by-category?category=${category}`,
        {
            headers: getAuthHeaders(),
        }
    )
    if (!res.ok) throw await parseError(res)
    return res.json()
}

export async function getCategorySummary(year: number, month: number): Promise<CategorySummary[]> {
    const res = await fetch(
        `${API_BASE_URL}/transactions/summary-by-category?year=${year}&month=${month}`,
        { headers: getAuthHeaders() }
    )
    if (!res.ok) throw await parseError(res)
    return res.json()
}

export async function createTransaction(data: TransactionFormData): Promise<Transaction> {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    })
    if (!res.ok) throw await parseError(res)
    return res.json()
}

export async function updateTransaction(id: string, data: TransactionFormData): Promise<Transaction> {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    })
    if (!res.ok) throw await parseError(res)
    return res.json()
}

export async function deleteTransaction(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    })
    if (!res.ok) throw await parseError(res)
}

async function parseError(res: Response) {
    const text = await res.text()
    const error = new Error(text || "Erro na requisi\u00e7\u00e3o") as Error & { status: number; statusCode: number }
    error.status = res.status
    error.statusCode = res.status
    return error
}
