"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    CalendarClock,
    Target,
    Pencil,
    Trash2,
    Plus,
    PiggyBank,
    CreditCard,
    ShoppingCart,
    Banknote,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GoalProgressBar } from "./goal-progress-bar";

import type { Goal, GoalType, GoalStatus } from "@/types/goal";
import { GOAL_TYPE_LABELS, GOAL_STATUS_LABELS } from "@/types/goal";
import { cn } from "@/lib/utils";

interface GoalCardProps {
    goal: Goal;
    onAddProgress: (goal: Goal) => void;
    onEdit: (goal: Goal) => void;
    onDelete: (goal: Goal) => void;
}

const GOAL_TYPE_ICONS: Record<GoalType, React.ReactNode> = {
    SAVING: <PiggyBank className="size-5" />,
    PURCHASE: <ShoppingCart className="size-5" />,
    DEBT: <CreditCard className="size-5" />,
};

const GOAL_TYPE_COLORS: Record<GoalType, string> = {
    SAVING: "bg-[#22d3a0]/10 text-[#22d3a0] border-[#22d3a0]/20",
    PURCHASE: "bg-[#fe5000]/10 text-[#fe5000] border-[#fe5000]/20",
    DEBT: "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20",
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export function GoalCard({ goal, onAddProgress, onEdit, onDelete }: GoalCardProps) {
    const percentage =
        goal.targetAmount > 0
            ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
            : 0;

    const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0);
    const isCompleted = goal.status === "COMPLETED";
    const deadlineDate = new Date(goal.deadline + "T12:00:00");
    const isOverdue = !isCompleted && deadlineDate < new Date();

    return (
        <div className="relative rounded-2xl overflow-hidden group border border-[rgba(147,51,234,0.15)] bg-[#0f0f1a] transition-all hover:shadow-[0_8px_40px_rgba(8,8,15,0.9),0_0_20px_rgba(147,51,234,0.07)] hover:border-[rgba(147,51,234,0.25)] hover:-translate-y-0.5">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[rgba(254,80,0,0.8)] via-[rgba(192,38,211,0.8)] to-[rgba(147,51,234,0.8)]" />

            <div className="p-6 pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className={cn("flex items-center justify-center size-10 rounded-xl border", GOAL_TYPE_COLORS[goal.type])}>
                            {GOAL_TYPE_ICONS[goal.type]}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base font-bold text-foreground truncate">
                                {goal.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                {goal.description}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className={isCompleted ? "bg-[#22d3a0]/10 text-[#22d3a0] border-[#22d3a0]/20" : "bg-[rgba(147,51,234,0.1)] text-[#c4b5fd] border-[rgba(147,51,234,0.2)]"}
                    >
                        {GOAL_STATUS_LABELS[goal.status]}
                    </Badge>
                </div>
            </div>

            <div className="px-6 pb-6 space-y-4">
                {/* Valores */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground/80 font-medium tracking-wide">
                            <Banknote className="size-4 text-[#c4b5fd]" />
                            <span>Progresso</span>
                        </div>
                        <span className="text-sm font-bold text-foreground">
                            <span className="text-[#c084fc]">{formatCurrency(goal.currentAmount)}</span> / {formatCurrency(goal.targetAmount)}
                        </span>
                    </div>

                    <GoalProgressBar
                        currentAmount={goal.currentAmount}
                        targetAmount={goal.targetAmount}
                    />

                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
                        <span className="text-muted-foreground/60">
                            {percentage.toFixed(1)}% concluído
                        </span>
                        {!isCompleted && (
                            <span className="text-[#fe5000]/80">
                                Faltam {formatCurrency(remainingAmount)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Informações adicionais */}
                <div className="flex items-center gap-4 pt-4 border-t border-[rgba(147,51,234,0.1)]">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground/80">
                        <Target className="size-4 text-[#c084fc]" />
                        <span>{GOAL_TYPE_LABELS[goal.type]}</span>
                    </div>
                    <div className={cn("flex items-center gap-1.5 text-sm font-medium", isOverdue ? "text-[#ef4444]" : "text-muted-foreground/80")}>
                        <CalendarClock className={cn("size-4", isOverdue ? "text-[#ef4444]" : "text-[#fe5000]")} />
                        <span>
                            {format(deadlineDate, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                    </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 pt-2">
                    {!isCompleted && (
                        <Button
                            size="sm"
                            onClick={() => onAddProgress(goal)}
                            className="flex-1 gap-1.5 bg-gradient-to-r from-[#fe5000] to-[#c026d3] hover:opacity-90 shadow-[0_0_15px_rgba(254,80,0,0.3)] hover:shadow-[0_0_20px_rgba(254,80,0,0.5)] border-none text-white rounded-xl"
                        >
                            <Plus className="size-4" />
                            Adicionar
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(goal)}
                        disabled={isCompleted}
                        className="rounded-xl border-[rgba(147,51,234,0.3)] text-[#c4b5fd] hover:bg-[rgba(147,51,234,0.1)] hover:text-white transition-colors"
                    >
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(goal)}
                        disabled={isCompleted}
                        className="rounded-xl border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-colors"
                    >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Excluir</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
