import type { UserCategory } from "./transaction";

// Resposta do GET /categories
export interface CategoriesResponse {
    global: UserCategory[]
    custom: UserCategory[]
}

// Request do POST /categories
export interface CategoryRequest {
    name: string;
}
