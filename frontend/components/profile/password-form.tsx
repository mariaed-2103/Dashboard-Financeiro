"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUserPassword } from "@/services/api"
import { toast } from "sonner"

export function PasswordForm() {
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const passwordsMatch = newPassword === confirmPassword
    const isValid =
        currentPassword.trim().length > 0 &&
        newPassword.trim().length >= 6 &&
        confirmPassword.trim().length > 0 &&
        passwordsMatch

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isValid) {
            if (!passwordsMatch) {
                toast.error("As senhas não coincidem.")
            }
            return
        }

        setIsSaving(true)
        try {
            await updateUserPassword(currentPassword, newPassword)
            toast.success("Senha atualizada com sucesso!")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch {
            toast.error("Erro ao atualizar senha. Verifique a senha atual e tente novamente.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card className="bg-card border-border/50">
            <CardHeader>
                <CardTitle className="text-foreground">Alterar Senha</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="currentPassword" className="text-muted-foreground">
                            Senha atual
                        </Label>
                        <div className="relative">
                            <Input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Digite sua senha atual"
                                className="bg-muted border-border/50 text-foreground placeholder:text-muted-foreground/50 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={showCurrentPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {showCurrentPassword ? (
                                    <EyeOff className="size-4" />
                                ) : (
                                    <Eye className="size-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="newPassword" className="text-muted-foreground">
                            Nova senha
                        </Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                className="bg-muted border-border/50 text-foreground placeholder:text-muted-foreground/50 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {showNewPassword ? (
                                    <EyeOff className="size-4" />
                                ) : (
                                    <Eye className="size-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="confirmPassword" className="text-muted-foreground">
                            Confirmar nova senha
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repita a nova senha"
                                className={`bg-muted border-border/50 text-foreground placeholder:text-muted-foreground/50 pr-10 ${
                                    confirmPassword && !passwordsMatch
                                        ? "border-destructive focus-visible:ring-destructive"
                                        : ""
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="size-4" />
                                ) : (
                                    <Eye className="size-4" />
                                )}
                            </button>
                        </div>
                        {confirmPassword && !passwordsMatch && (
                            <p className="text-xs text-destructive">As senhas n&atilde;o coincidem.</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isSaving || !isValid}
                        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 self-end"
                    >
                        {isSaving ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Lock className="size-4" />
                        )}
                        {isSaving ? "Atualizando..." : "Atualizar senha"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
