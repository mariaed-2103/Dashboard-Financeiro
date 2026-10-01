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
    getTransactions, getTransactionSummary, getTransactionsByCategory,
    getCategorySummary, createTransaction, updateTransaction, deleteTransaction,
    getTransactionsByPeriod, getTransactionSummaryByPeriod, getCategorySummaryByPeriod,
} from "@/services/transactions";
import { getCategories } from "@/services/categories";

import type {
    Transaction, TransactionSummary, TransactionFormData,
    Category, CategorySummary as CategorySummaryType, UserCategory, ApiError,
} from "@/types/transaction";
import { CATEGORY_LABELS } from "@/types/transaction";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

import { Toaster, toast } from "sonner";
import { getToken, removeToken } from "@/services/auth";
import { getUserProfile } from "@/services/api";
import { LogOut, User, CalendarIcon, Settings2, Eye, EyeOff, Target, Menu, X } from "lucide-react";
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Bom dia";
        if (hour >= 12 && hour < 18) return "Boa tarde";
        return "Boa noite";
    };

    const loadUserProfile = useCallback(async () => {
        try { const profile = await getUserProfile(); setUserName(profile.name); } catch { }
    }, []);

    useEffect(() => {
        if (!getToken()) { router.replace("/login"); } else { setIsCheckingAuth(false); }
    }, [router]);

    const loadCategories = useCallback(async () => {
        try {
            const data = await getCategories();
            setGlobalCategories(data.global);
            setCustomCategories(data.custom);
        } catch { }
    }, []);

    function buildPeriodDates(type: "7" | "15" | "30") {
        const end = new Date(); const start = new Date();
        start.setDate(end.getDate() - Number(type));
        return { start: start.toISOString(), end: end.toISOString() };
    }

    const handleQuickAddTransaction = async (data: { amount: number; description: string; suggestedCategory: string | null }) => {
        try {
            const category = globalCategories.find(c => c.name.toLowerCase() === data.suggestedCategory?.toLowerCase());
            const categoryId = category?.id || globalCategories[0]?.id;
            const incomeKeywords = ["salario", "recebi", "venda", "pix", "rendimento", "bonus"];
            const isIncome = data.suggestedCategory === "Salario" || data.suggestedCategory === "Investimentos" ||
                incomeKeywords.some(keyword => data.description.toLowerCase().includes(keyword));
            const transactionData: TransactionFormData = {
                description: data.description, amount: data.amount,
                type: isIncome ? "INCOME" : "EXPENSE", categoryId: categoryId,
                date: format(new Date(), "yyyy-MM-dd"),
            };
            await handleSaveTransaction(transactionData);
            if (isIncome) toast.success(`Receita de ${data.description} adicionada! 💰`);
        } catch { toast.error("Erro na entrada rápida."); }
    };

    const loadDashboardData = useCallback(async () => {
        setIsLoading(true); setError(null);
        try {
            let tx: Transaction[] = []; let sum: TransactionSummary | null = null; let catSum: CategorySummaryType[] = [];
            const calculateSummary = (transactions: Transaction[]) => {
                const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((acc, t) => acc + t.amount, 0);
                const totalExpense = transactions.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + t.amount, 0);
                return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
            };
            const buildCategorySummary = (categoryIdOrName: string, transactions: Transaction[]): CategorySummaryType[] => {
                const { totalIncome, totalExpense } = calculateSummary(transactions);
                const isGlobal = categoryIdOrName in CATEGORY_LABELS;
                return [isGlobal
                    ? { type: "global", category: categoryIdOrName as Category, income: totalIncome, expense: totalExpense }
                    : { type: "custom", category: categoryIdOrName, income: totalIncome, expense: totalExpense }];
            };
            if (periodFilter) {
                let start: string; let end: string;
                if (periodFilter === "custom") {
                    if (!startDate || !endDate) return;
                    start = new Date(`${startDate}T00:00:00`).toISOString();
                    end = new Date(`${endDate}T23:59:59`).toISOString();
                } else { const dates = buildPeriodDates(periodFilter); start = dates.start; end = dates.end; }
                if (!selectedCategory) {
                    [tx, sum, catSum] = await Promise.all([getTransactionsByPeriod(start, end), getTransactionSummaryByPeriod(start, end), getCategorySummaryByPeriod(start, end)]);
                } else {
                    tx = await getTransactionsByPeriod(start, end);
                    const filtered = tx.filter(t => t.categoryId === selectedCategory);
                    sum = calculateSummary(filtered); catSum = buildCategorySummary(selectedCategory, filtered);
                }
            } else {
                const now = new Date(); const year = now.getFullYear(); const month = now.getMonth() + 1;
                if (!selectedCategory) {
                    [tx, sum, catSum] = await Promise.all([getTransactions(), getTransactionSummary(), getCategorySummary(year, month)]);
                } else { tx = await getTransactionsByCategory(selectedCategory); sum = calculateSummary(tx); catSum = buildCategorySummary(selectedCategory, tx); }
            }
            setTransactions(tx); setSummary(sum); setCategorySummary(catSum);
        } catch (err) {
            const apiError = err as ApiError;
            if ((apiError as any)?.status === 401) { removeToken(); router.replace("/login"); return; }
            setError(apiError.message || "Erro ao carregar dados");
            toast.error(apiError.message || "Não foi possível carregar os dados do dashboard");
        } finally { setIsLoading(false); }
    }, [selectedCategory, periodFilter, startDate, endDate, router]);

    useEffect(() => { if (periodFilter !== "custom") { setStartDate(null); setEndDate(null); } }, [periodFilter]);

    useEffect(() => {
        if (!isCheckingAuth) { loadDashboardData(); loadCategories(); loadUserProfile(); }
    }, [isCheckingAuth, loadDashboardData, loadCategories, loadUserProfile]);

    const handleSaveTransaction = async (data: TransactionFormData, id?: string) => {
        setIsSubmitting(true);
        try {
            if (id) { await updateTransaction(id, data); toast.success("Transação atualizada com sucesso!"); }
            else { await createTransaction(data); toast.success("Transação criada com sucesso!"); }
            setEditingTransaction(null); loadDashboardData();
        } catch (err) { const apiError = err as ApiError; toast.error(apiError.message || "Erro ao salvar transação"); }
        finally { setIsSubmitting(false); }
    };

    const undoTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    const undoCancelledRef = useRef<Set<string>>(new Set());

    const handleDeleteTransaction = async (id: string) => {
        const deletedTransaction = transactions.find(t => t.id === id);
        if (!deletedTransaction) return;
        setTransactions(prev => prev.filter(t => t.id !== id));
        const existingTimer = undoTimersRef.current.get(id);
        if (existingTimer) { clearTimeout(existingTimer); undoTimersRef.current.delete(id); }
        undoCancelledRef.current.delete(id);
        toast("Transação excluída", {
            description: deletedTransaction.description, duration: 6000,
            action: {
                label: "Desfazer",
                onClick: () => {
                    undoCancelledRef.current.add(id);
                    const timer = undoTimersRef.current.get(id);
                    if (timer) { clearTimeout(timer); undoTimersRef.current.delete(id); }
                    setTransactions(prev => [...prev, deletedTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                    toast.success("Transação restaurada!");
                },
            },
            onDismiss: () => {
                if (!undoCancelledRef.current.has(id)) performDelete(id);
                undoCancelledRef.current.delete(id); undoTimersRef.current.delete(id);
            },
        });
        const timer = setTimeout(() => {
            if (!undoCancelledRef.current.has(id)) performDelete(id);
            undoCancelledRef.current.delete(id); undoTimersRef.current.delete(id);
        }, 6000);
        undoTimersRef.current.set(id, timer);
    };

    const performDelete = async (id: string) => {
        try { await deleteTransaction(id); loadDashboardData(); }
        catch (err) { const apiError = err as ApiError; toast.error(apiError.message || "Erro ao excluir transação"); loadDashboardData(); }
    };

    const handleLogout = () => { removeToken(); router.push("/login"); };

    if (isCheckingAuth) return null;

    const allCategoriesMap = new Map<string, string>();
    for (const cat of globalCategories) {
        const resolved = CATEGORY_LABELS[cat.name.toUpperCase() as Category] || cat.name;
        allCategoriesMap.set(cat.id, resolved);
    }
    for (const cat of customCategories) { allCategoriesMap.set(cat.id, cat.name); }

    const getCategoryName = (categoryIdOrName: string) => {
        if (!categoryIdOrName) return "Sem categoria";
        const byId = allCategoriesMap.get(categoryIdOrName);
        if (byId) { const asLabel = CATEGORY_LABELS[byId.toUpperCase() as Category]; return asLabel || byId; }
        const customByName = customCategories.find(c => c.name === categoryIdOrName);
        if (customByName) return customByName.name;
        const upperName = categoryIdOrName.toUpperCase() as Category;
        if (CATEGORY_LABELS[upperName]) return CATEGORY_LABELS[upperName];
        return categoryIdOrName;
    };

    const allUserCategories: UserCategory[] = [...globalCategories, ...customCategories];

    const selectContentStyle = "bg-[#0f0f1a]/95 backdrop-blur-xl border-[rgba(147,51,234,0.2)] rounded-xl shadow-[0_16px_48px_rgba(8,8,15,0.9)]";
    const selectItemStyle = "hover:bg-[rgba(147,51,234,0.1)] focus:bg-[rgba(147,51,234,0.1)] rounded-lg text-foreground/80 focus:text-foreground cursor-pointer";
    const selectTriggerStyle = "border-[rgba(147,51,234,0.2)] bg-[#0f0f1a]/70 backdrop-blur-sm hover:border-[rgba(147,51,234,0.4)] rounded-xl text-sm";
    const popoverContentStyle = "bg-[#0f0f1a]/95 backdrop-blur-xl border-[rgba(147,51,234,0.2)] rounded-2xl shadow-[0_16px_48px_rgba(8,8,15,0.9)]";

    const navItems = (closeMenu?: () => void, isMobile = false) => (
        <>
            {!isMobile && (
                <Button variant="ghost" onClick={() => { setIsBlurred(prev => !prev); closeMenu?.(); }}
                    className="cursor-pointer gap-2 text-muted-foreground hover:text-purple-300 hover:bg-purple-500/8 justify-start"
                    title={isBlurred ? "Mostrar valores" : "Ocultar valores"}>
                    {isBlurred ? <EyeOff className="size-4 shrink-0" /> : <Eye className="size-4 shrink-0" />}
                    <span>{isBlurred ? "Mostrar" : "Ocultar"}</span>
                </Button>
            )}
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" className="cursor-pointer gap-2 text-muted-foreground hover:text-purple-300 hover:bg-purple-500/8 justify-start" onClick={() => closeMenu?.()}>
                        <Settings2 className="size-4 shrink-0" /> Categorias
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto p-0 gap-0 bg-[#0f0f1a]/95 backdrop-blur-xl border-[rgba(147,51,234,0.2)] rounded-2xl">
                    <CategoryManager customCategories={customCategories} onCategoryChange={() => { loadCategories(); loadDashboardData(); }} />
                </DialogContent>
            </Dialog>
            <Button variant="ghost" asChild className="cursor-pointer gap-2 text-muted-foreground hover:text-purple-300 hover:bg-purple-500/8 justify-start">
                <Link href="/goals" onClick={() => closeMenu?.()}><Target className="size-4 shrink-0" /> Metas</Link>
            </Button>
            <Button variant="ghost" onClick={() => { router.push("/profile"); closeMenu?.(); }}
                className="cursor-pointer gap-2 text-muted-foreground hover:text-purple-300 hover:bg-purple-500/8 justify-start">
                <User className="size-4 shrink-0" /> Perfil
            </Button>
            <Button variant="ghost" onClick={() => { handleLogout(); closeMenu?.(); }}
                className="cursor-pointer gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start">
                <LogOut className="size-4 shrink-0" /> Sair
            </Button>
        </>
    );

    return (
        <div className="min-h-svh bg-background flex flex-col">
            <Toaster position="top-right" theme="dark" />

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <header className="relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40"
                style={{
                    background: "rgba(8,8,15,0.85)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    borderBottom: "1px solid rgba(147,51,234,0.12)",
                }}
            >
                {/* Linha gradiente brand no fundo */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px]"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(254,80,0,0.3), rgba(192,38,211,0.4), rgba(147,51,234,0.3), transparent)" }} />

                {/* Logo */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="relative w-9 h-9 shrink-0" style={{ filter: "drop-shadow(0 0 10px rgba(147,51,234,0.8))" }}>
                        <Image src="/logo.png" alt="Logo Clarus" fill className="object-contain" priority />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-gradient text-base sm:text-lg font-black leading-tight tracking-tight">Clarus</h1>
                        <p className="text-[11px] text-muted-foreground/50 hidden sm:block">{"Dados claros, decisões melhores"}</p>
                    </div>
                </div>

                {/* Nav desktop */}
                <div className="hidden md:flex items-center gap-1">{navItems()}</div>

                {/* Nav mobile */}
                <div className="flex md:hidden items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setIsBlurred(prev => !prev)}
                        className="cursor-pointer text-muted-foreground hover:text-purple-300 hover:bg-purple-500/8">
                        {isBlurred ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="cursor-pointer text-muted-foreground hover:text-purple-300 hover:bg-purple-500/8" aria-label="Abrir menu">
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-64 p-0 border-l border-[rgba(147,51,234,0.15)]"
                            style={{ background: "rgba(8,8,15,0.97)", backdropFilter: "blur(24px)" }}>
                            <div className="flex items-center px-4 py-4 border-b border-[rgba(147,51,234,0.12)]">
                                <span className="font-bold text-foreground">Menu</span>
                            </div>
                            <nav className="flex flex-col gap-1 p-3">{navItems(() => setMobileMenuOpen(false), true)}</nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            {/* ── Main ─────────────────────────────────────────────────────────── */}
            <main className="flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col gap-5 sm:gap-7">

                <QuickAdd onAdd={handleQuickAddTransaction} />

                {/* Saudação */}
                {userName && (
                    <div className="flex flex-col gap-1.5">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                            <span className="text-foreground">{getGreeting()}, </span>
                            <span className="text-gradient">{userName}!</span>
                        </h2>
                        <p className="text-sm text-muted-foreground/50">
                            Veja o resumo das suas finanças
                        </p>
                    </div>
                )}

                {/* Filtros */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                    <Select value={selectedCategory} onValueChange={v => setSelectedCategory(v as Category)}>
                        <SelectTrigger className={cn("w-full sm:w-[260px]", selectTriggerStyle)}>
                            <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent className={selectContentStyle}>
                            {globalCategories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id} className={selectItemStyle}>
                                    {CATEGORY_LABELS[cat.name.toUpperCase() as Category] || cat.name}
                                </SelectItem>
                            ))}
                            {customCategories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id} className={selectItemStyle}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedCategory && (
                        <Button variant="outline" onClick={() => setSelectedCategory("")} className="cursor-pointer w-full sm:w-auto">
                            Limpar filtro
                        </Button>
                    )}

                    <Select value={periodFilter} onValueChange={v => setPeriodFilter(v as "7" | "15" | "30" | "custom")}>
                        <SelectTrigger className={cn("w-full sm:w-[220px]", selectTriggerStyle)}>
                            <SelectValue placeholder="Filtrar por período" />
                        </SelectTrigger>
                        <SelectContent className={selectContentStyle}>
                            <SelectItem value="7" className={selectItemStyle}>Últimos 7 dias</SelectItem>
                            <SelectItem value="15" className={selectItemStyle}>Últimos 15 dias</SelectItem>
                            <SelectItem value="30" className={selectItemStyle}>Últimos 30 dias</SelectItem>
                            <SelectItem value="custom" className={selectItemStyle}>Personalizado</SelectItem>
                        </SelectContent>
                    </Select>

                    {periodFilter === "custom" && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("cursor-pointer w-full sm:w-[160px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                        {startDate ? format(new Date(startDate + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR }) : "Data inicial"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className={cn("cursor-pointer w-auto p-0 rounded-2xl shadow-lg", popoverContentStyle)} align="start">
                                    <Calendar mode="single" selected={startDate ? new Date(startDate + "T12:00:00") : undefined}
                                        onSelect={day => setStartDate(day ? format(day, "yyyy-MM-dd") : null)}
                                        locale={ptBR} disabled={{ after: endDate ? new Date(endDate + "T12:00:00") : new Date() }} className="p-3"
                                        classNames={{ month_caption: "flex items-center justify-center h-8 font-bold text-sm text-foreground capitalize", weekday: "text-muted-foreground text-xs font-medium w-9", today: "bg-purple-500/20 text-purple-300 rounded-lg font-bold" }} />
                                </PopoverContent>
                            </Popover>
                            <span className="text-muted-foreground text-sm text-center">a</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("cursor-pointer w-full sm:w-[160px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                        {endDate ? format(new Date(endDate + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR }) : "Data final"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className={cn("cursor-pointer w-auto p-0 rounded-2xl shadow-lg", popoverContentStyle)} align="start">
                                    <Calendar mode="single" selected={endDate ? new Date(endDate + "T12:00:00") : undefined}
                                        onSelect={day => setEndDate(day ? format(day, "yyyy-MM-dd") : null)}
                                        locale={ptBR} disabled={{ before: startDate ? new Date(startDate + "T12:00:00") : undefined, after: new Date() }} className="p-3"
                                        classNames={{ month_caption: "flex items-center justify-center h-8 font-bold text-sm text-foreground capitalize", weekday: "text-muted-foreground text-xs font-medium w-9", today: "bg-purple-500/20 text-purple-300 rounded-lg font-bold" }} />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {periodFilter && (
                        <Button variant="outline" onClick={() => { setPeriodFilter(""); setStartDate(null); setEndDate(null); }} className="cursor-pointer w-full sm:w-auto">
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

                <TransactionForm onSubmit={handleSaveTransaction} isSubmitting={isSubmitting} initialData={editingTransaction} globalCategories={globalCategories} customCategories={customCategories} />

                <TransactionList transactions={transactions} isLoading={isLoading} error={error} onEdit={t => setEditingTransaction(t)} onDelete={handleDeleteTransaction} getCategoryName={getCategoryName} isBlurred={isBlurred} />
            </main>

            <footer className="relative mt-auto" style={{ background: "rgba(8,8,15,0.8)", borderTop: "1px solid rgba(147,51,234,0.1)" }}>
                <div className="absolute top-0 left-0 right-0 h-[1px]"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(254,80,0,0.2), rgba(147,51,234,0.3), transparent)" }} />
                <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground/40">
                    {"Clarus © 2026 — Dados claros, decisões melhores"}
                </div>
            </footer>
        </div>
    );
}