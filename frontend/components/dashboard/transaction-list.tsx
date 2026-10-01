"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileText, TrendingUp, TrendingDown, Pencil, Trash2, Download, Sheet } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface TransactionListProps {
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;
    onEdit: (t: Transaction) => void;
    onDelete: (id: string) => void;
    getCategoryName: (categoryIdOrName: string) => string;
    isBlurred?: boolean;
}

export function TransactionList({ transactions, isLoading, error, onEdit, onDelete, getCategoryName, isBlurred }: TransactionListProps) {
    const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

    const formatDate = (dateString: string) => {
        try {
            const datePart = dateString.split('T')[0];
            const [year, month, day] = datePart.split('-').map(Number);
            return format(new Date(year, month - 1, day, 12, 0, 0), "dd MMM yyyy", { locale: ptBR });
        } catch { return dateString; }
    };

    const handleConfirmDelete = () => {
        if (deleteTarget) { onDelete(deleteTarget.id); setDeleteTarget(null); }
    };

    const exportCSV = () => {
        const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor (R$)"];
        const rows = transactions.map(t => {
            const amount = Number(t.amount) || 0;
            const finalValue = t.type === "INCOME" ? amount : -amount;
            return [formatDate(t.date), `"${t.description.replace(/"/g, '""')}"`, `"${getCategoryName(t.categoryId)}"`, t.type === "INCOME" ? "Receita" : "Despesa", finalValue.toFixed(2).replace(".", ",")];
        });
        const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url;
        a.download = `transacoes_${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    const exportExcel = () => {
        const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor (R$)"];
        const rows = transactions.map(t => {
            const amount = Number(t.amount) || 0; const finalValue = t.type === "INCOME" ? amount : -amount;
            return [formatDate(t.date), t.description, getCategoryName(t.categoryId), t.type === "INCOME" ? "Receita" : "Despesa", finalValue.toFixed(2).replace(".", ",")];
        });
        const xmlRows = [headers, ...rows].map(row => `<Row>${row.map(cell => `<Cell><Data ss:Type="String">${String(cell).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Data></Cell>`).join("")}</Row>`).join("");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Transações"><Table>${xmlRows}</Table></Worksheet></Workbook>`;
        const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url;
        a.download = `transacoes_${format(new Date(), "yyyy-MM-dd")}.xls`; a.click();
        URL.revokeObjectURL(url);
    };

    const emptyState = (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="relative size-16 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(147,51,234,0.12), rgba(254,80,0,0.08))", border: "1px solid rgba(147,51,234,0.2)" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
                <FileText className="size-7 relative z-10" style={{ color: "rgba(192,132,252,0.6)" }} />
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-foreground/70 font-bold">Nenhuma transação encontrada</p>
                <p className="text-sm text-muted-foreground/50 max-w-[260px]">Adicione sua primeira transação usando o formulário acima</p>
            </div>
        </div>
    );

    const exportButton = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="cursor-pointer gap-2">
                    <Download className="h-4 w-4" />
                    <span className="hidden xs:inline">Exportar</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl" style={{ background: "rgba(15,15,26,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(147,51,234,0.2)" }}>
                <DropdownMenuItem onClick={exportCSV} className="gap-2 cursor-pointer text-purple-300/80 hover:text-purple-200 hover:bg-purple-500/10 rounded-lg">
                    <FileText className="h-4 w-4" /> Baixar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportExcel} className="gap-2 cursor-pointer text-purple-300/80 hover:text-purple-200 hover:bg-purple-500/10 rounded-lg">
                    <Sheet className="h-4 w-4" /> Baixar Excel (.xls)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <>
            <Card>
                {/* Borda gradiente no topo */}
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                    style={{ background: "linear-gradient(90deg, #fe5000, #c026d3, #9333ea)" }} />

                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                        <CardTitle className="flex items-center gap-3 text-base sm:text-lg">
                            <div className="size-8 rounded-xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, rgba(254,80,0,0.2), rgba(147,51,234,0.15))", border: "1px solid rgba(147,51,234,0.25)" }}>
                                <FileText className="h-4 w-4" style={{ color: "#c084fc" }} />
                            </div>
                            Transações Recentes
                        </CardTitle>
                        {transactions.length > 0 && exportButton}
                    </div>
                </CardHeader>

                <CardContent className="px-3 sm:px-6">
                    {error && <div className="flex items-center justify-center py-8"><p className="text-sm text-destructive">{error}</p></div>}
                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#9333ea" }} />
                                <span className="text-xs text-muted-foreground/50">Carregando...</span>
                            </div>
                        </div>
                    )}
                    {!isLoading && !error && transactions.length === 0 && emptyState}

                    {!isLoading && !error && transactions.length > 0 && (
                        <>
                            {/* ── MOBILE: Cards ────────────────────────────────── */}
                            <div className="flex flex-col gap-2 md:hidden">
                                {transactions.map(t => (
                                    <div key={t.id}
                                        className="flex flex-col gap-2 rounded-2xl px-4 py-3 transition-all duration-200 group"
                                        style={{ background: "rgba(26,26,46,0.5)", border: "1px solid rgba(147,51,234,0.1)" }}
                                        onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(147,51,234,0.3)"; el.style.background = "rgba(26,26,46,0.7)"; }}
                                        onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(147,51,234,0.1)"; el.style.background = "rgba(26,26,46,0.5)"; }}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold text-sm text-foreground/90 leading-tight">{t.description}</p>
                                            <span className={`font-black text-sm shrink-0 transition-all duration-300 ${isBlurred ? "blur-sm select-none" : ""}`}
                                                style={{ color: t.type === "INCOME" ? "#22d3a0" : "#f87171" }}>
                                                {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs text-muted-foreground/50">{formatDate(t.date)}</span>
                                                <Badge variant="secondary" className="text-xs font-normal py-0">{getCategoryName(t.categoryId)}</Badge>
                                                {t.type === "INCOME" ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8 hover:bg-purple-500/10 hover:text-purple-300" onClick={() => onEdit(t)} aria-label="Editar transação">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteTarget(t)} aria-label="Excluir transação">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── DESKTOP: Tabela ──────────────────────────────── */}
                            <div className="hidden md:block">
                                <ScrollArea className="h-[400px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[rgba(147,51,234,0.1)] hover:bg-transparent">
                                                {["Data", "Descrição", "Categoria", "Tipo"].map(h => (
                                                    <TableHead key={h} className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "rgba(192,132,252,0.6)" }}>{h}</TableHead>
                                                ))}
                                                <TableHead className="text-right text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "rgba(192,132,252,0.6)" }}>Valor</TableHead>
                                                <TableHead className="text-right text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "rgba(192,132,252,0.6)" }}>Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map(t => (
                                                <TableRow key={t.id} className="border-b border-[rgba(147,51,234,0.06)] transition-colors duration-150"
                                                    style={{ cursor: "default" }}
                                                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(147,51,234,0.04)"}
                                                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                                                    <TableCell className="font-medium text-sm" style={{ color: "rgba(248,248,252,0.5)" }}>{formatDate(t.date)}</TableCell>
                                                    <TableCell className="font-semibold text-foreground/90">{t.description}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="font-medium">{getCategoryName(t.categoryId)}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {t.type === "INCOME"
                                                                ? <><TrendingUp className="h-4 w-4 text-emerald-400" /><span className="text-emerald-400 text-sm font-bold">Receita</span></>
                                                                : <><TrendingDown className="h-4 w-4 text-red-400" /><span className="text-red-400 text-sm font-bold">Despesa</span></>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className={`font-black text-sm transition-all duration-300 ${isBlurred ? "blur-sm select-none" : ""}`}
                                                            style={{ color: t.type === "INCOME" ? "#22d3a0" : "#f87171" }}>
                                                            {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8 hover:bg-purple-500/10 hover:text-purple-300" onClick={() => onEdit(t)}>
                                                                        <Pencil className="h-4 w-4" /><span className="sr-only">Editar transação</span>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Editar</TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteTarget(t)}>
                                                                        <Trash2 className="h-4 w-4" /><span className="sr-only">Excluir transação</span>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Excluir</TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                <AlertDialogContent className="rounded-2xl" style={{ background: "rgba(15,15,26,0.97)", backdropFilter: "blur(24px)", border: "1px solid rgba(147,51,234,0.2)" }}>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">Excluir transação</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Tem certeza que deseja excluir a transação{" "}
                            <strong className="text-foreground">{deleteTarget?.description}</strong>?
                            {" "}Essa ação pode ser desfeita nos próximos segundos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-[rgba(147,51,234,0.2)] hover:bg-purple-500/8">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}