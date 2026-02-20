"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginUser, saveToken } from "@/services/auth"

export function LoginForm() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const response = await loginUser({ email, password })
            saveToken(response.token)
            router.push("/dashboard")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao fazer login")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-foreground/80">
                    Email
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-accent focus-visible:border-accent"
                        required
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-foreground/80">
                    Senha
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-accent focus-visible:border-accent"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm tracking-wide"
                size="lg"
            >
                {loading ? (
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        Entrando...
                    </>
                ) : (
                    "Entrar"
                )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                {"Ainda não tem conta? "}
                <Link
                    href="/register"
                    className="text-accent hover:text-accent/80 font-medium transition-colors"
                >
                    Cadastre-se
                </Link>
            </p>
        </form>
    )
}
