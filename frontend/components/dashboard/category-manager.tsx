"use client";

import { useState } from "react";
import type { UserCategory } from "@/types/transaction";
import { CATEGORY_LABELS } from "@/types/transaction";
import type { Category } from "@/types/transaction";
import { createCategory, deleteCategory, updateCategory } from "@/services/categories";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Tag, Loader2, FolderOpen, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

interface CategoryManagerProps {
    customCategories: UserCategory[];
    onCategoryChange: () => void;
}

const GLOBAL_CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][];

export function CategoryManager({ customCategories, onCategoryChange }: CategoryManagerProps) {
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Estados para edição
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        const name = newCategoryName.trim();
        if (!name) return;

        if (name.length < 2) {
            toast.error("O nome deve ter pelo menos 2 caracteres");
            return;
        }

        if (name.length > 50) {
            toast.error("O nome deve ter no máximo 50 caracteres");
            return;
        }

        const isGlobal = GLOBAL_CATEGORIES.some(
            ([key]) => key.toLowerCase() === name.toLowerCase()
        );
        if (isGlobal) {
            toast.error("Essa categoria já existe como categoria global");
            return;
        }

        const isDuplicate = customCategories.some(
            (c) => c.name.toLowerCase() === name.toLowerCase()
        );
        if (isDuplicate) {
            toast.error("Você já possui uma categoria com esse nome");
            return;
        }

        setIsCreating(true);
        try {
            await createCategory(name);
            setNewCategoryName("");
            toast.success("Categoria criada com sucesso!");
            onCategoryChange();
        } catch (err: any) {
            toast.error(err.message || "Erro ao criar categoria");
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdate = async (id: string) => {
        const name = editName.trim();
        const originalCategory = customCategories.find(c => c.id === id);

        if (!name || name === originalCategory?.name) {
            setEditingId(null);
            return;
        }

        if (name.length < 2) {
            toast.error("O nome deve ter pelo menos 2 caracteres");
            return;
        }

        setIsUpdating(true);
        try {
            await updateCategory(id, name);
            toast.success("Categoria atualizada com sucesso!");
            setEditingId(null);
            onCategoryChange();
        } catch (err: any) {
            toast.error(err.message || "Erro ao atualizar categoria");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        setDeletingId(id);
        try {
            await deleteCategory(id);
            toast.success(`Categoria "${name}" removida`);
            onCategoryChange();
        } catch (err: any) {
            // Se houver transações, o backend retornará o erro tratado no Service
            toast.error(err.message || "Erro ao deletar categoria");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Card className="border-none shadow-none">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <FolderOpen className="size-5 text-primary" />
                    <div>
                        <CardTitle>Gerenciar Categorias</CardTitle>
                        <CardDescription>
                            Personalize suas categorias (máx. 20)
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handleCreate} className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="new-category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nova categoria</Label>
                        <Input
                            id="new-category"
                            placeholder="Ex: Freelance, Streaming..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            maxLength={50}
                            disabled={isCreating || customCategories.length >= 20}
                            className="bg-secondary/50 border-border/50"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isCreating || !newCategoryName.trim() || customCategories.length >= 20}
                        className="cursor-pointer gap-2"
                    >
                        {isCreating ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Plus className="size-4" />
                        )}
                        Adicionar
                    </Button>
                </form>

                {customCategories.length >= 20 && (
                    <p className="text-sm text-amber-500 font-medium">
                        Limite de 20 categorias atingido.
                    </p>
                )}

                <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categorias globais</h4>
                    <div className="flex flex-wrap gap-2">
                        {GLOBAL_CATEGORIES.map(([key, label]) => (
                            <span
                                key={key}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border/30"
                            >
                                <Tag className="size-3 text-muted-foreground" />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Minhas categorias</h4>
                        <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{customCategories.length}/20</span>
                    </div>

                    {customCategories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border/50 rounded-xl">
                            <Tag className="size-8 text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground font-medium">Nenhuma categoria customizada</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {customCategories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/50 transition-all group border border-transparent hover:border-border/50"
                                >
                                    <div className="flex-1 flex items-center gap-2.5">
                                        <span className="size-2 rounded-full bg-primary/60" />
                                        {editingId === cat.id ? (
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-8 text-sm py-0 w-full max-w-[200px] bg-background"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleUpdate(cat.id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                            />
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground">{cat.name}</span>
                                                <span className="text-[10px] text-muted-foreground/70">
                                                    Criada em {new Date(cat.createdAt).toLocaleDateString("pt-BR")}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {editingId === cat.id ? (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-accent hover:text-accent hover:bg-accent/10"
                                                    onClick={() => handleUpdate(cat.id)}
                                                    disabled={isUpdating}
                                                >
                                                    {isUpdating ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setEditingId(null)}
                                                >
                                                    <X className="size-3.5" />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => {
                                                        setEditingId(cat.id);
                                                        setEditName(cat.name);
                                                    }}
                                                >
                                                    <Pencil className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDelete(cat.id, cat.name)}
                                                    disabled={deletingId === cat.id}
                                                >
                                                    {deletingId === cat.id ? (
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="size-3.5" />
                                                    )}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}