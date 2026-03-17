import { getToken } from "./auth";
import type { Goal, CreateGoalRequest, AddProgressRequest } from "@/types/goal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw {
            status: response.status,
            message: error.message || "Erro na requisição",
        };
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json") || response.status === 204) {
        return null;
    }

    return response.json();
}

export async function getGoals(): Promise<Goal[]> {
    return fetchWithAuth("/api/goals");
}

export async function getGoalById(id: string): Promise<Goal> {
    return fetchWithAuth(`/api/goals/${id}`);
}

export async function createGoal(data: CreateGoalRequest): Promise<Goal> {
    return fetchWithAuth("/api/goals", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateGoal(
    id: string,
    data: CreateGoalRequest
): Promise<Goal> {
    return fetchWithAuth(`/api/goals/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteGoal(id: string): Promise<void> {
    return fetchWithAuth(`/api/goals/${id}`, {
        method: "DELETE",
    });
}

export async function addProgress(
    id: string,
    data: AddProgressRequest
): Promise<Goal> {
    return fetchWithAuth(`/api/goals/${id}/add-progress`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}
