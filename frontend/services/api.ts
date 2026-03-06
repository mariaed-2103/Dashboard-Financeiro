const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

import { getToken } from "./auth"

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

function getAuthHeadersWithoutContentType(): HeadersInit {
    const token = getToken()
    const headers: HeadersInit = {}
    if (token) {
        headers["Authorization"] = `Bearer ${token}`
    }
    return headers
}

export interface UserProfile {
    id: string
    name: string
    email: string
    profileImageUrl: string | null
}

export async function getUserProfile(): Promise<UserProfile> {
    const token = getToken()

    const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const error = new Error("Erro ao buscar perfil") as Error & { status?: number }
        error.status = res.status
        throw error
    }

    return res.json()
}

export async function updateUserName(name: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
    })

    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || "Erro ao atualizar nome")
    }
}

export async function updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/users/me/password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
    })

    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || "Erro ao atualizar senha")
    }
}

export async function uploadAvatar(file: File): Promise<void> {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch(`${API_BASE_URL}/users/me/avatar`, {
        method: "POST",
        headers: getAuthHeadersWithoutContentType(),
        body: formData,
    })

    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || "Erro ao atualizar foto")
    }
}
