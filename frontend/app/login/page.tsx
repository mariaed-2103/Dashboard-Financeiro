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
        <div className="relative min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 overflow-hidden">
            <BackgroundAnimate />

            <motion.main
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="z-10 w-full max-w-sm sm:max-w-[420px]"
            >
                {/* Card principal */}
                <div className="
                    relative
                    bg-[#0f0f1a]/90
                    backdrop-blur-3xl
                    border border-[rgba(147,51,234,0.2)]
                    p-7 sm:p-10
                    rounded-3xl
                    shadow-[0_0_100px_rgba(147,51,234,0.15),0_0_60px_rgba(254,80,0,0.08),0_32px_64px_rgba(8,8,15,0.9)]
                    flex flex-col gap-7 sm:gap-8
                    overflow-hidden
                ">
                    {/* Borda gradiente animada no topo */}
                    <div
                        className="absolute top-0 left-0 right-0 h-[2px]"
                        style={{
                            background: "linear-gradient(90deg, transparent, #fe5000, #c026d3, #9333ea, transparent)",
                        }}
                    />

                    {/* Glow interno no canto */}
                    <div
                        className="absolute -top-20 -right-20 size-48 rounded-full opacity-30 pointer-events-none"
                        style={{
                            background: "radial-gradient(circle at center, rgba(147,51,234,0.6), transparent 70%)",
                            filter: "blur(30px)",
                        }}
                    />
                    <div
                        className="absolute -bottom-16 -left-16 size-40 rounded-full opacity-20 pointer-events-none"
                        style={{
                            background: "radial-gradient(circle at center, rgba(254,80,0,0.5), transparent 70%)",
                            filter: "blur(25px)",
                        }}
                    />

                    {/* Header */}
                    <div className="flex flex-col items-center gap-3 sm:gap-4 text-center relative z-10">
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                            className="relative size-16 sm:size-20 animate-float-gentle"
                            style={{ filter: "drop-shadow(0 0 20px rgba(147,51,234,0.7))" }}
                        >
                            <Image src="/logo.png" alt="Clarus Logo" fill className="object-contain" priority />
                        </motion.div>

                        <div className="space-y-1.5">
                            <h2 className="text-gradient text-2xl sm:text-3xl font-black tracking-tight">
                                Bem-vindo
                            </h2>
                            <p className="text-muted-foreground/60 text-xs sm:text-sm">
                                Acesse sua conta Clarus
                            </p>
                        </div>
                    </div>

                    {registered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative rounded-2xl px-4 py-3 text-xs sm:text-sm text-emerald-400 text-center z-10 border border-emerald-500/20 bg-emerald-500/8"
                        >
                            🎉 Conta criada com sucesso!
                        </motion.div>
                    )}

                    <div className="relative z-10">
                        <LoginForm />
                    </div>
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