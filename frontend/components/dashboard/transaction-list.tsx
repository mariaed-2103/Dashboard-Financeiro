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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
            const localDate = new Date(year, month - 1, day, 12, 0, 0);
            return format(localDate, "dd MMM yyyy", { locale: ptBR });
        } catch {
            return dateString;
        }
    };

    const handleConfirmDelete = () => {
        if (deleteTarget) {
            onDelete(deleteTarget.id);
            setDeleteTarget(null);
        }
    };

    const exportCSV = () => {
        const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor (R$)"];
        const rows = transactions.map((t) => {
            const amount = Number(t.amount) || 0;
            const finalValue = t.type === "INCOME" ? amount : -amount;
            return [
                formatDate(t.date),
                `"${t.description.replace(/"/g, '""')}"`,
                `"${getCategoryName(t.categoryId)}"`,
                t.type === "INCOME" ? "Receita" : "Despesa",
                finalValue.toFixed(2).replace(".", ","),
            ];
        });
        const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transacoes_${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportExcel = () => {
        const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor (R$)"];
        const rows = transactions.map((t) => {
            const amount = Number(t.amount) || 0;
            const finalValue = t.type === "INCOME" ? amount : -amount;
            return [
                formatDate(t.date),
                t.description,
                getCategoryName(t.categoryId),
                t.type === "INCOME" ? "Receita" : "Despesa",
                finalValue.toFixed(2).replace(".", ","),
            ];
        });
        const xmlRows = [headers, ...rows]
            .map((row) =>
                `<Row>${row
                    .map((cell) => `<Cell><Data ss:Type="String">${String(cell).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Data></Cell>`)
                    .join("")}</Row>`
            )
            .join("");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Transações">
    <Table>${xmlRows}</Table>
  </Worksheet>
</Workbook>`;
        const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transacoes_${format(new Date(), "yyyy-MM-dd")}.xls`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ─── Estado vazio / loading / erro ────────────────────────────────────────
    const emptyState = (
        <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Nenhuma transação encontrada</p>
            <p className="text-sm text-muted-foreground/70">
                Adicione sua primeira transação usando o formulário acima
            </p>
        </div>
    );

    // ─── Botão exportar (reutilizado no header) ────────────────────────────────
    const exportButton = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-2 border-border/50 text-muted-foreground hover:text-foreground"
                >
                    <Download className="h-4 w-4" />
                    {/* Esconde o texto em telas muito pequenas para não apertar o header */}
                    <span className="hidden xs:inline">Exportar</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportCSV} className="gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    Baixar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportExcel} className="gap-2 cursor-pointer">
                    <Sheet className="h-4 w-4" />
                    Baixar Excel (.xls)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <>
            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <FileText className="h-5 w-5 text-primary shrink-0" />
                            Transações Recentes
                        </CardTitle>
                        {transactions.length > 0 && exportButton}
                    </div>
                </CardHeader>

                <CardContent className="px-3 sm:px-6">
                    {error && (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    {!isLoading && !error && transactions.length === 0 && emptyState}

                    {!isLoading && !error && transactions.length > 0 && (
                        <>
                            {/*
                              ── MOBILE: Cards individuais (visível até md) ──────────────────
                              Cada transação vira um card com layout de 2 linhas:
                                Linha 1: descrição + valor
                                Linha 2: data + categoria + tipo + ações
                            */}
                            <div className="flex flex-col gap-2 md:hidden">
                                {transactions.map((t) => (
                                    <div
                                        key={t.id}
                                        className="
                                            flex flex-col gap-2
                                            rounded-xl border border-border/30
                                            bg-secondary/20 hover:bg-secondary/40
                                            px-4 py-3
                                            transition-colors
                                        "
                                    >
                                        {/* Linha 1: Descrição + Valor */}
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold text-sm text-foreground leading-tight">
                                                {t.description}
                                            </p>
                                            <span
                                                className={`
                                                    font-bold text-sm shrink-0
                                                    transition-all duration-300
                                                    ${isBlurred ? "blur-sm select-none" : ""}
                                                    ${t.type === "INCOME" ? "text-accent" : "text-red-500"}
                                                `}
                                            >
                                                {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                                            </span>
                                        </div>

                                        {/* Linha 2: Metadados + Ações */}
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Data */}
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(t.date)}
                                                </span>

                                                {/* Categoria */}
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs font-normal bg-secondary text-secondary-foreground py-0"
                                                >
                                                    {getCategoryName(t.categoryId)}
                                                </Badge>

                                                {/* Tipo */}
                                                <div className="flex items-center gap-1">
                                                    {t.type === "INCOME" ? (
                                                        <TrendingUp className="h-3.5 w-3.5 text-accent" />
                                                    ) : (
                                                        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Ações */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                                                    onClick={() => onEdit(t)}
                                                    aria-label="Editar transação"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => setDeleteTarget(t)}
                                                    aria-label="Excluir transação"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/*
                              ── DESKTOP: Tabela completa (visível a partir de md) ───────────
                              Idêntica à original, apenas escondida em mobile
                            */}
                            <div className="hidden md:block">
                                <ScrollArea className="h-[400px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-muted-foreground">Data</TableHead>
                                                <TableHead className="text-muted-foreground">Descrição</TableHead>
                                                <TableHead className="text-muted-foreground">Categoria</TableHead>
                                                <TableHead className="text-muted-foreground">Tipo</TableHead>
                                                <TableHead className="text-right text-muted-foreground">Valor</TableHead>
                                                <TableHead className="text-right text-muted-foreground">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map((t) => (
                                                <TableRow key={t.id} className="border-border/30 hover:bg-secondary/50">
                                                    <TableCell className="font-medium text-muted-foreground">
                                                        {formatDate(t.date)}
                                                    </TableCell>
                                                    <TableCell className="font-medium">{t.description}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="font-normal bg-secondary text-secondary-foreground">
                                                            {getCategoryName(t.categoryId)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {t.type === "INCOME" ? (
                                                                <>
                                                                    <TrendingUp className="h-4 w-4 text-accent" />
                                                                    <span className="text-accent text-sm font-medium">Receita</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                                                    <span className="text-red-500 text-sm font-medium">Despesa</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className={`text-right font-bold ${t.type === "INCOME" ? "text-accent" : "text-red-500"}`}>
                                                        <span className={`transition-all duration-300 ${isBlurred ? "blur-sm select-none" : ""}`}>
                                                            {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                                                                        onClick={() => onEdit(t)}
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                        <span className="sr-only">Editar transação</span>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Editar</TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                        onClick={() => setDeleteTarget(t)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        <span className="sr-only">Excluir transação</span>
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

            {/* Dialog de confirmação de exclusão — igual ao original */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir transação</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir a transação{" "}
                            <strong className="text-foreground">{deleteTarget?.description}</strong>?
                            {" "}Essa ação pode ser desfeita nos próximos segundos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}