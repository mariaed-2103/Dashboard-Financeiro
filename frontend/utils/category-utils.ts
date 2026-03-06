import type { CategorySummary, UserCategory } from "@/types/transaction"
import { CATEGORY_LABELS, type Category } from "@/types/transaction"

export function resolveCategoryName(item: CategorySummary, userCategories?: UserCategory[]): string {
    // 1. Se já tem categoryName definido, usa ele
    if (item.categoryName) {
        return item.categoryName;
    }

    // 2. Tenta mapear como categoria global
    const categoryKey = (item.category || "").toUpperCase() as Category;
    const globalLabel = CATEGORY_LABELS[categoryKey];

    if (globalLabel) return globalLabel;

    // 3. Verifica se é um ID de categoria custom e busca o nome
    if (userCategories && userCategories.length > 0) {
        const customCategory = userCategories.find(cat => cat.id === item.category);
        if (customCategory) {
            return customCategory.name.charAt(0).toUpperCase() + customCategory.name.slice(1).toLowerCase();
        }
    }

    // 4. Fallback - verifica se o valor é um UUID (categoria não encontrada)
    const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    if (uuidRegex.test(item.category || "")) {
        return "Sem categoria";
    }

    // 5. Se não é UUID, formata o nome da categoria
    const name = item.category || "Sem categoria";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// Função auxiliar para resolver nome de categoria por ID
export function getCategoryNameById(categoryId: string, userCategories?: UserCategory[]): string {
    // 1. Tenta mapear como categoria global
    const categoryKey = categoryId.toUpperCase() as Category;
    const globalLabel = CATEGORY_LABELS[categoryKey];

    if (globalLabel) return globalLabel;

    // 2. Busca em categorias customizadas
    if (userCategories && userCategories.length > 0) {
        const customCategory = userCategories.find(cat => cat.id === categoryId);
        if (customCategory) {
            return customCategory.name.charAt(0).toUpperCase() + customCategory.name.slice(1).toLowerCase();
        }
    }

    // 3. Fallback
    const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    if (uuidRegex.test(categoryId)) {
        return "Sem categoria";
    }

    return categoryId.charAt(0).toUpperCase() + categoryId.slice(1).toLowerCase();
}
