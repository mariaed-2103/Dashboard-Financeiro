"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import type { Goal, CreateGoalRequest, GoalType } from "@/types/goal";
import { GOAL_TYPE_LABELS } from "@/types/goal";

interface EditGoalModalProps {
    goal: Goal | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: string, data: CreateGoalRequest) => Promise<void>;
    isSubmitting: boolean;
}

const GOAL_TYPES: GoalType[] = ["SAVING", "PURCHASE", "DEBT"];

export function EditGoalModal({
                                  goal,
                                  isOpen,
                                  onClose,
                                  onSubmit,
                                  isSubmitting,
                              }: EditGoalModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [deadline, setDeadline] = useState<Date | undefined>(undefined);
    const [type, setType] = useState<GoalType>("SAVING");

    useEffect(() => {
        if (goal) {
            setName(goal.name);
            setDescription(goal.description);
            setTargetAmount(goal.targetAmount.toString());
            setDeadline(new Date(goal.deadline + "T12:00:00"));
            setType(goal.type);
        }
    }, [goal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!goal || !name || !targetAmount || !deadline) return;

        await onSubmit(goal.id, {
            name,
            description,
            targetAmount: parseFloat(targetAmount),
            deadline: format(deadline, "yyyy-MM-dd"),
            type,
        });
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Meta</DialogTitle>
                    <DialogDescription>
                        Atualize as informações da sua meta financeira.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="edit-goal-name">Nome da meta</FieldLabel>
                            <Input
                                id="edit-goal-name"
                                placeholder="Ex: Reserva de emergência"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="edit-goal-description">Descrição</FieldLabel>
                            <Textarea
                                id="edit-goal-description"
                                placeholder="Descreva o objetivo desta meta..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="edit-goal-target">Valor objetivo</FieldLabel>
                            <Input
                                id="edit-goal-target"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="R$ 0,00"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Data limite</FieldLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer w-full justify-start text-left font-normal",
                                            !deadline && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {deadline
                                            ? format(deadline, "dd/MM/yyyy", { locale: ptBR })
                                            : "Selecione uma data"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="cursor-pointer w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={deadline}
                                        onSelect={setDeadline}
                                        locale={ptBR}
                                        className="cursor-pointer rounded-md border"
                                    />
                                </PopoverContent>
                            </Popover>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="edit-goal-type">Tipo da meta</FieldLabel>
                            <Select
                                value={type}
                                onValueChange={(value) => setType(value as GoalType)}
                            >
                                <SelectTrigger id="edit-goal-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {GOAL_TYPES.map((goalType) => (
                                        <SelectItem key={goalType} value={goalType}>
                                            {GOAL_TYPE_LABELS[goalType]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            disabled={isSubmitting || !name || !targetAmount || !deadline}
                            className={cn(
                                !(isSubmitting || !name || !targetAmount || !deadline) && "cursor-pointer"
                            )}
                        >
                            {isSubmitting && <Spinner className="mr-2" />}
                            {isSubmitting ? "Salvando..." : "Salvar alterações"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
