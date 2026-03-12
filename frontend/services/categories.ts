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

// ✅ No arquivo services/categories.ts

async function parseError(res: Response) {
    let errorMessage = "Erro na requisição";

    try {
        const data = await res.json();
        // Se o backend enviou um objeto com o campo "message", usamos ele
        errorMessage = data.message || errorMessage;
    } catch {
        // Se não for um JSON válido, tenta ler como texto puro
        const text = await res.text();
        if (text) errorMessage = text;
    }

    const error = new Error(errorMessage) as Error & { status: number };
    error.status = res.status;
    return error;
}

// ✅ Atualizar nome de categoria customizada
export async function updateCategory(id: string, name: string): Promise<UserCategory> {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
    })
    if (!res.ok) throw await parseError(res)
    return res.json()
}

