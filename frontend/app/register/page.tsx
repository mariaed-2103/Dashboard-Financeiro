"use client"

import { RegisterForm } from "@/components/register-form"
import { BackgroundAnimate } from "@/components/ui/BackgroundAnimate"
import { motion } from "framer-motion"
import Image from "next/image"

export default function RegisterPage() {
    return (
        // Mobile-first: padding menor no mobile, cresce em sm+
        <div className="relative min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 overflow-hidden">
            <BackgroundAnimate />

            <motion.main
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                // Mobile-first: full width no mobile, max-w-lg em sm+
                className="z-10 w-full max-w-sm sm:max-w-lg"
            >
                {/*
                  Mobile-first: padding compacto em mobile (p-6),
                  mais espaçoso em sm+ (sm:p-10).
                */}
                <div className="
                    backdrop-blur-2xl bg-white/[0.03] border border-white/10
                    p-6 sm:p-10
                    rounded-2xl sm:rounded-[2.5rem]
                    shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]
                    flex flex-col gap-6 sm:gap-8
                ">
                    {/* Header com Logo */}
                    <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
                        <motion.div
                            initial={{ rotate: -10, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            // Mobile-first: logo menor no mobile
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
                            {/* Mobile-first: texto menor no mobile */}
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                Crie sua conta
                            </h2>
                            <p className="text-muted-foreground text-xs sm:text-sm">
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