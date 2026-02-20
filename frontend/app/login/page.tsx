"use client"

import { useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { AuthSidePanel } from "@/components/auth-side-panel"
import { Suspense } from "react"

function LoginContent() {
    const searchParams = useSearchParams()
    const registered = searchParams.get("registered")

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <AuthSidePanel />

            <main className="flex items-center justify-center bg-background px-6 py-12">
                <div className="w-full max-w-sm flex flex-col gap-8">
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
                        <h2 className="text-2xl font-bold tracking-tight text-foreground text-balance">
                            Bem-vindo de volta
                        </h2>
                        <p className="text-sm text-muted-foreground text-balance">
                            Entre com suas credenciais para acessar o painel
                        </p>
                    </div>

                    {registered && (
                        <div className="rounded-md bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent">
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
