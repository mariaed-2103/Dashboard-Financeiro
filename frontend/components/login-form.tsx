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

    // pl-11 garante que o texto comece após o ícone
    const inputClasses = "pl-11 h-12 bg-white/[0.05] border-white/10 focus:border-accent/40 focus:ring-accent/10 transition-all duration-300 text-white placeholder:text-muted-foreground/50 rounded-xl w-full"

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-white/70 ml-1 text-xs uppercase tracking-wider font-semibold">
                    Email
                </Label>
                <div className="relative flex items-center">
                    <Mail className="absolute left-4 size-4 text-muted-foreground z-10" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClasses}
                        required
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-white/70 ml-1 text-xs uppercase tracking-wider font-semibold">
                    Senha
                </Label>
                <div className="relative flex items-center">
                    <Lock className="absolute left-4 size-4 text-muted-foreground z-10" />
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClasses} pr-12`}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-muted-foreground hover:text-accent transition-colors z-10 focus:outline-none"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-1 text-center font-medium">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-gradient-to-r from-primary to-[#3a56ff] hover:opacity-90 text-white font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-primary/20 mt-2"
                size="lg"
            >
                {loading ? (
                    <Loader2 className="size-5 animate-spin" />
                ) : (
                    "Entrar"
                )}
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-2">
                {"Ainda não tem conta? "}
                <Link
                    href="/register"
                    className="text-accent hover:text-accent/80 font-semibold transition-colors underline-offset-4 hover:underline"
                >
                    Cadastre-se
                </Link>
            </p>
        </form>
    )
}