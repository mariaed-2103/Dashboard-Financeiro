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
        let errorMessage = "Credenciais inválidas"; // fallback padrão
        try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            const text = await res.text();
            if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
    }

    return res.json();
}

export async function registerUser(data: RegisterRequest): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        let errorMessage = "Erro ao cadastrar";
        try {
            const errorData = await res.json();
            // Pega a mensagem do backend ou usa o padrão
            errorMessage = errorData.message || errorMessage;
        } catch {
            // Se não for JSON, tenta ler como texto
            const text = await res.text();
            if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
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
