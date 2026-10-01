"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, Target, ArrowLeft, LogOut, User } from "lucide-react";
import { toast, Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { GoalCard, GoalCardSkeleton, CreateGoalModal, EditGoalModal, AddProgressModal, DeleteGoalDialog } from "@/components/goals";
import { getGoals, createGoal, updateGoal, deleteGoal, addProgress } from "@/services/goals";
import { getToken, removeToken } from "@/services/auth";
import type { Goal, CreateGoalRequest, AddProgressRequest } from "@/types/goal";

export default function GoalsPage() {
    const router = useRouter();

    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddProgressModalOpen, setIsAddProgressModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!getToken()) { router.replace("/login"); } else { setIsCheckingAuth(false); }
    }, [router]);

    const loadGoals = useCallback(async () => {
        setIsLoading(true); setError(null);
        try { const data = await getGoals(); setGoals(data); }
        catch (err) {
            const apiError = err as { status?: number; message?: string };
            if (apiError.status === 401) { removeToken(); router.replace("/login"); return; }
            setError(apiError.message || "Erro ao carregar metas");
            toast.error(apiError.message || "Não foi possível carregar as metas");
        } finally { setIsLoading(false); }
    }, [router]);

    useEffect(() => { if (!isCheckingAuth) loadGoals(); }, [isCheckingAuth, loadGoals]);

    const handleCreateGoal = async (data: CreateGoalRequest) => {
        setIsSubmitting(true);
        try { await createGoal(data); toast.success("Meta criada com sucesso!"); setIsCreateModalOpen(false); loadGoals(); }
        catch (err) { const apiError = err as { message?: string }; toast.error(apiError.message || "Erro ao criar meta"); }
        finally { setIsSubmitting(false); }
    };

    const handleEditGoal = async (id: string, data: CreateGoalRequest) => {
        setIsSubmitting(true);
        try { await updateGoal(id, data); toast.success("Meta atualizada com sucesso!"); setIsEditModalOpen(false); setSelectedGoal(null); loadGoals(); }
        catch (err) { const apiError = err as { message?: string }; toast.error(apiError.message || "Erro ao atualizar meta"); }
        finally { setIsSubmitting(false); }
    };

    const handleAddProgress = async (id: string, data: AddProgressRequest) => {
        setIsSubmitting(true);
        try { await addProgress(id, data); toast.success("Progresso adicionado com sucesso!"); setIsAddProgressModalOpen(false); setSelectedGoal(null); loadGoals(); }
        catch (err) { const apiError = err as { message?: string }; toast.error(apiError.message || "Erro ao adicionar progresso"); }
        finally { setIsSubmitting(false); }
    };

    const handleDeleteGoal = async (id: string) => {
        setIsDeleting(true);
        try { await deleteGoal(id); toast.success("Meta excluída com sucesso!"); setIsDeleteDialogOpen(false); setSelectedGoal(null); loadGoals(); }
        catch (err) { const apiError = err as { message?: string }; toast.error(apiError.message || "Erro ao excluir meta"); }
        finally { setIsDeleting(false); }
    };

    const openEditModal = (goal: Goal) => { setSelectedGoal(goal); setIsEditModalOpen(true); };
    const openAddProgressModal = (goal: Goal) => { setSelectedGoal(goal); setIsAddProgressModalOpen(true); };
    const openDeleteDialog = (goal: Goal) => { setSelectedGoal(goal); setIsDeleteDialogOpen(true); };
    const handleLogout = () => { removeToken(); router.push("/login"); };

    if (isCheckingAuth) return null;

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
                <div className="absolute bottom-0 left-0 right-0 h-[1px]"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(254,80,0,0.3), rgba(192,38,211,0.4), rgba(147,51,234,0.3), transparent)" }} />

                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="relative w-9 h-9 shrink-0" style={{ filter: "drop-shadow(0 0 10px rgba(147,51,234,0.8))" }}>
                        <Image src="/logo.png" alt="Logo Clarus" fill className="object-contain" priority />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-gradient text-base sm:text-lg font-black leading-tight tracking-tight">Clarus</h1>
                        <p className="text-[11px] text-muted-foreground/50 hidden sm:block">Dados claros, decisões melhores</p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-purple-300 hover:bg-purple-500/8 px-2 sm:px-3">
                        <Link href="/dashboard"><ArrowLeft className="size-4 shrink-0" /><span className="hidden sm:inline">Dashboard</span></Link>
                    </Button>
                    <Button variant="ghost" onClick={() => router.push("/profile")}
                        className="cursor-pointer gap-2 text-muted-foreground hover:text-purple-300 hover:bg-purple-500/8 px-2 sm:px-3">
                        <User className="size-4 shrink-0" /><span className="hidden sm:inline">Perfil</span>
                    </Button>
                    <Button variant="ghost" onClick={handleLogout}
                        className="cursor-pointer gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2 sm:px-3">
                        <LogOut className="size-4 shrink-0" /><span className="hidden sm:inline">Sair</span>
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col gap-6">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* Ícone com gradiente brand */}
                        <div
                            className="relative flex items-center justify-center size-14 rounded-2xl shrink-0 overflow-hidden"
                            style={{
                                background: "linear-gradient(135deg, rgba(254,80,0,0.2), rgba(192,38,211,0.2), rgba(147,51,234,0.15))",
                                border: "1px solid rgba(147,51,234,0.3)",
                                boxShadow: "0 0 30px rgba(147,51,234,0.2), 0 8px 24px rgba(8,8,15,0.6)",
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
                            <Target className="size-7 relative z-10" style={{ color: "#c084fc" }} />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                                <span className="text-gradient">Metas</span>
                                <span className="text-foreground"> Financeiras</span>
                            </h2>
                            <p className="text-sm text-muted-foreground/50 mt-0.5">
                                Acompanhe seu progresso e alcance seus objetivos
                            </p>
                        </div>
                    </div>

                    <Button onClick={() => setIsCreateModalOpen(true)} className="cursor-pointer gap-2 w-full sm:w-auto" size="lg">
                        <Plus className="size-4" />
                        Criar nova meta
                    </Button>
                </div>

                {/* Goals List */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => <GoalCardSkeleton key={i} />)}
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-destructive">{error}</p>
                    </div>
                ) : goals.length === 0 ? (
                    <Empty className="rounded-2xl overflow-hidden"
                        style={{ background: "#0f0f1a", border: "1px solid rgba(147,51,234,0.12)" } as React.CSSProperties}>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Target className="size-6" style={{ color: "#c084fc" }} />
                            </EmptyMedia>
                            <EmptyTitle className="text-foreground/80">Nenhuma meta cadastrada</EmptyTitle>
                            <EmptyDescription className="text-muted-foreground/50">
                                Crie sua primeira meta financeira para começar a acompanhar seu progresso.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button onClick={() => setIsCreateModalOpen(true)} className="cursor-pointer gap-2">
                                <Plus className="size-4" /> Criar primeira meta
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goals.map(goal => (
                            <GoalCard key={goal.id} goal={goal} onAddProgress={openAddProgressModal} onEdit={openEditModal} onDelete={openDeleteDialog} />
                        ))}
                    </div>
                )}
            </main>

            <footer className="relative mt-auto" style={{ background: "rgba(8,8,15,0.8)", borderTop: "1px solid rgba(147,51,234,0.1)" }}>
                <div className="absolute top-0 left-0 right-0 h-[1px]"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(254,80,0,0.2), rgba(147,51,234,0.3), transparent)" }} />
                <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground/40">
                    {"Clarus © 2026 — Dados claros, decisões melhores"}
                </div>
            </footer>

            <CreateGoalModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateGoal} isSubmitting={isSubmitting} />
            <EditGoalModal goal={selectedGoal} isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedGoal(null); }} onSubmit={handleEditGoal} isSubmitting={isSubmitting} />
            <AddProgressModal goal={selectedGoal} isOpen={isAddProgressModalOpen} onClose={() => { setIsAddProgressModalOpen(false); setSelectedGoal(null); }} onSubmit={handleAddProgress} isSubmitting={isSubmitting} />
            <DeleteGoalDialog goal={selectedGoal} isOpen={isDeleteDialogOpen} onClose={() => { setIsDeleteDialogOpen(false); setSelectedGoal(null); }} onConfirm={handleDeleteGoal} isDeleting={isDeleting} />
        </div>
    );
}