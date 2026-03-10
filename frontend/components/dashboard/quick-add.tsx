"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Plus, Check, DollarSign, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Categorias para sugestões
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

// Componente de confete individual
function ConfettiPiece({ delay, left, color }: { delay: number; left: number; color: string }) {
    return (
        <div
            className="absolute w-2 h-2 rounded-full animate-confetti"
            style={{
                left: `${left}%`,
                top: 0,
                animationDelay: `${delay}ms`,
                backgroundColor: color,
            }}
        />
    );
}

export function QuickAdd({ onAdd, className }: QuickAddProps) {
    const [inputValue, setInputValue] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Parse do input em tempo real
    const parsedInput = useMemo((): ParsedInput => {
        const trimmed = inputValue.trim();
        if (!trimmed) return { amount: null, description: "" };

        // Regex para capturar numeros (inteiros ou decimais)
        const numberMatch = trimmed.match(/^\d+([.,]\d{1,2})?|\d+([.,]\d{1,2})?$/);

        // Tenta extrair o numero do inicio
        const startNumberMatch = trimmed.match(/^(\d+([.,]\d{1,2})?)\s*(.*)/);
        // Tenta extrair o numero do final
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

    // Detectar categorias sugeridas baseado no texto
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

        return matches.slice(0, 4); // Maximo 4 sugestoes
    }, [parsedInput.description]);

    // Verificar se pode adicionar (tem valor e descricao)
    const canAdd = parsedInput.amount !== null && parsedInput.amount > 0 && parsedInput.description.length > 0;

    // Handler para adicionar transacao
    const handleAdd = useCallback(() => {
        if (!canAdd || !parsedInput.amount) return;

        // Mostrar animacao de sucesso
        setShowSuccess(true);
        setShowConfetti(true);

        // Chamar callback
        onAdd?.({
            amount: parsedInput.amount,
            description: parsedInput.description,
            suggestedCategory: suggestedCategories[0] || null,
        });

        // Limpar apos animacao
        setTimeout(() => {
            setInputValue("");
            setShowSuccess(false);
            setShowConfetti(false);
            inputRef.current?.focus();
        }, 1200);
    }, [canAdd, parsedInput, suggestedCategories, onAdd]);

    // Handler para Enter
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && canAdd) {
            e.preventDefault();
            handleAdd();
        }
    }, [canAdd, handleAdd]);

    // Cores do confete
    const confettiColors = ["#55D9C1", "#4F8EFF", "#263DBF", "#FFD93D", "#FF6B6B"];

    return (
        <div className={cn("w-full max-w-2xl mx-auto", className)}>
            {/* Container principal */}
            <div className="relative">
                {/* Confetti overlay */}
                {showConfetti && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <ConfettiPiece
                                key={i}
                                delay={i * 50}
                                left={10 + Math.random() * 80}
                                color={confettiColors[i % confettiColors.length]}
                            />
                        ))}
                    </div>
                )}

                {/* Input container */}
                <div
                    className={cn(
                        "relative flex items-center gap-2 rounded-2xl border-2 transition-all duration-300",
                        "bg-card/80 backdrop-blur-sm",
                        canAdd
                            ? "border-accent/60 shadow-[0_0_20px_rgba(85,217,193,0.15)]"
                            : "border-border/50 hover:border-border",
                        showSuccess && "border-accent shadow-[0_0_30px_rgba(85,217,193,0.3)]"
                    )}
                >
                    {/* Indicador de valor detectado */}
                    <div className="flex items-center pl-4">
                        {parsedInput.amount !== null ? (
                            <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent/20">
                                    <DollarSign className="w-4 h-4 text-accent" />
                                </div>
                                <span className="text-sm font-semibold text-accent tabular-nums">
                  R$ {parsedInput.amount.toFixed(2).replace(".", ",")}
                </span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted">
                                <Sparkles className="w-4 h-4 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    {/* Separador vertical */}
                    {parsedInput.amount !== null && (
                        <div className="w-px h-6 bg-border/50" />
                    )}

                    {/* Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Digite valor e descrição (ex: 50 mercado)"
                        className={cn(
                            "flex-1 bg-transparent border-none outline-none py-4 pr-2",
                            "text-foreground placeholder:text-muted-foreground/60",
                            "text-base font-sans"
                        )}
                        disabled={showSuccess}
                    />

                    {/* Indicador de descricao */}
                    {parsedInput.description && (
                        <div className="flex items-center gap-1.5 pr-2 animate-in fade-in slide-in-from-right-2 duration-200">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground max-w-[100px] truncate hidden sm:block">
                {parsedInput.description}
              </span>
                        </div>
                    )}

                    {/* Botao de adicionar */}
                    <Button
                        size="icon"
                        onClick={handleAdd}
                        disabled={!canAdd || showSuccess}
                        className={cn(
                            "mr-2 rounded-xl transition-all duration-300",
                            "w-10 h-10",
                            canAdd && !showSuccess
                                ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/25"
                                : "bg-muted text-muted-foreground"
                        )}
                    >
                        {showSuccess ? (
                            <div className="relative">
                                <Check className="w-5 h-5 animate-success-check" />
                            </div>
                        ) : (
                            <Plus className={cn(
                                "w-5 h-5 transition-transform duration-200",
                                canAdd && "group-hover:rotate-90"
                            )} />
                        )}
                    </Button>
                </div>

                {/* Sugestoes de categoria */}
                {suggestedCategories.length > 0 && !showSuccess && (
                    <div className="flex items-center gap-2 mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <span className="text-xs text-muted-foreground">Categorias sugeridas:</span>
                        <div className="flex flex-wrap gap-1.5">
                            {suggestedCategories.map((category) => (
                                <Badge
                                    key={category}
                                    variant="secondary"
                                    className={cn(
                                        "cursor-pointer transition-all duration-200",
                                        "bg-secondary/80 hover:bg-primary hover:text-primary-foreground",
                                        "text-xs py-0.5 px-2.5 rounded-full",
                                        "border border-border/50 hover:border-primary/50"
                                    )}
                                >
                                    {CATEGORY_LABELS[category] || category}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dica de uso */}
                {!inputValue && (
                    <p className="text-xs text-muted-foreground/60 mt-3 text-center animate-in fade-in duration-500">
                        Pressione <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">Enter</kbd> para adicionar rapidamente
                    </p>
                )}
            </div>
        </div>
    );
}
