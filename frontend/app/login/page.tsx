"use client"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { BackgroundAnimate } from "@/components/ui/BackgroundAnimate"
import { motion } from "framer-motion"
import Image from "next/image"

function LoginContent() {
    const searchParams = useSearchParams()
    const registered = searchParams.get("registered")

    return (
        // Mobile-first: padding horizontal menor em telas pequenas, aumenta em md+
        <div className="relative min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 overflow-hidden">
            <BackgroundAnimate />

            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                // Mobile-first: ocupa largura total no mobile, limita em sm+
                className="z-10 w-full max-w-sm sm:max-w-[420px]"
            >
                {/*
                  Mobile-first: padding menor em telas pequenas (p-6),
                  aumenta em sm+ (sm:p-10). Border-radius menor no mobile.
                */}
                <div className="
                    backdrop-blur-2xl bg-white/[0.03] border border-white/10
                    p-6 sm:p-10
                    rounded-2xl sm:rounded-[2rem]
                    shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]
                    flex flex-col gap-6 sm:gap-8
                ">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            // Mobile-first: logo menor no mobile (size-14), maior em sm+
                            className="relative size-14 sm:size-20 mb-1 sm:mb-2"
                        >
                            <Image
                                src="/logo.png"
                                alt="Clarus Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </motion.div>
                        <div className="space-y-1">
                            {/* Mobile-first: fonte menor no mobile, aumenta em sm+ */}
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                Bem-vindo
                            </h2>
                            <p className="text-muted-foreground text-xs sm:text-sm">
                                Acesse sua conta Clarus
                            </p>
                        </div>
                    </div>

                    {registered && (
                        <div className="rounded-xl bg-accent/10 border border-accent/20 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-accent text-center">
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