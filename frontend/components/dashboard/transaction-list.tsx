"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileText, TrendingUp, TrendingDown, Pencil, Trash2 } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
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
}

export function TransactionList({ transactions, isLoading, error, onEdit, onDelete,  getCategoryName }: TransactionListProps) {
    const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

    const formatDate = (dateString: string) => {
        try {
            return format(parseISO(dateString), "dd MMM yyyy", { locale: ptBR });
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

    return (
        <>
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5 text-primary" />
                        Transações Recentes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <div className="flex items-center justify-center py-8"><p className="text-sm text-destructive">{error}</p></div>}
                    {isLoading && <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                    {!isLoading && !error && transactions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                            <p className="text-sm text-muted-foreground/70">Adicione sua primeira transação usando o formulário acima</p>
                        </div>
                    )}

                    {!isLoading && !error && transactions.length > 0 && (
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
                                            <TableCell className="font-medium text-muted-foreground">{formatDate(t.date)}</TableCell>
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
                                                {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
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
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
                    )}
                </CardContent>
            </Card>

            {/* Alert Dialog de confirmação de exclusão */}
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
