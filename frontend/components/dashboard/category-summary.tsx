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
            <Card className="border-[rgba(147,51,234,0.12)] bg-[#0f0f1a] animate-pulse">
                <CardContent className="p-6">
                    <div className="h-4 bg-[rgba(147,51,234,0.1)] rounded w-40 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-4 bg-[rgba(147,51,234,0.07)] rounded w-full" />
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
            <Card className="border-[rgba(147,51,234,0.12)] bg-[#0f0f1a]">
                <CardHeader>
                    <CardTitle className="text-base text-foreground">
                        Resumo por Categoria
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground/60">
                        Nenhuma movimentação encontrada neste período.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-[rgba(147,51,234,0.12)] bg-[#0f0f1a] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#9333ea] to-transparent opacity-50" />
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
                            className="flex items-center justify-between py-2 border-b border-[rgba(147,51,234,0.1)] last:border-0 hover:bg-[rgba(147,51,234,0.02)] transition-colors px-2 -mx-2 rounded-lg"
                        >
                            <span className="text-sm font-medium text-foreground/90">
                                {resolveCategoryName(item, userCategories)}
                            </span>
                            <div className="flex items-center gap-4 text-sm">
                                {item.income > 0 && (
                                    <span className={`text-[#22d3a0] font-bold transition-all duration-300 ${isBlurred ? "blur-sm select-none" : ""}`}>
                                        {"+ "}
                                        {formatCurrency(item.income)}
                                    </span>
                                )}
                                {item.expense > 0 && (
                                    <span className={`text-[#f87171] font-bold transition-all duration-300 ${isBlurred ? "blur-sm select-none" : ""}`}>
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