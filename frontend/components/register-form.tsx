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

    /*
      Mobile-first:
      - h-11 (44px) no mobile — tamanho mínimo para área de toque acessível
      - sm:h-12 em telas maiores para mais respiro visual
      - text-sm em todas as telas para não cortar em 360px
    */
    const inputClasses = `
        pl-10 h-11 sm:h-12
        bg-background/40 border-border
        focus:border-accent/50 focus:ring-2 focus:ring-accent/20
        transition-all duration-300
        text-sm text-foreground placeholder:text-muted-foreground
        w-full rounded-xl
    `

    /* Componente reutilizável para label dos campos */
    const FieldLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
        <Label htmlFor={htmlFor} className="text-foreground/80 text-xs sm:text-sm">
            {children}
        </Label>
    )

    /* Botão de toggle de visibilidade de senha com área de toque generosa */
    const PasswordToggle = ({ show, onToggle, label }: { show: boolean, onToggle: () => void, label: string }) => (
        <button
            type="button"
            onClick={onToggle}
            className="
                absolute right-0 top-0 bottom-0
                w-11 flex items-center justify-center
                text-muted-foreground hover:text-accent
                transition-colors z-20 focus:outline-none
                cursor-pointer
            "
            aria-label={label}
        >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
    )

    return (
        // gap-4 no mobile, gap-5 em sm+ — evita que o form fique alto demais em 360px
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
            {/* Nome e Email seguem o padrão relative + flex items-center */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
                <Label htmlFor="name" className="text-foreground/80 text-xs sm:text-sm">Nome</Label>
                <div className="relative flex items-center">
                    <User className="absolute left-3 size-4 text-muted-foreground z-10" />
                    <Input id="name" type="text" placeholder="Seu nome completo" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} required />
                </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground shrink-0" />
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

            {/* Senha */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
                <Label htmlFor="password" className="text-foreground/80 text-xs sm:text-sm">Senha</Label>
                <div className="relative flex items-center">
                    <Lock className="absolute left-3 size-4 text-muted-foreground z-10" />
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Ex: Clarus@2026"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClasses} pr-11`}
                        required
                    />
                    <PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} label="Mostrar senha" />
                </div>
            </div>

            {/* Confirmar Senha */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
                <Label htmlFor="confirmPassword" className="text-foreground/80 text-xs sm:text-sm">Confirmar senha</Label>
                <div className="relative flex items-center">
                    <Lock className="absolute left-3 size-4 text-muted-foreground z-10" />
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

            {/* Erro — texto menor no mobile, itens em items-start para quebra de linha */}
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

            {/* Botão submit */}
            <Button
                type="submit"
                disabled={loading}
                className="
                    cursor-pointer
                    h-11 sm:h-12 w-full
                    bg-primary text-primary-foreground hover:bg-primary/90
                    font-semibold text-sm tracking-wide
                    transition-all active:scale-[0.98]
                    mt-1
                "
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

            <p className="text-center text-xs sm:text-sm text-muted-foreground">
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