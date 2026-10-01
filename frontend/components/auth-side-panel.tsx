import { TrendingUp, ShieldCheck, BarChart3 } from "lucide-react"

export function AuthSidePanel() {
    return (
        <div className="hidden lg:flex flex-col justify-between relative overflow-hidden p-12 text-secondary-foreground"
            style={{ background: "linear-gradient(160deg, #08080f 0%, #12061f 45%, #0f0615 100%)" }}
        >
            {/* Orbe roxo grande */}
            <div className="absolute top-[-20%] right-[-20%] size-[600px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle at center, rgba(147,51,234,0.4) 0%, rgba(109,40,217,0.2) 40%, transparent 70%)", filter: "blur(80px)" }} />

            {/* Orbe laranja canto inferior */}
            <div className="absolute bottom-[-15%] left-[-10%] size-[400px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle at center, rgba(254,80,0,0.35) 0%, rgba(192,38,211,0.15) 50%, transparent 75%)", filter: "blur(60px)" }} />

            {/* Linha separadora direita */}
            <div className="absolute right-0 top-[8%] bottom-[8%] w-[1px]"
                style={{ background: "linear-gradient(180deg, transparent, rgba(147,51,234,0.3), rgba(254,80,0,0.2), transparent)" }} />

            {/* Granulado */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

            {/* Logo */}
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="size-11 rounded-2xl flex items-center justify-center relative overflow-hidden"
                        style={{ background: "linear-gradient(135deg, rgba(254,80,0,0.25), rgba(147,51,234,0.2))", border: "1px solid rgba(147,51,234,0.35)", boxShadow: "0 0 20px rgba(147,51,234,0.3)" }}>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent" />
                        <BarChart3 className="size-5 relative z-10" style={{ color: "#c084fc" }} />
                    </div>
                    <h1 className="text-xl font-black tracking-tight" style={{ background: "linear-gradient(135deg, #fe5000, #c026d3, #9333ea)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        Clarus
                    </h1>
                </div>
                <p className="text-sm" style={{ color: "rgba(192,132,252,0.4)" }}>Dashboard Financeiro</p>
            </div>

            {/* Features */}
            <div className="relative z-10 flex flex-col gap-6">
                <FeatureItem
                    icon={<TrendingUp className="size-5" style={{ color: "#c084fc" }} />}
                    title="Controle Total"
                    description="Acompanhe receitas, despesas e investimentos em tempo real."
                    gradient="linear-gradient(135deg, rgba(254,80,0,0.2), rgba(147,51,234,0.12))"
                />
                <FeatureItem
                    icon={<ShieldCheck className="size-5" style={{ color: "#c084fc" }} />}
                    title="Segurança"
                    description="Seus dados protegidos com criptografia de ponta a ponta."
                    gradient="linear-gradient(135deg, rgba(192,38,211,0.2), rgba(147,51,234,0.12))"
                />
                <FeatureItem
                    icon={<BarChart3 className="size-5" style={{ color: "#c084fc" }} />}
                    title="Relatórios"
                    description="Visualize seus dados com gráficos e relatórios inteligentes."
                    gradient="linear-gradient(135deg, rgba(147,51,234,0.2), rgba(109,40,217,0.12))"
                />
            </div>

            {/* Rodapé */}
            <div className="relative z-10">
                <p className="text-xs" style={{ color: "rgba(192,132,252,0.25)" }}>
                    {"© 2026 Clarus. Todos os direitos reservados."}
                </p>
            </div>
        </div>
    )
}

function FeatureItem({ icon, title, description, gradient }: {
    icon: React.ReactNode; title: string; description: string; gradient: string;
}) {
    return (
        <div className="flex gap-4 items-start group">
            <div className="size-11 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden transition-all duration-300 group-hover:scale-105"
                style={{ background: gradient, border: "1px solid rgba(147,51,234,0.22)", boxShadow: "0 0 14px rgba(147,51,234,0.15)" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
                <div className="relative z-10">{icon}</div>
            </div>
            <div>
                <h3 className="font-bold text-sm text-white/80">{title}</h3>
                <p className="text-xs leading-relaxed mt-1" style={{ color: "rgba(192,132,252,0.4)" }}>{description}</p>
            </div>
        </div>
    )
}
