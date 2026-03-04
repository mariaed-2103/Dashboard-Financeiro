import { getToken } from "./auth"
import type { CategoriesResponse} from "@/types/category"

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

export interface UserCategory {
    id: string
    userId: string
    name: string
    createdAt: string
}


// ✅ Listar categorias
export async function getCategories(): Promise<CategoriesResponse> {
    const res = await fetch(`${API_BASE_URL}/categories`, { headers: getAuthHeaders() })
    if (!res.ok) throw await parseError(res)
    return res.json()
}

// ✅ Criar categoria customizada
export async function createCategory(name: string): Promise<UserCategory> {
    const res = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
    })
    if (!res.ok) throw await parseError(res)
    return res.json()
}

// ✅ Deletar categoria customizada
export async function deleteCategory(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    })
    if (!res.ok) throw await parseError(res)
}

// ✅ Tratamento de erro genérico
async function parseError(res: Response) {
    const text = await res.text()
    const error = new Error(text || "Erro na requisição") as Error & { status: number }
    error.status = res.status
    return error
}