import type { CategorySummary, UserCategory } from "@/types/transaction"
import { CATEGORY_LABELS, type Category } from "@/types/transaction"

// Resolve qualquer string bruta do banco (ex: "EDUCACAO", "SALARIO") para o nome correto com acento
function resolveGlobalName(raw: string): string | null {
    const key = raw.trim().toUpperCase() as Category
    return CATEGORY_LABELS[key] ?? null
}

export function resolveCategoryName(item: CategorySummary, userCategories?: UserCategory[]): string {
    // 1. Se já tem categoryName definido, tenta resolver como global primeiro
    if (item.categoryName) {
        const resolved = resolveGlobalName(item.categoryName)
        return resolved ?? item.categoryName
    }

    const raw = (item.category ?? "").trim()

    // 2. Tenta resolver como categoria global (ALIMENTACAO → Alimentação, etc.)
    const globalLabel = resolveGlobalName(raw)
    if (globalLabel) return globalLabel

    // 3. Verifica se é um ID de categoria custom e busca o nome
    if (userCategories?.length) {
        const found = userCategories.find((cat) => cat.id === raw)
        if (found) return found.name
    }

    // 4. Se for UUID, não tem categoria
    const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i
    if (uuidRegex.test(raw)) return "Sem categoria"

    // 5. Último recurso: capitaliza a primeira letra
    if (!raw) return "Sem categoria"
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}

export function getCategoryNameById(categoryId: string, userCategories?: UserCategory[]): string {
    const raw = (categoryId ?? "").trim()

    // 1. Tenta resolver como global
    const globalLabel = resolveGlobalName(raw)
    if (globalLabel) return globalLabel

    // 2. Busca em categorias customizadas
    if (userCategories?.length) {
        const found = userCategories.find((cat) => cat.id === raw)
        if (found) return found.name
    }

    // 3. UUID sem categoria
    const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i
    if (uuidRegex.test(raw)) return "Sem categoria"

    if (!raw) return "Sem categoria"
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}