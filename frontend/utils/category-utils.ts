import type { CategorySummary } from "@/types/transaction"
import { CATEGORY_LABELS, type Category } from "@/types/transaction"

export function resolveCategoryName(item: CategorySummary): string {
    // 1. Força o mapeamento pelas chaves em caixa alta (onde estão os acentos no CATEGORY_LABELS)
    const categoryKey = (item.category || "").toUpperCase() as Category;
    const globalLabel = CATEGORY_LABELS[categoryKey];

    if (globalLabel) return globalLabel;

    // 2. Fallback para categorias customizadas
    const name = item.category || (item as any).categoryName || (item as any).name || "Sem categoria";

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(name)) return "Sem categoria";

    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}