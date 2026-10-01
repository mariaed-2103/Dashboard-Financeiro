"use client"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { useEffect } from "react"

export function BackgroundAnimate() {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const springConfig = { damping: 40, stiffness: 150 }
    const softX = useSpring(mouseX, springConfig)
    const softY = useSpring(mouseY, springConfig)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX - 300)
            mouseY.set(e.clientY - 300)
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [mouseX, mouseY])

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#08080f]">

            {/* ── Orbe laranja (segue o mouse) ──────────────── */}
            <motion.div
                className="absolute size-[600px] rounded-full"
                style={{
                    x: softX,
                    y: softY,
                    background: "radial-gradient(circle at center, rgba(254,80,0,0.45) 0%, rgba(192,38,211,0.2) 45%, transparent 75%)",
                    filter: "blur(90px)",
                }}
            />

            {/* ── Orbe roxo grande (deriva lento) ───────────── */}
            <motion.div
                animate={{
                    x: [0, -60, 40, 0],
                    y: [0, 40, -50, 0],
                    scale: [1, 1.15, 0.9, 1],
                }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[20%] right-[-15%] size-[800px] rounded-full"
                style={{
                    background: "radial-gradient(circle at center, rgba(147,51,234,0.5) 0%, rgba(109,40,217,0.25) 40%, transparent 70%)",
                    filter: "blur(120px)",
                }}
            />

            {/* ── Orbe laranja/rosa (inferior esquerdo) ─────── */}
            <motion.div
                animate={{
                    x: [0, 50, -30, 0],
                    y: [0, -40, 30, 0],
                    opacity: [0.5, 0.8, 0.4, 0.5],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[-15%] left-[-10%] size-[700px] rounded-full"
                style={{
                    background: "radial-gradient(circle at center, rgba(254,80,0,0.35) 0%, rgba(192,38,211,0.2) 40%, transparent 70%)",
                    filter: "blur(100px)",
                }}
            />

            {/* ── Orbe rosa central sutil ────────────────────── */}
            <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                className="absolute top-[30%] left-[40%] size-[400px] rounded-full"
                style={{
                    background: "radial-gradient(circle at center, rgba(192,38,211,0.3) 0%, transparent 70%)",
                    filter: "blur(80px)",
                }}
            />

            {/* ── Ruído/granulado ────────────────────────────── */}
            <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* ── Vinheta nas bordas ─────────────────────────── */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at center, transparent 50%, rgba(8,8,15,0.7) 100%)",
                }}
            />
        </div>
    )
}