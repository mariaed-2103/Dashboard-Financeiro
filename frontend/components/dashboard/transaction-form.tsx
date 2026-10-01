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
        const year = values.date.getFullYear();
        const month = String(values.date.getMonth() + 1).padStart(2, '0');
        const day = String(values.date.getDate()).padStart(2, '0');

        const dateStr = `${year}-${month}-${day}`;

        await onSubmit({
            ...values,
            amount: parseFloat(values.amount),
            date: dateStr,
        }, initialData?.id);

        if (!initialData) reset();
    };

    const inputClasses = "bg-[rgba(15,15,26,0.5)] border-[rgba(147,51,234,0.2)] hover:border-[rgba(147,51,234,0.4)] focus:border-[#9333ea] focus:ring-0 transition-colors rounded-xl";

    return (
        <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#fe5000] via-[#c026d3] to-[#9333ea]" />
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="flex items-center justify-center size-8 rounded-xl bg-[rgba(147,51,234,0.1)] border border-[rgba(147,51,234,0.2)]">
                        <PlusCircle className="h-4 w-4 text-[#c084fc]" />
                    </div>
                    {initialData ? "Editar Transação" : "Nova Transação"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 min-w-0">

                        {/* Descrição */}
                        <div className="space-y-2 min-w-0">
                            <Label htmlFor="description" className="text-muted-foreground/80 text-xs uppercase tracking-wider font-semibold">Descrição</Label>
                            <Input
                                {...register("description")}
                                placeholder="Ex: Compras"
                                className={cn(inputClasses, errors.description && "border-destructive")}
                            />
                            {errors.description && (
                                <p className="text-[10px] text-destructive flex items-center gap-1">
                                    <AlertCircle className="size-3" />{errors.description.message}
                                </p>
                            )}
                        </div>

                        {/* Valor */}
                        <div className="space-y-2 min-w-0">
                            <Label htmlFor="amount" className="text-muted-foreground/80 text-xs uppercase tracking-wider font-semibold">Valor (R$)</Label>
                            <Input
                                {...register("amount")}
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                className={cn(inputClasses, errors.amount && "border-destructive")}
                            />
                            {errors.amount && (
                                <p className="text-[10px] text-destructive flex items-center gap-1">
                                    <AlertCircle className="size-3" />{errors.amount.message}
                                </p>
                            )}
                        </div>

                        {/* Tipo */}
                        <div className="space-y-2 min-w-0">
                            <Label className="text-muted-foreground/80 text-xs uppercase tracking-wider font-semibold">Tipo</Label>
                            <Select value={selectedType} onValueChange={(v) => setValue("type", v as TransactionType)}>
                                <SelectTrigger className={inputClasses}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f0f1a]/95 backdrop-blur-xl border-[rgba(147,51,234,0.2)] rounded-xl">
                                    <SelectItem value="EXPENSE" className="hover:bg-[rgba(147,51,234,0.1)] focus:bg-[rgba(147,51,234,0.1)] rounded-lg">Despesa</SelectItem>
                                    <SelectItem value="INCOME" className="hover:bg-[rgba(147,51,234,0.1)] focus:bg-[rgba(147,51,234,0.1)] rounded-lg">Receita</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Categoria */}
                        <div className="space-y-2 min-w-0">
                            <Label className="text-muted-foreground/80 text-xs uppercase tracking-wider font-semibold">Categoria</Label>
                            <Select value={selectedCategoryId} onValueChange={(v) => setValue("categoryId", v)}>
                                <SelectTrigger
                                    className={cn(inputClasses, "w-full", errors.categoryId && "border-destructive")}
                                    title={selectedCategoryLabel}
                                >
                                    <span className="block truncate text-sm">
                                        {selectedCategoryLabel || <span className="text-muted-foreground">Selecione</span>}
                                    </span>
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f0f1a]/95 backdrop-blur-xl border-[rgba(147,51,234,0.2)] rounded-xl">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value} className="hover:bg-[rgba(147,51,234,0.1)] focus:bg-[rgba(147,51,234,0.1)] rounded-lg">
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
                            <Label className="text-muted-foreground/80 text-xs uppercase tracking-wider font-semibold">Data</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left px-3 font-normal", inputClasses,
                                            errors.date && "border-destructive"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-[#9333ea]" />
                                        <span className="truncate">
                                            {selectedDate
                                                ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                                                : "Selecione"}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-2xl border-[rgba(147,51,234,0.2)] bg-[#0f0f1a]/95 backdrop-blur-xl">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(d) => d && setValue("date", d)}
                                        locale={ptBR}
                                        disabled={{ after: new Date() }}
                                        className="p-3"
                                        classNames={{
                                            month_caption: "flex items-center justify-center h-8 font-bold text-sm text-foreground capitalize",
                                            weekday: "text-muted-foreground text-xs font-medium w-9",
                                            today: "bg-[rgba(147,51,234,0.2)] text-[#c084fc] rounded-lg font-bold"
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto h-11 rounded-xl">
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