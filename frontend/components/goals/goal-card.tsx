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
import {cn} from "@/lib/utils";

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
    SAVING: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    PURCHASE: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    DEBT: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export function GoalCard({
                             goal,
                             onAddProgress,
                             onEdit,
                             onDelete,
                         }: GoalCardProps) {
    const percentage =
        goal.targetAmount > 0
            ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
            : 0;

    const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0);
    const isCompleted = goal.status === "COMPLETED";
    const deadlineDate = new Date(goal.deadline + "T12:00:00");
    const isOverdue = !isCompleted && deadlineDate < new Date();

    return (
        <Card className="group relative overflow-hidden border-border/50 bg-card transition-all hover:shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                        <div
                            className={`flex items-center justify-center size-10 rounded-lg border ${GOAL_TYPE_COLORS[goal.type]}`}
                        >
                            {GOAL_TYPE_ICONS[goal.type]}
                        </div>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-semibold text-foreground truncate">
                                {goal.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                {goal.description}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className={
                            isCompleted
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-secondary text-secondary-foreground"
                        }
                    >
                        {GOAL_STATUS_LABELS[goal.status]}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Valores */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Banknote className="size-4" />
                            <span>Progresso</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
              {formatCurrency(goal.currentAmount)} /{" "}
                            {formatCurrency(goal.targetAmount)}
            </span>
                    </div>

                    <GoalProgressBar
                        currentAmount={goal.currentAmount}
                        targetAmount={goal.targetAmount}
                    />

                    <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {percentage.toFixed(1)}% concluído
            </span>
                        {!isCompleted && (
                            <span className="text-muted-foreground">
                Faltam {formatCurrency(remainingAmount)}
              </span>
                        )}
                    </div>
                </div>

                {/* Informações adicionais */}
                <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Target className="size-4" />
                        <span>{GOAL_TYPE_LABELS[goal.type]}</span>
                    </div>
                    <div
                        className={`flex items-center gap-1.5 text-sm ${
                            isOverdue ? "text-destructive" : "text-muted-foreground"
                        }`}
                    >
                        <CalendarClock className="size-4" />
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
                            className={cn(
                                "flex-1 gap-1.5 transition-all duration-200",
                                "bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-95",
                                "cursor-pointer"
                            )}
                        >
                            <Plus className="size-4" />
                            Adicionar progresso
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(goal)}
                        disabled={isCompleted}
                        className={cn(
                            "border-border/50 transition-colors duration-200",
                            !isCompleted && "hover:bg-muted hover:text-foreground cursor-pointer active:scale-95",
                            isCompleted && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(goal)}
                        disabled={isCompleted}
                        className={cn(
                            "border-border/50 transition-all duration-200",
                            !isCompleted && "text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer active:scale-95",
                            isCompleted && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Excluir</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
