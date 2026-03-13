"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, Loader2, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

import type { Transaction, TransactionFormData, TransactionType, UserCategory, Category } from "@/types/transaction";
import { CATEGORY_LABELS } from "@/types/transaction";

const transactionSchema = z.object({
    description: z.string().min(1, "A descrição é obrigatória").max(100, "Máximo de 100 caracteres"),
    amount: z.string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: "O valor deve ser maior que zero",
        }),
    type: z.enum(["EXPENSE", "INCOME"], {
        required_error: "Selecione o tipo",
    }),
    categoryId: z.string().min(1, "A categoria é obrigatória"),
    date: z.date({
        required_error: "A data é obrigatória",
    }),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
    onSubmit: (data: TransactionFormData, id?: string) => Promise<void>;
    isSubmitting: boolean;
    initialData?: Transaction | null;
    globalCategories: UserCategory[];
    customCategories: UserCategory[];
}

export function TransactionForm({ onSubmit, isSubmitting, initialData, globalCategories, customCategories }: TransactionFormProps) {

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            description: "",
            amount: "",
            type: "EXPENSE",
            categoryId: "",
            date: new Date(),
        },
    });

    const selectedType = watch("type");
    const selectedCategoryId = watch("categoryId");
    const selectedDate = watch("date");

    const categories = useMemo(() => {
        const globalCats = globalCategories.map((c) => ({
            value: c.id,
            label: CATEGORY_LABELS[c.name as Category] || c.name,
        }));
        const customCats = customCategories.map((c) => ({
            value: c.id,
            label: c.name,
        }));
        return [...globalCats, ...customCats];
    }, [globalCategories, customCategories]);

    // Nome completo da categoria selecionada — para exibir no título do popover ao hover
    const selectedCategoryLabel = useMemo(
        () => categories.find((c) => c.value === selectedCategoryId)?.label ?? "",
        [categories, selectedCategoryId]
    );

    useEffect(() => {
        if (initialData) {
            reset({
                description: initialData.description,
                amount: initialData.amount.toString(),
                type: initialData.type,
                categoryId: initialData.categoryId,
                date: new Date(initialData.date),
            });
        } else {
            reset({
                description: "",
                amount: "",
                type: "EXPENSE",
                categoryId: "",
                date: new Date(),
            });
        }
    }, [initialData, reset]);

    const onFormSubmit = async (values: TransactionFormValues) => {
        // Pegamos os componentes da data local individualmente
        const year = values.date.getFullYear();
        const month = String(values.date.getMonth() + 1).padStart(2, '0');
        const day = String(values.date.getDate()).padStart(2, '0');

        // Montamos a string YYYY-MM-DD manualmente para evitar UTC offset
        const dateStr = `${year}-${month}-${day}`;

        await onSubmit({
            ...values,
            amount: parseFloat(values.amount),
            date: dateStr,
        }, initialData?.id);

        if (!initialData) reset();
    };

    return (
        <Card className="border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <PlusCircle className="h-5 w-5 text-primary" />
                    {initialData ? "Editar Transação" : "Nova Transação"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 min-w-0">

                        {/* Descrição */}
                        <div className="space-y-2 min-w-0">
                            <Label htmlFor="description" className="text-muted-foreground">Descrição</Label>
                            <Input
                                {...register("description")}
                                placeholder="Ex: Compras no mercado"
                                className={cn("bg-secondary border-border/50", errors.description && "border-destructive")}
                            />
                            {errors.description && (
                                <p className="text-[10px] text-destructive flex items-center gap-1">
                                    <AlertCircle className="size-3" />{errors.description.message}
                                </p>
                            )}
                        </div>

                        {/* Valor */}
                        <div className="space-y-2 min-w-0">
                            <Label htmlFor="amount" className="text-muted-foreground">Valor (R$)</Label>
                            <Input
                                {...register("amount")}
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                className={cn("bg-secondary border-border/50", errors.amount && "border-destructive")}
                            />
                            {errors.amount && (
                                <p className="text-[10px] text-destructive flex items-center gap-1">
                                    <AlertCircle className="size-3" />{errors.amount.message}
                                </p>
                            )}
                        </div>

                        {/* Tipo */}
                        <div className="space-y-2 min-w-0">
                            <Label className="text-muted-foreground">Tipo</Label>
                            <Select value={selectedType} onValueChange={(v) => setValue("type", v as TransactionType)}>
                                <SelectTrigger className="bg-secondary border-border/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EXPENSE">Despesa</SelectItem>
                                    <SelectItem value="INCOME">Receita</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Categoria — corrigido para truncar nomes longos corretamente */}
                        <div className="space-y-2 min-w-0">
                            <Label className="text-muted-foreground">Categoria</Label>
                            <Select value={selectedCategoryId} onValueChange={(v) => setValue("categoryId", v)}>
                                {/*
                                    O SelectTrigger precisa de `overflow-hidden` e width fixo.
                                    O span interno com `truncate` garante que o texto não extrapole.
                                    O `title` exibe o nome completo no hover nativo do browser.
                                */}
                                <SelectTrigger
                                    className={cn(
                                        "bg-secondary border-border/50 w-full",
                                        errors.categoryId && "border-destructive"
                                    )}
                                    title={selectedCategoryLabel} // mostra nome completo no hover
                                >
                                    {/*
                                        Substituímos o <SelectValue> por um span manual para ter
                                        controle total sobre o truncamento. O SelectValue nativo
                                        não respeita truncate dentro de flex containers do Radix.
                                    */}
                                    <span className="block truncate text-sm">
                                        {selectedCategoryLabel || (
                                            <span className="text-muted-foreground">Selecione</span>
                                        )}
                                    </span>
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {/* Nome completo visível na lista dropdown */}
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.categoryId && (
                                <p className="text-[10px] text-destructive flex items-center gap-1">
                                    <AlertCircle className="size-3" />{errors.categoryId.message}
                                </p>
                            )}
                        </div>

                        {/* Data */}
                        <div className="space-y-2 flex flex-col min-w-0">
                            <Label className="text-muted-foreground">Data</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left bg-secondary border-border/50 px-3",
                                            errors.date && "border-destructive"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">
                                            {selectedDate
                                                ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                                                : "Selecione"}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 border-border/50 bg-card">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(d) => d && setValue("date", d)}
                                        locale={ptBR}
                                        disabled={{ after: new Date() }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-primary">
                        {isSubmitting
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <PlusCircle className="mr-2 h-4 w-4" />}
                        {initialData ? "Salvar Alterações" : "Adicionar Transação"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}