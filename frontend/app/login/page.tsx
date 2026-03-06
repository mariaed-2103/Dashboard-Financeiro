"use client"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { BackgroundAnimate } from "@/components/ui/BackgroundAnimate"
import { motion } from "framer-motion"
import Image from "next/image" // Importante para otimização

function LoginContent() {
    const searchParams = useSearchParams()
    const registered = searchParams.get("registered")

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6">
            <BackgroundAnimate />

            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-[420px]"
            >
                <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 p-10 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] flex flex-col gap-8">

                    {/* Header com Logo Clarus */}
                    <div className="flex flex-col items-center gap-4 text-center">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="relative size-20 mb-2"
                        >
                            <Image
                                src="/logo.png" // Certifique-se que o arquivo está na pasta public
                                alt="Clarus Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </motion.div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold tracking-tight text-white">
                                Bem-vindo
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                Acesse sua conta Clarus
                            </p>
                        </div>
                    </div>

                    {registered && (
                        <div className="rounded-xl bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent text-center">
                            Conta criada com sucesso!
                        </div>
                    )}

                    <LoginForm />
                </div>
            </motion.main>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense><LoginContent /></Suspense>
    )
}