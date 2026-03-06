"use client"

import { RegisterForm } from "@/components/register-form"
import { BackgroundAnimate } from "@/components/ui/BackgroundAnimate"
import { motion } from "framer-motion"
import Image from "next/image"

export default function RegisterPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
            <BackgroundAnimate />

            <motion.main
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="z-10 w-full max-w-lg"
            >
                <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 p-10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] flex flex-col gap-8">

                    {/* Header com Logo Clarus */}
                    <div className="flex flex-col items-center gap-4 text-center">
                        <motion.div
                            initial={{ rotate: -10, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            className="relative size-20 mb-2"
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
                            <h2 className="text-3xl font-bold tracking-tight text-white">
                                Crie sua conta
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                Junte-se ao Clarus e assuma o controle
                            </p>
                        </div>
                    </div>

                    <RegisterForm />
                </div>
            </motion.main>
        </div>
    )
}