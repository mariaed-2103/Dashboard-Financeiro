import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CategorySummary, UserCategory } from "@/types/transaction"
import { resolveCategoryName } from "@/utils/category-utils"

interface Props {
    data: CategorySummary[]
    isLoading: boolean
    error?: string | null
    userCategories?: UserCategory[]
    isBlurred?: boolean
}

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function CategorySummaryList({ data, isLoading, error, userCategories, isBlurred }: Props) {
    if (isLoading) {
        return (
            <Card className="border-border/50 animate-pulse">
                <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-40 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-4 bg-muted rounded w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return <p className="text-destructive">{error}</p>
    }

    const activeData = data.filter((item) => item.income > 0 || item.expense > 0)

    if (activeData.length === 0) {
        return (
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="text-base text-foreground">
                        Resumo por Categoria
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Nenhuma movimentação encontrada neste período.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border/50">
            <CardHeader>
                <CardTitle className="text-base text-foreground">
                    Resumo por Categoria
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {activeData.map((item, index) => (
                        <div
                            key={`${item.category}-${index}`}
                            className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                        >
              <span className="text-sm font-medium text-foreground">
                {resolveCategoryName(item, userCategories)}
              </span>
                            <div className="flex items-center gap-4 text-sm">
                                {item.income > 0 && (
                                    <span className={`text-emerald-400 transition-all duration-300 ${isBlurred ? "blur-sm select-none" : ""}`}>
                                        {"+ "}
                                        {formatCurrency(item.income)}
                                    </span>
                                )}
                                {item.expense > 0 && (
                                    <span className={`text-red-400 transition-all duration-300 ${isBlurred ? "blur-sm select-none" : ""}`}>
                                        {"- "}
                                        {formatCurrency(item.expense)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}