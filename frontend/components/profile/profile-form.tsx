"use client"

import { useState } from "react"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUserName } from "@/services/api"
import { toast } from "sonner"

interface ProfileFormProps {
    name: string
    email: string
    onNameUpdated: () => void
}

export function ProfileForm({ name, email, onNameUpdated }: ProfileFormProps) {
    const [currentName, setCurrentName] = useState(name)
    const [isSaving, setIsSaving] = useState(false)

    const hasChanges = currentName.trim() !== name
    const isValid = currentName.trim().length > 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isValid || !hasChanges) return

        setIsSaving(true)
        try {
            await updateUserName(currentName.trim())
            toast.success("Nome atualizado com sucesso!")
            onNameUpdated()
        } catch {
            toast.error("Erro ao atualizar nome. Tente novamente.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card className="bg-card border-border/50">
            <CardHeader>
                <CardTitle className="text-foreground">Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name" className="text-muted-foreground">
                            Nome
                        </Label>
                        <Input
                            id="name"
                            value={currentName}
                            onChange={(e) => setCurrentName(e.target.value)}
                            placeholder="Seu nome"
                            className="bg-muted border-border/50 text-foreground placeholder:text-muted-foreground/50"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email" className="text-muted-foreground">
                            Email
                        </Label>
                        <Input
                            id="email"
                            value={email}
                            disabled
                            className="bg-muted/50 border-border/50 text-muted-foreground cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground/70">
                            O email n&atilde;o pode ser alterado.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSaving || !hasChanges || !isValid}
                        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 self-end"
                    >
                        {isSaving ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Save className="size-4" />
                        )}
                        {isSaving ? "Salvando..." : "Salvar altera\u00e7\u00f5es"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
