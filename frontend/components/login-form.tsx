"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginUser, saveToken } from "@/services/auth"
import { motion } from "framer-motion"

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

    /*
      Mobile-first:
      - h-11 no mobile (mais fácil de tocar, ~44px = mínimo recomendado por HIG)
      - sm:h-12 em telas maiores
      - text-sm no mobile, sem mudança em sm (já é legível)
      - rounded-xl consistente
    */
    const inputClasses = `
        pl-11 h-11 sm:h-12
        bg-white/[0.05] border-white/10
        focus:border-accent/40 focus:ring-accent/10
        transition-all duration-300
        text-sm text-white placeholder:text-muted-foreground/50
        rounded-xl w-full
    `

    return (
        // gap-4 no mobile, gap-5 em sm+
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
            {/* Campo Email */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
                <Label
                    htmlFor="email"
                    className="text-white/70 ml-1 text-xs uppercase tracking-wider font-semibold"
                >
                    Email
                </Label>
                <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 sm:left-4 size-4 text-muted-foreground z-10 shrink-0" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClasses}
                        // autoComplete melhora UX no mobile (abre teclado certo)
                        autoComplete="email"
                        inputMode="email"
                        required
                    />
                </div>
            </div>

            {/* Campo Senha */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
                <Label
                    htmlFor="password"
                    className="text-white/70 ml-1 text-xs uppercase tracking-wider font-semibold"
                >
                    Senha
                </Label>
                <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 sm:left-4 size-4 text-muted-foreground z-10 shrink-0" />
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClasses} pr-12`}
                        autoComplete="current-password"
                        required
                    />
                    {/* Botão de toggle: área de toque generosa no mobile */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="
                            cursor-pointer absolute right-0
                            w-12 h-full
                            flex items-center justify-center
                            text-muted-foreground hover:text-accent
                            transition-colors z-10 focus:outline-none
                        "
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                </div>
            </div>

            {/* Erro */}
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
                    {/* items-start + mt-0.5 no ícone evita desalinhamento quando o texto quebra linha */}
                    <p className="font-medium leading-snug">{error}</p>
                </motion.div>
            )}

            {/* Botão submit — h-11 mobile, h-12 sm+ para área de toque adequada */}
            <Button
                type="submit"
                disabled={loading}
                className="
                    cursor-pointer
                    h-11 sm:h-12 w-full
                    bg-gradient-to-r from-primary to-[#3a56ff]
                    hover:opacity-90 text-white font-bold
                    rounded-xl transition-all
                    hover:scale-[1.01] active:scale-[0.98]
                    shadow-lg shadow-primary/20
                    mt-1 sm:mt-2
                    text-sm sm:text-base
                "
                size="lg"
            >
                {loading ? (
                    <Loader2 className="size-5 animate-spin" />
                ) : (
                    "Entrar"
                )}
            </Button>

            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
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