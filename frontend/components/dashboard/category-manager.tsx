"use client";

import { useState } from "react";
import type { UserCategory } from "@/types/transaction";
import { CATEGORY_LABELS } from "@/types/transaction";
import type { Category } from "@/types/transaction";
import { createCategory, deleteCategory } from "@/services/categories";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Tag, Loader2, FolderOpen } from "lucide-react";
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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        const name = newCategoryName.trim();
        if (!name) return;

        if (name.length < 2) {
            toast.error("O nome deve ter pelo menos 2 caracteres");
            return;
        }

        if (name.length > 50) {
            toast.error("O nome deve ter no maximo 50 caracteres");
            return;
        }

        // Verificar se ja existe como global
        const isGlobal = GLOBAL_CATEGORIES.some(
            ([key]) => key.toLowerCase() === name.toLowerCase()
        );
        if (isGlobal) {
            toast.error("Essa categoria ja existe como categoria global");
            return;
        }

        // Verificar se ja existe como custom
        const isDuplicate = customCategories.some(
            (c) => c.name.toLowerCase() === name.toLowerCase()
        );
        if (isDuplicate) {
            toast.error("Voce ja possui uma categoria com esse nome");
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

    const handleDelete = async (id: string, name: string) => {
        setDeletingId(id);
        try {
            await deleteCategory(id);
            toast.success(`Categoria "${name}" removida`);
            onCategoryChange();
        } catch (err: any) {
            toast.error(err.message || "Erro ao deletar categoria");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <FolderOpen className="size-5 text-muted-foreground" />
                    <div>
                        <CardTitle>Gerenciar Categorias</CardTitle>
                        <CardDescription>
                            Crie categorias personalizadas para organizar suas transacoes (max. 20)
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Formulario para criar nova categoria */}
                <form onSubmit={handleCreate} className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="new-category">Nova categoria</Label>
                        <Input
                            id="new-category"
                            placeholder="Ex: Freelance, Streaming, Pet..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            maxLength={50}
                            disabled={isCreating || customCategories.length >= 20}
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
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                        Limite de 20 categorias atingido. Remova uma antes de adicionar outra.
                    </p>
                )}

                {/* Categorias globais */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Categorias globais</h4>
                    <div className="flex flex-wrap gap-2">
                        {GLOBAL_CATEGORIES.map(([key, label]) => (
                            <span
                                key={key}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
                            >
                <Tag className="size-3" />
                                {label}
              </span>
                        ))}
                    </div>
                </div>

                {/* Categorias customizadas */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-muted-foreground">Minhas categorias</h4>
                        <span className="text-xs text-muted-foreground">{customCategories.length}/20</span>
                    </div>
                    {customCategories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Tag className="size-8 text-muted-foreground/40 mb-2" />
                            <p className="text-sm text-muted-foreground">
                                Voce ainda nao possui categorias personalizadas
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                                Crie uma acima para comecar a organizar melhor
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {customCategories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className="size-2 rounded-full bg-primary" />
                                        <span className="text-sm font-medium text-foreground">{cat.name}</span>
                                        <span className="text-xs text-muted-foreground">
                      {new Date(cat.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="cursor-pointer size-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(cat.id, cat.name)}
                                        disabled={deletingId === cat.id}
                                    >
                                        {deletingId === cat.id ? (
                                            <Loader2 className="size-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="size-3.5" />
                                        )}
                                        <span className="sr-only">Remover categoria {cat.name}</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
