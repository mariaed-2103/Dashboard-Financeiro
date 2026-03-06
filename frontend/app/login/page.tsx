"use client"

import { useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { AuthSidePanel } from "@/components/auth-side-panel"
import { BackgroundAnimate } from "@/components/ui/BackgroundAnimate"
import { Suspense } from "react"

function LoginContent() {
    const searchParams = useSearchParams()
    const registered = searchParams.get("registered")

    return (
        <div className="relative grid min-h-svh lg:grid-cols-2 overflow-hidden">
            <BackgroundAnimate />
            <AuthSidePanel />

            <main className="z-10 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm backdrop-blur-xl bg-card/30 border border-white/10 p-8 rounded-2xl shadow-2xl flex flex-col gap-8">
                    <div className="flex flex-col gap-2 text-center lg:text-left">
                        <div className="flex items-center gap-3 lg:hidden mb-4 justify-center">
                            <div className="size-9 rounded-lg bg-accent/20 flex items-center justify-center">
                                <svg
                                    className="size-5 text-accent"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                >
                                    <path d="M3 3v18h18" />
                                    <path d="m19 9-5 5-4-4-3 3" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold text-foreground">FinanceDash</span>
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                            Bem-vindo de volta
                        </h2>
                        <p className="text-sm text-muted-foreground text-balance">
                            Entre com suas credenciais para acessar o painel
                        </p>
                    </div>

                    {registered && (
                        <div className="rounded-md bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent animate-in fade-in zoom-in duration-300">
                            Conta criada com sucesso! Faça login para continuar.
                        </div>
                    )}

                    <LoginForm />
                </div>
            </main>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginContent />
        </Suspense>
    )
}