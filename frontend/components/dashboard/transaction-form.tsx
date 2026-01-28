"use client";

import React from "react"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2 } from "lucide-react";
import type { TransactionFormData, TransactionType } from "@/types/transaction";
import type { Category } from "@/types/transaction";

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => Promise<void>;
  isSubmitting: boolean;
}

const CATEGORIES: { value: Category; label: string }[] = [
    { value: "ALIMENTACAO", label: "Alimentação" },
    { value: "TRANSPORTE", label: "Transporte" },
    { value: "MORADIA", label: "Moradia" },
    { value: "SAUDE", label: "Saúde" },
    { value: "EDUCACAO", label: "Educação" },
    { value: "LAZER", label: "Lazer" },
    { value: "SALARIO", label: "Salário" },
    { value: "INVESTIMENTOS", label: "Investimentos" },
    { value: "OUTROS", label: "Outros" },
];

export function TransactionForm({
  onSubmit,
  isSubmitting,
}: TransactionFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [category, setCategory] = useState<Category | "">("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError("Descrição é obrigatória");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Valor deve ser maior que zero");
      return;
    }

    if (!category) {
      setError("Categoria é obrigatória");
      return;
    }

    if (!date) {
      setError("Data é obrigatória");
      return;
    }

    try {
      await onSubmit({
        description: description.trim(),
        amount: amountValue,
        type,
        category,
        date,
      });

      setDescription("");
      setAmount("");
      setType("EXPENSE");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);
    } catch {
      setError("Erro ao criar transação. Tente novamente.");
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PlusCircle className="h-5 w-5 text-primary" />
          Nova Transação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-muted-foreground">
                Descrição
              </Label>
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
              <Label htmlFor="amount" className="text-muted-foreground">
                Valor (R$)
              </Label>
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
              <Label htmlFor="type" className="text-muted-foreground">
                Tipo
              </Label>
              <Select
                value={type}
                onValueChange={(value: TransactionType) => setType(value)}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="type"
                  className="bg-secondary border-border/50"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-expense" />
                      Despesa
                    </span>
                  </SelectItem>
                  <SelectItem value="INCOME">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-income" />
                      Receita
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-muted-foreground">
                Categoria
              </Label>
                <Select
                    value={category}
                    onValueChange={(value) => setCategory(value as Category)}
                    disabled={isSubmitting}
                >

                <SelectTrigger
                  id="category"
                  className="bg-secondary border-border/50"
                >
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                    {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-muted-foreground">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSubmitting}
                className="bg-secondary border-border/50 focus:border-primary"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Transação
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
