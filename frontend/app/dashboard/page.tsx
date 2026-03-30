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
import { QuickAdd } from "@/components/dashboard/quick-add";

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
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";

import { Toaster, toast } from "sonner";
import { getToken, removeToken } from "@/services/auth";
import { getUserProfile } from "@/services/api";
import {
    LogOut, User, CalendarIcon, Settings2, Eye, EyeOff, Target, Menu, X,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Image from "next/image";

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

    const [globalCategories, setGlobalCategories] = useState<UserCategory[]>([]);
    const [customCategories, setCustomCategories] = useState<UserCategory[]>([]);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isBlurred, setIsBlurred] = useState(false);
    const [userName, setUserName] = useState<string>("");

    // Controla o Sheet (menu hambúrguer) mobile
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Bom dia";
        if (hour >= 12 && hour < 18) return "Boa tarde";
        return "Boa noite";
    };

    const loadUserProfile = useCallback(async () => {
        try {
            const profile = await getUserProfile();
            setUserName(profile.name);
        } catch { /* silencioso */ }
    }, []);

    useEffect(() => {
        if (!getToken()) {
            router.replace("/login");
        } else {
            setIsCheckingAuth(false);
        }
    }, [router]);

    const loadCategories = useCallback(async () => {
        try {
            const data = await getCategories();
            setGlobalCategories(data.global);
            setCustomCategories(data.custom);
        } catch { /* silencioso */ }
    }, []);

    function buildPeriodDates(type: "7" | "15" | "30") {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - Number(type));
        return { start: start.toISOString(), end: end.toISOString() };
    }

    const handleQuickAddTransaction = async (data: { amount: number; description: string; suggestedCategory: string | null }) => {
        try {
            const category = globalCategories.find(c => c.name.toLowerCase() === data.suggestedCategory?.toLowerCase());
            const categoryId = category?.id || globalCategories[0]?.id;
            const incomeKeywords = ["salario", "recebi", "venda", "pix", "rendimento", "bonus"];
            const isIncome =
                data.suggestedCategory === "Salario" ||
                data.suggestedCategory === "Investimentos" ||
                incomeKeywords.some(keyword => data.description.toLowerCase().includes(keyword));

            const transactionData: TransactionFormData = {
                description: data.description,
                amount: data.amount,
                type: isIncome ? "INCOME" : "EXPENSE",
                categoryId: categoryId,
                date: format(new Date(), "yyyy-MM-dd"),
            };
            await handleSaveTransaction(transactionData);
            if (isIncome) toast.success(`Receita de ${data.description} adicionada! 💰`);
        } catch {
            toast.error("Erro na entrada rápida.");
        }
    };

    const loadDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            let tx: Transaction[] = [];
            let sum: TransactionSummary | null = null;
            let catSum: CategorySummaryType[] = [];

            const calculateSummary = (transactions: Transaction[]) => {
                const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((acc, t) => acc + t.amount, 0);
                const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((acc, t) => acc + t.amount, 0);
                return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
            };

            const buildCategorySummary = (categoryIdOrName: string, transactions: Transaction[]): CategorySummaryType[] => {
                const { totalIncome, totalExpense } = calculateSummary(transactions);
                const isGlobal = categoryIdOrName in CATEGORY_LABELS;
                return [
                    isGlobal
                        ? { type: "global", category: categoryIdOrName as Category, income: totalIncome, expense: totalExpense }
                        : { type: "custom", category: categoryIdOrName, income: totalIncome, expense: totalExpense },
                ];
            };

            if (periodFilter) {
                let start: string;
                let end: string;
                if (periodFilter === "custom") {
                    if (!startDate || !endDate) return;
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
                    const filtered = tx.filter((t) => t.categoryId === selectedCategory);
                    sum = calculateSummary(filtered);
                    catSum = buildCategorySummary(selectedCategory, filtered);
                }
            } else {
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
            toast.error(apiError.message || "Não foi possível carregar os dados do dashboard");
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

    const handleSaveTransaction = async (data: TransactionFormData, id?: string) => {
        setIsSubmitting(true);
        try {
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

    const undoTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    const undoCancelledRef = useRef<Set<string>>(new Set());

    const handleDeleteTransaction = async (id: string) => {
        const deletedTransaction = transactions.find((t) => t.id === id);
        if (!deletedTransaction) return;

        setTransactions((prev) => prev.filter((t) => t.id !== id));

        const existingTimer = undoTimersRef.current.get(id);
        if (existingTimer) {
            clearTimeout(existingTimer);
            undoTimersRef.current.delete(id);
        }
        undoCancelledRef.current.delete(id);

        toast("Transação excluída", {
            description: deletedTransaction.description,
            duration: 6000,
            action: {
                label: "Desfazer",
                onClick: () => {
                    undoCancelledRef.current.add(id);
                    const timer = undoTimersRef.current.get(id);
                    if (timer) {
                        clearTimeout(timer);
                        undoTimersRef.current.delete(id);
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
                if (!undoCancelledRef.current.has(id)) performDelete(id);
                undoCancelledRef.current.delete(id);
                undoTimersRef.current.delete(id);
            },
        });

        const timer = setTimeout(() => {
            if (!undoCancelledRef.current.has(id)) performDelete(id);
            undoCancelledRef.current.delete(id);
            undoTimersRef.current.delete(id);
        }, 6000);

        undoTimersRef.current.set(id, timer);
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

    const globalCategoryOptions = globalCategories.map((c) => ({
        value: c.id,
        label: CATEGORY_LABELS[c.name.toUpperCase() as Category] || c.name,
    }));

    const allCategoriesMap = new Map<string, string>();
    for (const cat of globalCategories) {
        const resolved = CATEGORY_LABELS[cat.name.toUpperCase() as Category] || cat.name;
        allCategoriesMap.set(cat.id, resolved);
    }
    for (const cat of customCategories) {
        allCategoriesMap.set(cat.id, cat.name);
    }

    const getCategoryName = (categoryIdOrName: string) => {
        if (!categoryIdOrName) return "Sem categoria";
        const byId = allCategoriesMap.get(categoryIdOrName);
        if (byId) {
            const asLabel = CATEGORY_LABELS[byId.toUpperCase() as Category];
            return asLabel || byId;
        }
        const customByName = customCategories.find(c => c.name === categoryIdOrName);
        if (customByName) return customByName.name;
        const upperName = categoryIdOrName.toUpperCase() as Category;
        if (CATEGORY_LABELS[upperName]) return CATEGORY_LABELS[upperName];
        return categoryIdOrName;
    };

    const allUserCategories: UserCategory[] = [...globalCategories, ...customCategories];

    // ─── Itens de navegação (reutilizados no header desktop e no Sheet mobile) ──
    const navItems = (closeMenu?: () => void) => (
        <>
            {/* Privacidade */}
            <Button
                variant="ghost"
                onClick={() => { setIsBlurred((prev) => !prev); closeMenu?.(); }}
                className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground hover:bg-muted justify-start"
                title={isBlurred ? "Mostrar valores" : "Ocultar valores"}
            >
                {isBlurred ? <EyeOff className="size-4 shrink-0" /> : <Eye className="size-4 shrink-0" />}
                <span className="md:sr-only">{isBlurred ? "Mostrar valores" : "Ocultar valores"}</span>
            </Button>

            {/* Categorias */}
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground hover:bg-muted justify-start"
                        onClick={() => closeMenu?.()}
                    >
                        <Settings2 className="size-4 shrink-0" />
                        Categorias
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto p-0 gap-0">
                    <CategoryManager
                        customCategories={customCategories}
                        onCategoryChange={() => {
                            loadCategories();
                            loadDashboardData();
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Metas */}
            <Button
                variant="ghost"
                asChild
                className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground hover:bg-muted justify-start"
            >
                <Link href="/goals" onClick={() => closeMenu?.()}>
                    <Target className="size-4 shrink-0" />
                    Metas
                </Link>
            </Button>

            {/* Perfil */}
            <Button
                variant="ghost"
                onClick={() => { router.push("/profile"); closeMenu?.(); }}
                className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground hover:bg-muted justify-start"
            >
                <User className="size-4 shrink-0" />
                Perfil
            </Button>

            {/* Sair */}
            <Button
                variant="ghost"
                onClick={() => { handleLogout(); closeMenu?.(); }}
                className="cursor-pointer gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start"
            >
                <LogOut className="size-4 shrink-0" />
                Sair
            </Button>
        </>
    );

    return (
        <div className="min-h-svh bg-background flex flex-col">
            <Toaster position="top-right" />

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50 bg-card">
                {/* Logo + nome */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0">
                        <Image src="/logo.png" alt="Logo Clarus" fill className="object-contain" priority />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight">Clarus</h1>
                        {/* Subtítulo some em telas muito pequenas para dar espaço aos botões */}
                        <p className="text-xs text-muted-foreground hidden sm:block">{"Dados claros, decisões melhores"}</p>
                    </div>
                </div>

                {/* Nav desktop (md+): mostra os botões em linha */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems()}
                </div>

                {/* Nav mobile (<md): botão hambúrguer + Sheet lateral */}
                <div className="flex md:hidden items-center gap-1">
                    {/* Botão de privacidade exposto diretamente no header mobile (ação frequente) */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsBlurred((prev) => !prev)}
                        className="cursor-pointer text-muted-foreground hover:text-foreground"
                        title={isBlurred ? "Mostrar valores" : "Ocultar valores"}
                    >
                        {isBlurred ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>

                    {/* Menu hambúrguer */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer text-muted-foreground hover:text-foreground"
                                aria-label="Abrir menu"
                            >
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-64 p-0 bg-card border-border/50">
                            {/* Cabeçalho do Sheet */}
                            <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
                                <span className="font-semibold text-foreground">Menu</span>
                                <SheetClose asChild>
                                    <Button variant="ghost" size="icon" className="cursor-pointer text-muted-foreground">
                                        <X className="size-4" />
                                    </Button>
                                </SheetClose>
                            </div>
                            {/* Links de navegação em coluna */}
                            <nav className="flex flex-col gap-1 p-3">
                                {navItems(() => setMobileMenuOpen(false))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            {/* ── Main ────────────────────────────────────────────────────────── */}
            <main className="flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col gap-5 sm:gap-6">

                <QuickAdd onAdd={handleQuickAddTransaction} />

                {userName && (
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                            {getGreeting()}, {userName}!
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Veja o resumo das suas finanças
                        </p>
                    </div>
                )}

                {/*
                  Filtros — Mobile-first:
                  - flex-col no mobile: cada select ocupa a largura toda
                  - sm:flex-row em telas maiores: volta ao layout em linha
                  - w-full nos selects mobile, larguras fixas em sm+
                */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                    {/* Filtro de categoria */}
                    <Select
                        value={selectedCategory}
                        onValueChange={(value) => setSelectedCategory(value as Category)}
                    >
                        <SelectTrigger className="w-full sm:w-[260px]">
                            <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent>
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
                            className="cursor-pointer border-border/50 text-muted-foreground hover:text-foreground w-full sm:w-auto"
                        >
                            Limpar filtro
                        </Button>
                    )}

                    {/* Filtro de período */}
                    <Select
                        value={periodFilter}
                        onValueChange={(value) => setPeriodFilter(value as "7" | "15" | "30" | "custom")}
                    >
                        <SelectTrigger className="w-full sm:w-[220px]">
                            <SelectValue placeholder="Filtrar por período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">{"Últimos 7 dias"}</SelectItem>
                            <SelectItem value="15">{"Últimos 15 dias"}</SelectItem>
                            <SelectItem value="30">{"Últimos 30 dias"}</SelectItem>
                            <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Datas customizadas — empilhadas no mobile */}
                    {periodFilter === "custom" && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer w-full sm:w-[160px] justify-start text-left font-normal border-border/50",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                        {startDate
                                            ? format(new Date(startDate + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })
                                            : "Data inicial"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="cursor-pointer w-auto p-0 border-border/50 bg-card rounded-xl shadow-lg" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate ? new Date(startDate + "T12:00:00") : undefined}
                                        onSelect={(day) => setStartDate(day ? format(day, "yyyy-MM-dd") : null)}
                                        locale={ptBR}
                                        disabled={{ after: endDate ? new Date(endDate + "T12:00:00") : new Date() }}
                                        className="p-3"
                                        classNames={{
                                            month_caption: "flex items-center justify-center h-8 font-semibold text-sm text-foreground capitalize",
                                            weekday: "text-muted-foreground text-xs font-medium w-9",
                                            today: "bg-accent text-accent-foreground rounded-lg font-semibold",
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>

                            <span className="text-muted-foreground text-sm text-center">a</span>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer w-full sm:w-[160px] justify-start text-left font-normal border-border/50",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                        {endDate
                                            ? format(new Date(endDate + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })
                                            : "Data final"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="cursor-pointer w-auto p-0 border-border/50 bg-card rounded-xl shadow-lg" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={endDate ? new Date(endDate + "T12:00:00") : undefined}
                                        onSelect={(day) => setEndDate(day ? format(day, "yyyy-MM-dd") : null)}
                                        locale={ptBR}
                                        disabled={{ before: startDate ? new Date(startDate + "T12:00:00") : undefined, after: new Date() }}
                                        className="p-3"
                                        classNames={{
                                            month_caption: "flex items-center justify-center h-8 font-semibold text-sm text-foreground capitalize",
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
                            onClick={() => { setPeriodFilter(""); setStartDate(null); setEndDate(null); }}
                            className="cursor-pointer border-border/50 text-muted-foreground hover:text-foreground w-full sm:w-auto"
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