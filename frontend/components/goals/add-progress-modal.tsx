"use client";

import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { GoalProgressBar } from "./goal-progress-bar";

import type { Goal, AddProgressRequest } from "@/types/goal";
import {cn} from "@/lib/utils";

interface AddProgressModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: AddProgressRequest) => Promise<void>;
  isSubmitting: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function AddProgressModal({
  goal,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: AddProgressModalProps) {
  const [amount, setAmount] = useState("");
  const [previewAmount, setPreviewAmount] = useState(0);

  useEffect(() => {
    if (goal) {
      setAmount("");
      setPreviewAmount(goal.currentAmount);
    }
  }, [goal]);

  useEffect(() => {
    const parsed = parseFloat(amount);
    if (goal && !isNaN(parsed) && parsed > 0) {
      setPreviewAmount(
        Math.min(goal.currentAmount + parsed, goal.targetAmount)
      );
    } else if (goal) {
      setPreviewAmount(goal.currentAmount);
    }
  }, [amount, goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goal || !amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    await onSubmit(goal.id, { amount: parsedAmount });

    setAmount("");
    onClose();
  };

  const handleClose = () => {
    setAmount("");
    onClose();
  };

  if (!goal) return null;

  const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const currentPercentage =
    goal.targetAmount > 0
      ? ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)
      : "0";
  const previewPercentage =
    goal.targetAmount > 0
      ? ((previewAmount / goal.targetAmount) * 100).toFixed(1)
      : "0";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Progresso</DialogTitle>
          <DialogDescription>{goal.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status atual */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso atual</span>
              <span className="font-medium">
                {formatCurrency(goal.currentAmount)} /{" "}
                {formatCurrency(goal.targetAmount)}
              </span>
            </div>

            <GoalProgressBar
              currentAmount={previewAmount}
              targetAmount={goal.targetAmount}
            />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {previewAmount > goal.currentAmount
                  ? `${currentPercentage}% → ${previewPercentage}%`
                  : `${currentPercentage}% concluído`}
              </span>
              <span className="text-muted-foreground">
                Faltam {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="progress-amount">
                Valor a adicionar
              </FieldLabel>
              <Input
                id="progress-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={remainingAmount}
                placeholder="R$ 0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
            </Field>
          </FieldGroup>

            <DialogFooter className="gap-2 sm:gap-0">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className={cn(!isSubmitting && "cursor-pointer")}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting || !amount}
                    className={cn(!(isSubmitting || !amount) && "cursor-pointer")}
                >
                    {isSubmitting && <Spinner className="mr-2" />}
                    {isSubmitting ? "Adicionando..." : "Adicionar"}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
