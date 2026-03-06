// components/ui/background-animate.tsx
export function BackgroundAnimate() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
            {/* Padrão de Pontos (Grid) */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />

            {/* Esferas de Luz Animadas */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

            {/* Overlay de Vinheta para foco central */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </div>
    )
}