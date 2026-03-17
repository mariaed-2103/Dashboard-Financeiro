"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, Target, ArrowLeft, LogOut, User } from "lucide-react";
import { toast, Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
} from "@/components/ui/empty";
import {
    GoalCard,
    GoalCardSkeleton,
    CreateGoalModal,
    EditGoalModal,
    AddProgressModal,
    DeleteGoalDialog,
} from "@/components/goals";

import {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    addProgress,
} from "@/services/goals";
import { getToken, removeToken } from "@/services/auth";

import type { Goal, CreateGoalRequest, AddProgressRequest } from "@/types/goal";

export default function GoalsPage() {
    const router = useRouter();

    // Auth state
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Goals state
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddProgressModalOpen, setIsAddProgressModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Selected goal for modals
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

    // Submitting states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Check authentication
    useEffect(() => {
        if (!getToken()) {
            router.replace("/login");
        } else {
            setIsCheckingAuth(false);
        }
    }, [router]);

    // Load goals
    const loadGoals = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getGoals();
            setGoals(data);
        } catch (err) {
            const apiError = err as { status?: number; message?: string };
            if (apiError.status === 401) {
                removeToken();
                router.replace("/login");
                return;
            }
            setError(apiError.message || "Erro ao carregar metas");
            toast.error(apiError.message || "Não foi possível carregar as metas");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (!isCheckingAuth) {
            loadGoals();
        }
    }, [isCheckingAuth, loadGoals]);

    // Handlers
    const handleCreateGoal = async (data: CreateGoalRequest) => {
        setIsSubmitting(true);
        try {
            await createGoal(data);
            toast.success("Meta criada com sucesso!");
            setIsCreateModalOpen(false);
            loadGoals();
        } catch (err) {
            const apiError = err as { message?: string };
            toast.error(apiError.message || "Erro ao criar meta");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditGoal = async (id: string, data: CreateGoalRequest) => {
        setIsSubmitting(true);
        try {
            await updateGoal(id, data);
            toast.success("Meta atualizada com sucesso!");
            setIsEditModalOpen(false);
            setSelectedGoal(null);
            loadGoals();
        } catch (err) {
            const apiError = err as { message?: string };
            toast.error(apiError.message || "Erro ao atualizar meta");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddProgress = async (id: string, data: AddProgressRequest) => {
        setIsSubmitting(true);
        try {
            await addProgress(id, data);
            toast.success("Progresso adicionado com sucesso!");
            setIsAddProgressModalOpen(false);
            setSelectedGoal(null);
            loadGoals();
        } catch (err) {
            const apiError = err as { message?: string };
            toast.error(apiError.message || "Erro ao adicionar progresso");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteGoal = async (id: string) => {
        setIsDeleting(true);
        try {
            await deleteGoal(id);
            toast.success("Meta excluída com sucesso!");
            setIsDeleteDialogOpen(false);
            setSelectedGoal(null);
            loadGoals();
        } catch (err) {
            const apiError = err as { message?: string };
            toast.error(apiError.message || "Erro ao excluir meta");
        } finally {
            setIsDeleting(false);
        }
    };

    const openEditModal = (goal: Goal) => {
        setSelectedGoal(goal);
        setIsEditModalOpen(true);
    };

    const openAddProgressModal = (goal: Goal) => {
        setSelectedGoal(goal);
        setIsAddProgressModalOpen(true);
    };

    const openDeleteDialog = (goal: Goal) => {
        setSelectedGoal(goal);
        setIsDeleteDialogOpen(true);
    };

    const handleLogout = () => {
        removeToken();
        router.push("/login");
    };

    if (isCheckingAuth) return null;

    return (
        <div className="min-h-svh bg-background flex flex-col">
            <Toaster position="top-right" />

            {/* Header */}
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
                        <p className="text-xs text-muted-foreground">
                            {"Dados claros, decisões melhores"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        asChild
                        className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                        <Link href="/dashboard">
                            <ArrowLeft className="size-4" />
                            Dashboard
                        </Link>
                    </Button>
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

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 flex flex-col gap-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10">
                            <Target className="size-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">
                                Metas Financeiras
                            </h2>
                            <p className="text-muted-foreground">
                                Acompanhe seu progresso e alcance seus objetivos
                            </p>
                        </div>
                    </div>

                    <Button onClick={() => setIsCreateModalOpen(true)} className="cursor-pointer gap-2">
                        <Plus className="size-4" />
                        Criar nova meta
                    </Button>
                </div>

                {/* Goals List */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <GoalCardSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-destructive">{error}</p>
                    </div>
                ) : goals.length === 0 ? (
                    <Empty className="border border-border/50 bg-card/50">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Target className="size-6" />
                            </EmptyMedia>
                            <EmptyTitle>Nenhuma meta cadastrada</EmptyTitle>
                            <EmptyDescription>
                                Crie sua primeira meta financeira para começar a acompanhar seu
                                progresso.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="cursor-pointer gap-2"
                            >
                                <Plus className="size-4" />
                                Criar primeira meta
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onAddProgress={openAddProgressModal}
                                onEdit={openEditModal}
                                onDelete={openDeleteDialog}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-border/50 bg-card mt-auto">
                <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
                    {"Clarus © 2026 — Dados claros, decisões melhores"}
                </div>
            </footer>

            {/* Modals */}
            <CreateGoalModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateGoal}
                isSubmitting={isSubmitting}
            />

            <EditGoalModal
                goal={selectedGoal}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedGoal(null);
                }}
                onSubmit={handleEditGoal}
                isSubmitting={isSubmitting}
            />

            <AddProgressModal
                goal={selectedGoal}
                isOpen={isAddProgressModalOpen}
                onClose={() => {
                    setIsAddProgressModalOpen(false);
                    setSelectedGoal(null);
                }}
                onSubmit={handleAddProgress}
                isSubmitting={isSubmitting}
            />

            <DeleteGoalDialog
                goal={selectedGoal}
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedGoal(null);
                }}
                onConfirm={handleDeleteGoal}
                isDeleting={isDeleting}
            />
        </div>
    );
}
