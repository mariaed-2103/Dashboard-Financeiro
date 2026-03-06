"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

import type { Transaction, TransactionFormData, TransactionType, UserCategory, Category } from "@/types/transaction";
import { CATEGORY_LABELS } from "@/types/transaction";

interface TransactionFormProps {
    onSubmit: (data: TransactionFormData, id?: string) => Promise<void>;
    isSubmitting: boolean;
    initialData?: Transaction | null;
    globalCategories: UserCategory[];
    customCategories: UserCategory[];
}

export function TransactionForm({ onSubmit, isSubmitting, initialData, globalCategories, customCategories }: TransactionFormProps) {
    const [description, setDescription] = useState(initialData?.description || "");
    const [amount, setAmount] = useState(initialData?.amount.toString() || "");
    const [type, setType] = useState<TransactionType>(initialData?.type || "EXPENSE");
    const [categoryId, setCategoryId] = useState<string>("")
    const [date, setDate] = useState<Date | undefined>(initialData ? new Date(initialData.date) : new Date());
    const [error, setError] = useState<string | null>(null);

    // Monta a lista de categorias a partir das props (reativo a mudanças do pai)
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

    useEffect(() => {
        if (initialData) {
            setDescription(initialData.description);
            setAmount(initialData.amount.toString());
            setType(initialData.type);
            setCategoryId(initialData.categoryId);
            setDate(new Date(initialData.date));
        } else {
            setDescription("");
            setAmount("");
            setType("EXPENSE");
            setCategoryId("");
            setDate(new Date());
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const amountValue = parseFloat(amount);
        if (!description.trim()) return setError("Descrição é obrigatória");
        if (!amount || isNaN(amountValue) || amountValue <= 0) return setError("Valor deve ser maior que zero");
        if (!categoryId) return setError("Categoria é obrigatória");
        if (!date) return setError("Data é obrigatória");

        try {

            await onSubmit({
                description,
                amount: amountValue,
                type,
                categoryId,
                date: format(date, "yyyy-MM-dd"),
            }, initialData?.id); // Se for edição, o ID vai aqui

            if (!initialData) { // Limpa apenas se for nova transação
                setDescription("");
                setAmount("");
                setCategoryId("");
            }
        } catch {
            setError("Erro ao salvar transação. Tente novamente.");
        }
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-muted-foreground">Descrição</Label>
                            <Input
                                id="description"
                                placeholder="Ex: Compras no mercado"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isSubmitting}
                                className="bg-secondary border-border/50 focus:border-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-muted-foreground">Valor (R$)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0,00"
                                min="0.01"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={isSubmitting}
                                className="bg-secondary border-border/50 focus:border-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-muted-foreground">Tipo</Label>
                            <Select value={type} onValueChange={(v: TransactionType) => setType(v)} disabled={isSubmitting}>
                                <SelectTrigger id="type" className="bg-secondary border-border/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EXPENSE">Despesa</SelectItem>
                                    <SelectItem value="INCOME">Receita</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-muted-foreground">Categoria</Label>
                            <Select value={categoryId}  onValueChange={setCategoryId}>
                                <SelectTrigger id="category" className="bg-secondary border-border/50">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem
                                            key={cat.value}
                                            value={cat.value}
                                            className="capitalize" // Garante o estilo visual no dropdown
                                        >
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <Label className="text-muted-foreground">Data</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn("cursor-pointer w-full justify-start text-left font-normal bg-secondary border-border/50 hover:bg-secondary/80")}
                                        disabled={isSubmitting}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 border-border/50 bg-card rounded-xl shadow-lg" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        locale={ptBR}
                                        disabled={{ after: new Date() }}
                                        defaultMonth={date}
                                        className="p-3"
                                        classNames={{
                                            month_caption: "flex items-center justify-center h-8 font-semibold text-sm text-foreground capitalize",
                                            weekday: "text-muted-foreground text-xs font-medium w-9",
                                            today: "bg-accent text-accent-foreground rounded-lg font-semibold",
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button type="submit" disabled={isSubmitting} className="cursor-pointer w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                {initialData ? "Salvar Alterações" : "Adicionar Transação"}
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
