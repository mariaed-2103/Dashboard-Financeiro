const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    name: string
    email: string
    password: string
}

export interface AuthResponse {
    token: string
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || "Credenciais inv\u00e1lidas")
    }

    return res.json()
}

export async function registerUser(data: RegisterRequest): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || "Erro ao cadastrar")
    }
}

export function saveToken(token: string) {
    localStorage.setItem("token", token)
}

export function getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("token")
}

export function removeToken() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("token")
    }
}
