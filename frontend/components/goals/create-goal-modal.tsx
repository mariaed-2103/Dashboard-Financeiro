"use client";

import { useState } from "react";
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

import type { CreateGoalRequest, GoalType } from "@/types/goal";
import { GOAL_TYPE_LABELS } from "@/types/goal";

interface CreateGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateGoalRequest) => Promise<void>;
    isSubmitting: boolean;
}

const GOAL_TYPES: GoalType[] = ["SAVING", "PURCHASE", "DEBT"];

export function CreateGoalModal({
                                    isOpen,
                                    onClose,
                                    onSubmit,
                                    isSubmitting,
                                }: CreateGoalModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [deadline, setDeadline] = useState<Date | undefined>(undefined);
    const [type, setType] = useState<GoalType>("SAVING");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !targetAmount || !deadline) return;

        await onSubmit({
            name,
            description,
            targetAmount: parseFloat(targetAmount),
            deadline: format(deadline, "yyyy-MM-dd"),
            type,
        });

        resetForm();
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setTargetAmount("");
        setDeadline(undefined);
        setType("SAVING");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Criar Nova Meta</DialogTitle>
                    <DialogDescription>
                        Defina uma meta financeira para acompanhar seu progresso.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="goal-name">Nome da meta</FieldLabel>
                            <Input
                                id="goal-name"
                                placeholder="Ex: Reserva de emergência"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="goal-description">Descrição</FieldLabel>
                            <Textarea
                                id="goal-description"
                                placeholder="Descreva o objetivo desta meta..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="goal-target">Valor objetivo</FieldLabel>
                            <Input
                                id="goal-target"
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
                                            " cursor-pointer w-full justify-start text-left font-normal",
                                            !deadline && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="cursor-pointer mr-2 h-4 w-4" />
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
                                        disabled={{ before: new Date() }}
                                        className="rounded-md border"
                                    />
                                </PopoverContent>
                            </Popover>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="goal-type">Tipo da meta</FieldLabel>
                            <Select
                                value={type}
                                onValueChange={(value) => setType(value as GoalType)}
                            >
                                <SelectTrigger id="goal-type">
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
                            className={cn(!(isSubmitting || !name || !targetAmount || !deadline) && "cursor-pointer")}
                            disabled={isSubmitting || !name || !targetAmount || !deadline}
                        >
                            {isSubmitting && <Spinner className="mr-2" />}
                            {isSubmitting ? "Criando..." : "Criar meta"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
