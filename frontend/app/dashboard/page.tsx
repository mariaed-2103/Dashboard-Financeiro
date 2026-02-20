"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { SummaryCards } from "@/components/dashboard/summary-cards"
import { TransactionList } from "@/components/dashboard/transaction-list"
import { TransactionForm } from "@/components/dashboard/transaction-form"
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart"
import { CategoryBarChart } from "@/components/dashboard/category-bar-chart"
import { CategorySummaryList } from "@/components/dashboard/category-summary"

import {
    getTransactions,
    getTransactionSummary,
    getTransactionsByCategory,
    getCategorySummary,
    createTransaction,
} from "@/services/transactions"

import Image from "next/image";

import type {
    Transaction,
    TransactionSummary,
    TransactionFormData,
    Category,
    CategorySummary,
    ApiError,
} from "@/types/transaction"

import { CATEGORY_LABELS } from "@/types/transaction"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Toaster, toast } from "sonner"
import { getToken, removeToken } from "@/services/auth"
import { BarChart3, LogOut } from "lucide-react"

const CATEGORIES: { value: Category; label: string }[] = (
    Object.entries(CATEGORY_LABELS) as [Category, string][]
).map(([value, label]) => ({ value, label }))

export default function DashboardPage() {
    const router = useRouter()

    const [isCheckingAuth, setIsCheckingAuth] = useState(true)

    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [summary, setSummary] = useState<TransactionSummary | null>(null)
    const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([])

    const [selectedCategory, setSelectedCategory] = useState<Category | "">("")

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!getToken()) {
            router.replace("/login")
        } else {
            setIsCheckingAuth(false)
        }
    }, [router])

    const loadDashboardData = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const now = new Date()
            const year = now.getFullYear()
            const month = now.getMonth() + 1

            if (!selectedCategory) {
                const [tx, sum, catSum] = await Promise.all([
                    getTransactions(),
                    getTransactionSummary(),
                    getCategorySummary(year, month),
                ])

                setTransactions(tx)
                setSummary(sum)
                setCategorySummary(catSum)
            } else {
                const tx = await getTransactionsByCategory(selectedCategory)
                setTransactions(tx)

                const totalIncome = tx
                    .filter((t: Transaction) => t.type === "INCOME")
                    .reduce((acc: number, t: Transaction) => acc + t.amount, 0)

                const totalExpense = tx
                    .filter((t: Transaction) => t.type === "EXPENSE")
                    .reduce((acc: number, t: Transaction) => acc + t.amount, 0)

                setSummary({
                    totalIncome,
                    totalExpense,
                    balance: totalIncome - totalExpense,
                })

                setCategorySummary([
                    {
                        category: selectedCategory,
                        income: totalIncome,
                        expense: totalExpense,
                    },
                ])
            }
        } catch (err) {
            const apiError = err as ApiError

            if ((apiError as any)?.status === 401) {
                removeToken()
                router.replace("/login")
                return
            }

            setError(apiError.message || "Erro ao carregar dados")
        } finally {
            setIsLoading(false)
        }
    }, [selectedCategory, router])

    useEffect(() => {
        if (!isCheckingAuth) {
            loadDashboardData()
        }
    }, [isCheckingAuth, loadDashboardData])

    const handleCreateTransaction = async (data: TransactionFormData) => {
        setIsSubmitting(true)
        try {
            await createTransaction(data)
            toast.success("Transação criada com sucesso!")
            loadDashboardData()
        } catch (err) {
            const apiError = err as ApiError
            toast.error(apiError.message || "Erro ao criar transação")
        } finally {
            setIsSubmitting(false)
        }
    }

    function handleLogout() {
        removeToken()
        router.push("/login")
    }

    if (isCheckingAuth) return null

    return (
        <div className="min-h-svh bg-background flex flex-col">
            <Toaster position="top-right" />

            {/* HEADER */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card">
                <div className="flex items-center gap-3">
                    {/* Container da Logo */}
                    <div className="relative size-9 flex items-center justify-center overflow-hidden">
                        <Image
                            src="/logo.png"
                            alt="Logo Clarus"
                            width={36}
                            height={36}
                            className="object-contain"
                        />
                    </div>

                    <div>
                        <h1 className="text-lg font-bold text-foreground">Clarus</h1>
                        <p className="text-xs text-muted-foreground">
                            Dados claros, decisões melhores
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                    <LogOut className="size-4" />
                    Sair
                </Button>
            </header>

            {/* MAIN */}
            <main className="flex-1 container mx-auto px-4 py-8 flex flex-col gap-6">
                {/* FILTRO */}
                <div className="flex items-center gap-4">
                    <Select
                        value={selectedCategory}
                        onValueChange={(value) => setSelectedCategory(value as Category)}
                    >
                        <SelectTrigger className="w-[260px]">
                            <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedCategory && (
                        <Button
                            variant="outline"
                            onClick={() => setSelectedCategory("")}
                            className="border-border/50 text-muted-foreground hover:text-foreground"
                        >
                            Limpar filtro
                        </Button>
                    )}
                </div>

                {/* SUMMARY CARDS */}
                <SummaryCards summary={summary} isLoading={isLoading} error={error} />

                {/* CHARTS SIDE BY SIDE: Pie left, Bar right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CategoryPieChart data={categorySummary} type="expense" />
                    <CategoryBarChart data={categorySummary} />
                </div>

                {/* RESUMO POR CATEGORIA */}
                <CategorySummaryList
                    data={categorySummary}
                    isLoading={isLoading}
                    error={error}
                />

                {/* FORM */}
                <TransactionForm
                    onSubmit={handleCreateTransaction}
                    isSubmitting={isSubmitting}
                />

                {/* TRANSACTION LIST */}
                <TransactionList
                    transactions={transactions}
                    isLoading={isLoading}
                    error={error}
                />
            </main>

            {/* FOOTER */}
            <footer className="border-t border-border/50 bg-card mt-auto">
                <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
                    {"Clarus \u00a9 2026 \u2014 Dados claros, decisões melhores"}
                </div>
            </footer>
        </div>
    )
}
