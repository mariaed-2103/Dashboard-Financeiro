"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { Plus, Check, DollarSign, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    Alimentacao: ["mercado", "supermercado", "restaurante", "lanche", "comida", "ifood", "delivery", "cafe", "padaria", "acougue"],
    Transporte: ["uber", "gasolina", "combustivel", "onibus", "metro", "estacionamento", "pedagio", "carro", "moto", "99"],
    Moradia: ["aluguel", "condominio", "luz", "agua", "gas", "internet", "iptu", "casa", "apartamento"],
    Saude: ["farmacia", "remedio", "medico", "consulta", "exame", "hospital", "plano", "dentista", "academia"],
    Educacao: ["curso", "livro", "escola", "faculdade", "mensalidade", "material", "apostila"],
    Lazer: ["cinema", "netflix", "spotify", "show", "viagem", "hotel", "passeio", "jogo", "streaming"],
    Salario: ["salario", "pagamento", "remuneracao", "bonus", "comissao", "freelance"],
    Investimentos: ["investimento", "acao", "fundo", "dividendo", "rendimento", "juros"],
    Outros: ["outros", "diversos"],
};

const CATEGORY_LABELS: Record<string, string> = {
    Alimentacao: "Alimentacao",
    Transporte: "Transporte",
    Moradia: "Moradia",
    Saude: "Saude",
    Educacao: "Educacao",
    Lazer: "Lazer",
    Salario: "Salario",
    Investimentos: "Investimentos",
    Outros: "Outros",
};

interface ParsedInput {
    amount: number | null;
    description: string;
}

interface QuickAddProps {
    onAdd?: (data: { amount: number; description: string; suggestedCategory: string | null }) => void;
    className?: string;
}

function ConfettiPiece({ delay, left, color }: { delay: number; left: number; color: string }) {
    return (
        <div
            className="absolute w-2 h-2 rounded-full animate-confetti"
            style={{ left: `${left}%`, top: 0, animationDelay: `${delay}ms`, backgroundColor: color }}
        />
    );
}

export function QuickAdd({ onAdd, className }: QuickAddProps) {
    const [inputValue, setInputValue] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const parsedInput = useMemo((): ParsedInput => {
        const trimmed = inputValue.trim();
        if (!trimmed) return { amount: null, description: "" };

        const startNumberMatch = trimmed.match(/^(\d+([.,]\d{1,2})?)\s*(.*)/);
        const endNumberMatch = trimmed.match(/(.*?)\s*(\d+([.,]\d{1,2})?)$/);

        let amount: number | null = null;
        let description = trimmed;

        if (startNumberMatch && startNumberMatch[1]) {
            amount = parseFloat(startNumberMatch[1].replace(",", "."));
            description = startNumberMatch[3] || "";
        } else if (endNumberMatch && endNumberMatch[2]) {
            amount = parseFloat(endNumberMatch[2].replace(",", "."));
            description = endNumberMatch[1] || "";
        }

        return { amount, description: description.trim() };
    }, [inputValue]);

    const suggestedCategories = useMemo(() => {
        const text = parsedInput.description.toLowerCase();
        if (!text) return [];

        const matches: string[] = [];

        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    if (!matches.includes(category)) {
                        matches.push(category);
                    }
                    break;
                }
            }
        }
        return matches.slice(0, 4);
    }, [parsedInput.description]);

    const canAdd = parsedInput.amount !== null && parsedInput.amount > 0 && parsedInput.description.length > 0;

    const handleAdd = useCallback(() => {
        if (!canAdd || !parsedInput.amount) return;

        setShowSuccess(true);
        setShowConfetti(true);

        onAdd?.({
            amount: parsedInput.amount,
            description: parsedInput.description,
            suggestedCategory: suggestedCategories[0] || null,
        });

        setTimeout(() => {
            setInputValue("");
            setShowSuccess(false);
            setShowConfetti(false);
            inputRef.current?.focus();
        }, 1200);
    }, [canAdd, parsedInput, suggestedCategories, onAdd]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && canAdd) {
            e.preventDefault();
            handleAdd();
        }
    }, [canAdd, handleAdd]);

    const confettiColors = ["#fe5000", "#c026d3", "#9333ea", "#f59e0b", "#10b981"];

    return (
        <div className={cn("w-full max-w-2xl mx-auto", className)}>
            <div className="relative">
                {showConfetti && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <ConfettiPiece key={i} delay={i * 50} left={10 + Math.random() * 80} color={confettiColors[i % confettiColors.length]} />
                        ))}
                    </div>
                )}

                <div
                    className={cn(
                        "relative flex items-center gap-2 rounded-2xl border transition-all duration-300",
                        "bg-[#0f0f1a]/80 backdrop-blur-md shadow-[0_8px_32px_rgba(8,8,15,0.8)]",
                        canAdd
                            ? "border-[rgba(147,51,234,0.4)] shadow-[0_0_24px_rgba(147,51,234,0.18)]"
                            : "border-[rgba(147,51,234,0.15)] hover:border-[rgba(147,51,234,0.3)]",
                        showSuccess && "border-emerald-500/50 shadow-[0_0_30px_rgba(52,211,153,0.2)]"
                    )}
                >
                    <div className="flex items-center pl-4">
                        {parsedInput.amount !== null ? (
                            <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-500/15 border border-purple-500/25">
                                    <DollarSign className="w-4 h-4 text-purple-400" />
                                </div>
                                <span className="text-sm font-semibold text-purple-300 tabular-nums">
                                  R$ {parsedInput.amount.toFixed(2).replace(".", ",")}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[rgba(147,51,234,0.08)] border border-[rgba(147,51,234,0.15)]">
                                <Sparkles className="w-4 h-4 text-muted-foreground/50" />
                            </div>
                        )}
                    </div>

                    {parsedInput.amount !== null && (
                        <div className="w-px h-6 bg-[rgba(147,51,234,0.2)]" />
                    )}

                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Digite valor e descrição (ex: 50 mercado)"
                        className={cn(
                            "flex-1 bg-transparent border-none outline-none py-4 pr-2",
                            "text-foreground/90 placeholder:text-muted-foreground/40",
                            "text-base font-sans"
                        )}
                        disabled={showSuccess}
                    />

                    {parsedInput.description && (
                        <div className="flex items-center gap-1.5 pr-2 animate-in fade-in slide-in-from-right-2 duration-200">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground/50" />
                            <span className="text-xs text-muted-foreground/60 max-w-[100px] truncate hidden sm:block">
                                {parsedInput.description}
                            </span>
                        </div>
                    )}

                    <Button
                        size="icon"
                        onClick={handleAdd}
                        disabled={!canAdd || showSuccess}
                        className={cn(
                            "mr-2 rounded-xl transition-all duration-300 w-10 h-10",
                            canAdd && !showSuccess
                                ? "bg-gradient-to-br from-[#fe5000] to-[#c026d3] hover:from-[#c026d3] hover:to-[#9333ea] text-white shadow-[0_0_16px_rgba(254,80,0,0.4)]"
                                : "bg-[rgba(147,51,234,0.08)] text-muted-foreground"
                        )}
                    >
                        {showSuccess ? (
                            <div className="relative">
                                <Check className="w-5 h-5 animate-success-check text-emerald-400" />
                            </div>
                        ) : (
                            <Plus className={cn("w-5 h-5 transition-transform duration-200", canAdd && "group-hover:rotate-90")} />
                        )}
                    </Button>
                </div>

                {suggestedCategories.length > 0 && !showSuccess && (
                    <div className="flex items-center gap-2 mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <span className="text-xs text-muted-foreground">Categorias:</span>
                        <div className="flex flex-wrap gap-1.5">
                            {suggestedCategories.map((category) => (
                                <Badge
                                    key={category}
                                    variant="secondary"
                                    className={cn(
                                        "cursor-pointer transition-all duration-200",
                                        "bg-[rgba(147,51,234,0.1)] hover:bg-[rgba(147,51,234,0.25)] text-purple-300",
                                        "text-xs py-0.5 px-2.5 rounded-full",
                                        "border border-[rgba(147,51,234,0.2)] hover:border-[rgba(147,51,234,0.4)]"
                                    )}
                                >
                                    {CATEGORY_LABELS[category] || category}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {!inputValue && (
                    <p className="text-xs text-muted-foreground/60 mt-3 text-center animate-in fade-in duration-500">
                        Pressione <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">Enter</kbd> para adicionar rapidamente
                    </p>
                )}
            </div>
        </div>
    );
}
