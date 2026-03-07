"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { TransactionForm } from "@/components/dashboard/transaction-form";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { CategoryBarChart } from "@/components/dashboard/category-bar-chart";
import { CategorySummaryList } from "@/components/dashboard/category-summary";
import { CategoryManager } from "@/components/dashboard/category-manager";

import {
    getTransactions,
    getTransactionSummary,
    getTransactionsByCategory,
    getCategorySummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByPeriod,
    getTransactionSummaryByPeriod,
    getCategorySummaryByPeriod,
} from "@/services/transactions";

import { getCategories } from "@/services/categories";

import type {
    Transaction,
    TransactionSummary,
    TransactionFormData,
    Category,
    CategorySummary as CategorySummaryType,
    UserCategory,
    ApiError,
} from "@/types/transaction";

import { CATEGORY_LABELS } from "@/types/transaction";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Toaster, toast } from "sonner";
import { getToken, removeToken } from "@/services/auth";
import { getUserProfile } from "@/services/api";
import { LogOut, User, CalendarIcon, Settings2, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

import Image from "next/image"

const CATEGORIES: { value: Category; label: string }[] = (
    Object.entries(CATEGORY_LABELS) as [Category, string][]
).map(([value, label]) => ({ value, label }));

export default function DashboardPage() {
    const router = useRouter();

    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<TransactionSummary | null>(null);
    const [categorySummary, setCategorySummary] = useState<CategorySummaryType[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | "">("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [periodFilter, setPeriodFilter] = useState<"7" | "15" | "30" | "custom" | "">("");
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

    // --- Categorias (globais + customizadas) ---
    const [globalCategories, setGlobalCategories] = useState<UserCategory[]>([]);
    const [customCategories, setCustomCategories] = useState<UserCategory[]>([]);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

    // --- Privacidade: ocultar valores monetários ---
    const [isBlurred, setIsBlurred] = useState(false);

    // --- Perfil do usuário para saudação ---
    const [userName, setUserName] = useState<string>("");

    // Função para determinar a saudação baseada no horário
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return "Bom dia";
        } else if (hour >= 12 && hour < 18) {
            return "Boa tarde";
        } else {
            return "Boa noite";
        }
    };

    // Carregar perfil do usuário
    const loadUserProfile = useCallback(async () => {
        try {
            const profile = await getUserProfile();
            setUserName(profile.name);
        } catch (err) {
            // Silencioso — o nome é opcional para exibição
        }
    }, []);

    useEffect(() => {
        if (!getToken()) {
            router.replace("/login");
        } else {
            setIsCheckingAuth(false);
        }
    }, [router]);

    // Carregar categorias (globais + customizadas)
    const loadCategories = useCallback(async () => {
        try {
            const data = await getCategories();
            setGlobalCategories(data.global);
            setCustomCategories(data.custom);
        } catch (err) {
            // Silencioso — categorias custom são opcionais
        }
    }, []);

    function buildPeriodDates(type: "7" | "15" | "30") {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - Number(type));
        return {
            start: start.toISOString(),
            end: end.toISOString(),
        };
    }

    const loadDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            let tx: Transaction[] = [];
            let sum: TransactionSummary | null = null;
            let catSum: CategorySummaryType[] = [];

            const calculateSummary = (transactions: Transaction[]) => {
                const totalIncome = transactions
                    .filter((t) => t.type === "INCOME")
                    .reduce((acc, t) => acc + t.amount, 0);

                const totalExpense = transactions
                    .filter((t) => t.type === "EXPENSE")
                    .reduce((acc, t) => acc + t.amount, 0);

                return {
                    totalIncome,
                    totalExpense,
                    balance: totalIncome - totalExpense,
                };
            };

            const buildCategorySummary = (
                categoryIdOrName: string,
                transactions: Transaction[]
            ): CategorySummaryType[] => {
                const { totalIncome, totalExpense } = calculateSummary(transactions);

                const isGlobal = categoryIdOrName in CATEGORY_LABELS;

                return [
                    isGlobal
                        ? {
                            type: "global",
                            category: categoryIdOrName as Category,
                            income: totalIncome,
                            expense: totalExpense,
                        }
                        : {
                            type: "custom",
                            category: categoryIdOrName,
                            income: totalIncome,
                            expense: totalExpense,
                        },
                ];
            };

            // ========================
            // CASO COM FILTRO DE PERÍODO
            // ========================
            if (periodFilter) {
                let start: string;
                let end: string;

                if (periodFilter === "custom") {
                    if (!startDate || !endDate) {
                        return;
                    }

                    start = new Date(`${startDate}T00:00:00`).toISOString();
                    end = new Date(`${endDate}T23:59:59`).toISOString();
                } else {
                    const dates = buildPeriodDates(periodFilter);
                    start = dates.start;
                    end = dates.end;
                }

                if (!selectedCategory) {
                    [tx, sum, catSum] = await Promise.all([
                        getTransactionsByPeriod(start, end),
                        getTransactionSummaryByPeriod(start, end),
                        getCategorySummaryByPeriod(start, end),
                    ]);
                } else {
                    tx = await getTransactionsByPeriod(start, end);

                    const filtered = tx.filter(
                        (t) => t.categoryId === selectedCategory
                    );

                    sum = calculateSummary(filtered);
                    catSum = buildCategorySummary(selectedCategory, filtered);
                }
            }
                // ========================
                // CASO SEM FILTRO DE PERÍODO
            // ========================
            else {
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1;

                if (!selectedCategory) {
                    [tx, sum, catSum] = await Promise.all([
                        getTransactions(),
                        getTransactionSummary(),
                        getCategorySummary(year, month),
                    ]);
                } else {
                    tx = await getTransactionsByCategory(selectedCategory);

                    sum = calculateSummary(tx);
                    catSum = buildCategorySummary(selectedCategory, tx);
                }
            }

            setTransactions(tx);
            setSummary(sum);
            setCategorySummary(catSum);
        } catch (err) {
            const apiError = err as ApiError;

            if ((apiError as any)?.status === 401) {
                removeToken();
                router.replace("/login");
                return;
            }

            setError(apiError.message || "Erro ao carregar dados");
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory, periodFilter, startDate, endDate, router]);

    useEffect(() => {
        if (periodFilter !== "custom") {
            setStartDate(null);
            setEndDate(null);
        }
    }, [periodFilter]);

    useEffect(() => {
        if (!isCheckingAuth) {
            loadDashboardData();
            loadCategories();
            loadUserProfile();
        }
    }, [isCheckingAuth, loadDashboardData, loadCategories, loadUserProfile]);

    const handleCategoryChange = () => {
        loadCategories();
    };

    const handleSaveTransaction = async (data: TransactionFormData, id?: string) => {
        setIsSubmitting(true);
        try {
            // O segredo está aqui: o TransactionForm passa o id se for edição
            if (id) {
                await updateTransaction(id, data);
                toast.success("Transação atualizada com sucesso!");
            } else {
                await createTransaction(data);
                toast.success("Transação criada com sucesso!");
            }
            setEditingTransaction(null);
            loadDashboardData();
        } catch (err) {
            const apiError = err as ApiError;
            toast.error(apiError.message || "Erro ao salvar transação");
        } finally {
            setIsSubmitting(false);
        }
    };

    const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const undoCancelledRef = useRef(false);

    const handleDeleteTransaction = async (id: string) => {
        const deletedTransaction = transactions.find((t) => t.id === id);
        if (!deletedTransaction) return;

        setTransactions((prev) => prev.filter((t) => t.id !== id));

        if (undoTimerRef.current) {
            clearTimeout(undoTimerRef.current);
        }
        undoCancelledRef.current = false;

        toast("Transação excluída", {
            description: deletedTransaction.description,
            duration: 6000,
            action: {
                label: "Desfazer",
                onClick: () => {
                    undoCancelledRef.current = true;
                    if (undoTimerRef.current) {
                        clearTimeout(undoTimerRef.current);
                    }
                    setTransactions((prev) =>
                        [...prev, deletedTransaction].sort(
                            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                        )
                    );
                    toast.success("Transação restaurada!");
                },
            },
            onDismiss: () => {
                if (!undoCancelledRef.current) {
                    performDelete(id);
                }
            },
        });

        undoTimerRef.current = setTimeout(() => {
            if (!undoCancelledRef.current) {
                performDelete(id);
            }
        }, 6000);
    };

    const performDelete = async (id: string) => {
        try {
            await deleteTransaction(id);
            loadDashboardData();
        } catch (err) {
            const apiError = err as ApiError;
            toast.error(apiError.message || "Erro ao excluir transação");
            loadDashboardData();
        }
    };

    const handleLogout = () => {
        removeToken();
        router.push("/login");
    };

    if (isCheckingAuth) return null;

    // Todas as categorias para o Select de filtro (globais + custom)
    const allCategoryOptions = [
        ...CATEGORIES,
        ...customCategories.map((c) => ({ value: c.name as Category, label: c.name })),
    ];

    // Categorias globais da API para exibir no filtro com id
    const globalCategoryOptions = globalCategories.map((c) => ({
        value: c.id,
        label: CATEGORY_LABELS[c.name.toUpperCase() as Category] || c.name,
    }));

    // Mapa de todas as categorias: id -> nome resolvido (globais com acento + custom)
    const allCategoriesMap = new Map<string, string>();
    for (const cat of globalCategories) {
        const resolved = CATEGORY_LABELS[cat.name.toUpperCase() as Category] || cat.name;
        allCategoriesMap.set(cat.id, resolved);
    }
    for (const cat of customCategories) {
        allCategoriesMap.set(cat.id, cat.name);
    }

    const getCategoryName = (categoryIdOrName: string) => {
        // 1. Defesa: Se for nulo, vazio ou indefinido, retorna um fallback imediatamente
        if (!categoryIdOrName) return "Sem categoria";

        // Primeiro procura pelo ID no mapa completo (globais + custom)
        const byId = allCategoriesMap.get(categoryIdOrName);
        if (byId) {
            // Se o nome retornado bate com uma chave global, usa o label com acento
            const asLabel = CATEGORY_LABELS[byId.toUpperCase() as Category];
            return asLabel || byId;
        }

        // Fallback: procura pelo nome nas custom
        const customByName = customCategories.find(c => c.name === categoryIdOrName);
        if (customByName) return customByName.name;

        // Fallback: procura pelo enum nas globais (ex: "ALIMENTACAO")
        // Adicionamos o check aqui também para garantir
        const upperName = categoryIdOrName.toUpperCase() as Category;
        if (CATEGORY_LABELS[upperName]) {
            return CATEGORY_LABELS[upperName];
        }

        return categoryIdOrName;
    };

    // Combinar globalCategories e customCategories para passar aos componentes de gráfico
    const allUserCategories: UserCategory[] = [...globalCategories, ...customCategories];

    return (
        <div className="min-h-svh bg-background flex flex-col">
            <Toaster position="top-right" />
            <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card">
                <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9">
                        <Image
                            src="/logo.png"
                            alt="Logo Clarus"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    <div>
                        <h1 className="text-lg font-bold text-foreground">Clarus</h1>
                        <p className="text-xs text-muted-foreground">{"Dados claros, decisões melhores"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Botão de privacidade: ocultar valores */}
                    <Button
                        variant="ghost"
                        onClick={() => setIsBlurred((prev) => !prev)}
                        className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                        title={isBlurred ? "Mostrar valores" : "Ocultar valores"}
                    >
                        {isBlurred ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>

                    {/* Botão Gerenciar Categorias */}
                    <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                <Settings2 className="size-4" />
                                Categorias
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto p-0 gap-0">
                            <CategoryManager
                                customCategories={customCategories}
                                onCategoryChange={() => {
                                    loadCategories();
                                    loadDashboardData(); // atualiza lista de transações imediatamente
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    <Button
                        variant="ghost"
                        onClick={() => router.push("/profile")}
                        className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                        <User className="size-4" />
                        Perfil
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                        <LogOut className="size-4" />
                        Sair
                    </Button>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8 flex flex-col gap-6">
                {/* Saudação personalizada */}
                {userName && (
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-foreground">
                            {getGreeting()}, {userName}!
                        </h2>
                        <p className="text-muted-foreground">
                            Veja o resumo das suas finanças
                        </p>
                    </div>
                )}

                {/* Filtro */}
                <div className="flex flex-wrap items-center gap-4">
                    <Select
                        value={selectedCategory}
                        onValueChange={(value) => setSelectedCategory(value as Category)}
                    >
                        <SelectTrigger className="w-[260px]">
                            <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* Use apenas o que vem do banco (globalCategories + customCategories) */}
                            {globalCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {CATEGORY_LABELS[cat.name.toUpperCase() as Category] || cat.name}
                                </SelectItem>
                            ))}
                            {customCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedCategory && (
                        <Button
                            variant="outline"
                            onClick={() => setSelectedCategory("")}
                            className="cursor-pointer border-border/50 text-muted-foreground hover:text-foreground"
                        >
                            Limpar filtro
                        </Button>
                    )}
                    <Select
                        value={periodFilter}
                        onValueChange={(value) => setPeriodFilter(value as "7" | "15" | "30" | "custom")}
                    >
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Filtrar por período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">{"Últimos 7 dias"}</SelectItem>
                            <SelectItem value="15">{"Últimos 15 dias"}</SelectItem>
                            <SelectItem value="30">{"Últimos 30 dias"}</SelectItem>
                            <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                    </Select>
                    {periodFilter === "custom" && (
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer w-[160px] justify-start text-left font-normal border-border/50",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate
                                            ? format(new Date(startDate + "T12:00:00"), "dd/MM/yyyy", {
                                                locale: ptBR,
                                            })
                                            : "Data inicial"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0 border-border/50 bg-card rounded-xl shadow-lg"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={startDate ? new Date(startDate + "T12:00:00") : undefined}
                                        onSelect={(day) =>
                                            setStartDate(day ? format(day, "yyyy-MM-dd") : null)
                                        }
                                        locale={ptBR}
                                        disabled={{
                                            after: endDate ? new Date(endDate + "T12:00:00") : new Date(),
                                        }}
                                        className="p-3"
                                        classNames={{
                                            month_caption:
                                                "flex items-center justify-center h-8 font-semibold text-sm text-foreground capitalize",
                                            weekday: "text-muted-foreground text-xs font-medium w-9",
                                            today: "bg-accent text-accent-foreground rounded-lg font-semibold",
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <span className="text-muted-foreground text-sm">a</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer w-[160px] justify-start text-left font-normal border-border/50",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate
                                            ? format(new Date(endDate + "T12:00:00"), "dd/MM/yyyy", {
                                                locale: ptBR,
                                            })
                                            : "Data final"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0 border-border/50 bg-card rounded-xl shadow-lg"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={endDate ? new Date(endDate + "T12:00:00") : undefined}
                                        onSelect={(day) =>
                                            setEndDate(day ? format(day, "yyyy-MM-dd") : null)
                                        }
                                        locale={ptBR}
                                        disabled={{
                                            before: startDate
                                                ? new Date(startDate + "T12:00:00")
                                                : undefined,
                                            after: new Date(),
                                        }}
                                        className="p-3"
                                        classNames={{
                                            month_caption:
                                                "flex items-center justify-center h-8 font-semibold text-sm text-foreground capitalize",
                                            weekday: "text-muted-foreground text-xs font-medium w-9",
                                            today: "bg-accent text-accent-foreground rounded-lg font-semibold",
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                    {periodFilter && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setPeriodFilter("");
                                setStartDate(null);
                                setEndDate(null);
                            }}
                            className="cursor-pointer border-border/50 text-muted-foreground hover:text-foreground"
                        >
                            Limpar período
                        </Button>
                    )}
                </div>

                <SummaryCards summary={summary} isLoading={isLoading} error={error} isBlurred={isBlurred} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CategoryPieChart data={categorySummary} type="expense" userCategories={allUserCategories} />
                    <CategoryBarChart data={categorySummary} userCategories={allUserCategories} />
                </div>

                <CategorySummaryList data={categorySummary} isLoading={isLoading} error={error} userCategories={allUserCategories} isBlurred={isBlurred} />

                <TransactionForm
                    onSubmit={handleSaveTransaction}
                    isSubmitting={isSubmitting}
                    initialData={editingTransaction}
                    globalCategories={globalCategories}
                    customCategories={customCategories}
                />

                <TransactionList
                    transactions={transactions}
                    isLoading={isLoading}
                    error={error}
                    onEdit={(t) => setEditingTransaction(t)}
                    onDelete={handleDeleteTransaction}
                    getCategoryName={getCategoryName}
                    isBlurred={isBlurred}
                />
            </main>

            <footer className="border-t border-border/50 bg-card mt-auto">
                <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
                    {"Clarus © 2026 — Dados claros, decisões melhores"}
                </div>
            </footer>
        </div>
    );
}