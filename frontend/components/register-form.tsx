"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerUser } from "@/services/auth"
import { motion } from "framer-motion"

export function RegisterForm() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    // Validação de senha forte
    const isPasswordStrong = (pass: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const isObvious = /123|abc|password|qwerty|clarus/i.test(pass);
        return regex.test(pass) && !isObvious;
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("As senhas não coincidem")
            return
        }

        if (!isPasswordStrong(password)) {
            setError("A senha deve ter 8+ caracteres, incluir maiúsculas, números e símbolos (ex: @#$).")
            return
        }

        setLoading(true)

        try {
            await registerUser({ name, email, password })
            router.push("/login?registered=true")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao cadastrar")
        } finally {
            setLoading(false)
        }
    }

    const inputClasses = "pl-10 h-11 bg-background/40 border-border focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300 text-foreground placeholder:text-muted-foreground"

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-foreground/80">Nome</Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClasses}
                        required
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-foreground/80">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
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
                <Label htmlFor="password" className="text-foreground/80">Senha</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="8+ caracteres (Ex: Clarus@2026)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClasses} pr-10`}
                        required
                        minLength={8}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword" className="text-foreground/80">Confirmar senha</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repita a senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${inputClasses} pr-10`}
                        required
                        minLength={8}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                        aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-xl bg-destructive/15 border border-destructive/20 px-4 py-3 text-sm text-red-400"
                >
                    <AlertCircle className="size-4 shrink-0" />
                    <p className="font-medium text-left">{error}</p>
                </motion.div>
            )}

            <Button
                type="submit"
                disabled={loading}
                className="cursor-pointer h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm tracking-wide transition-all active:scale-[0.98]"
                size="lg"
            >
                {loading ? (
                    <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Cadastrando...
                    </>
                ) : (
                    "Criar conta"
                )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                {"Já tem uma conta? "}
                <Link
                    href="/login"
                    className="text-accent hover:text-accent/80 font-medium transition-colors"
                >
                    Fazer login
                </Link>
            </p>
        </form>
    )
}