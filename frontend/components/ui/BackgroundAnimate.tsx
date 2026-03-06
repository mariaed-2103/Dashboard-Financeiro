"use client"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { useEffect } from "react"

export function BackgroundAnimate() {
    // Valores brutos da posição do mouse
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Adiciona suavização (mola) para o movimento parecer "caro/chique"
    const springConfig = { damping: 50, stiffness: 200 }
    const softX = useSpring(mouseX, springConfig)
    const softY = useSpring(mouseY, springConfig)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Centraliza o orbe no cursor (subtraindo metade do tamanho dele)
            mouseX.set(e.clientX - 250)
            mouseY.set(e.clientY - 250)
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [mouseX, mouseY])

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050507]">
            {/* Orbe Principal (Segue o mouse com suavização) */}
            <motion.div
                className="absolute size-[500px] rounded-full bg-primary/50 blur-[120px]"
                style={{
                    x: softX,
                    y: softY,
                }}
            />

            {/* Orbe Secundário Estático (Pulsa no fundo) */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-[-10%] right-[-10%] size-[600px] rounded-full bg-accent/10 blur-[100px]"
            />

            {/* Efeito de Granulado (Opcional, dá um toque premium de papel/ruído) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Grade de fundo sutil */}
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        </div>
    )
}