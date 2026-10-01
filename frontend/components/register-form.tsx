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

    const isPasswordStrong = (pass: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        const isObvious = /123|abc|password|qwerty|clarus/i.test(pass)
        return regex.test(pass) && !isObvious
    }

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

    const inputClasses = `
        pl-10 h-11 sm:h-12
        bg-[rgba(147,51,234,0.06)] border-[rgba(147,51,234,0.2)]
        hover:border-[rgba(147,51,234,0.4)]
        focus:border-[rgba(254,80,0,0.5)] focus:ring-0 focus:bg-[rgba(147,51,234,0.1)]
        transition-all duration-300
        text-sm text-white placeholder:text-muted-foreground/40
        rounded-xl w-full
    `

    const FieldLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
        <Label htmlFor={htmlFor} className="text-white/70 ml-1 text-xs uppercase tracking-wider font-semibold">
            {children}
        </Label>
    )

    const PasswordToggle = ({ show, onToggle, label }: { show: boolean, onToggle: () => void, label: string }) => (
        <button
            type="button"
            onClick={onToggle}
            className="
                absolute right-0 top-0 bottom-0
                w-11 flex items-center justify-center
                text-muted-foreground hover:text-purple-400
                transition-colors z-20 focus:outline-none
                cursor-pointer
            "
            aria-label={label}
        >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
    )

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
            <div className="flex flex-col gap-1.5 sm:gap-2">
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <div className="relative flex items-center">
                    <User className="absolute left-3.5 size-4 text-muted-foreground z-10 shrink-0" />
                    <Input id="name" type="text" placeholder="Seu nome completo" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} required />
                </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 size-4 text-muted-foreground z-10 shrink-0" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClasses}
                        autoComplete="email"
                        inputMode="email"
                        required
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2">
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 size-4 text-muted-foreground z-10 shrink-0" />
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClasses} pr-11`}
                        required
                    />
                    <PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} label="Mostrar senha" />
                </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2">
                <FieldLabel htmlFor="confirmPassword">Confirmar senha</FieldLabel>
                <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 size-4 text-muted-foreground z-10 shrink-0" />
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repita a senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${inputClasses} pr-11`}
                        required
                    />
                    <PasswordToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} label="Mostrar senha" />
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="
                        flex items-start gap-3
                        rounded-xl bg-destructive/15 border border-destructive/20
                        px-3 py-2.5 sm:px-4 sm:py-3
                        text-xs sm:text-sm text-red-400
                    "
                >
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <p className="font-medium leading-snug text-left">{error}</p>
                </motion.div>
            )}

            <Button
                type="submit"
                disabled={loading}
                className="
                    cursor-pointer
                    h-11 sm:h-12 w-full
                    bg-gradient-to-r from-[#fe5000] via-[#c026d3] to-[#9333ea]
                    hover:opacity-90 text-white font-bold
                    rounded-xl transition-all
                    hover:scale-[1.01] active:scale-[0.98]
                    shadow-[0_0_20px_rgba(254,80,0,0.3),0_4px_16px_rgba(8,8,15,0.5)]
                    hover:shadow-[0_0_35px_rgba(254,80,0,0.5),0_0_60px_rgba(147,51,234,0.3)]
                    mt-1 sm:mt-2
                    text-sm sm:text-base
                "
                size="lg"
            >
                {loading ? (
                    <Loader2 className="size-5 animate-spin" />
                ) : (
                    "Criar conta"
                )}
            </Button>

            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                {"Já tem uma conta? "}
                <Link
                    href="/login"
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors underline-offset-4 hover:underline"
                >
                    Fazer login
                </Link>
            </p>
        </form>
    )
}