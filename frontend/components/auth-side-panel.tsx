import { TrendingUp, ShieldCheck, BarChart3 } from "lucide-react"

export function AuthSidePanel() {
    return (
        <div className="hidden lg:flex flex-col justify-between bg-secondary p-12 text-secondary-foreground relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 -right-20 size-64 rounded-full bg-accent" />
                <div className="absolute bottom-20 -left-10 size-40 rounded-full bg-primary" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <BarChart3 className="size-5 text-accent" />
                    </div>
                    <h1 className="text-xl font-bold text-secondary-foreground">FinanceDash</h1>
                </div>
                <p className="text-sm text-secondary-foreground/60">Dashboard Financeiro</p>
            </div>

            <div className="relative z-10 flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                    <FeatureItem
                        icon={<TrendingUp className="size-5 text-accent" />}
                        title="Controle Total"
                        description="Acompanhe receitas, despesas e investimentos em tempo real."
                    />
                    <FeatureItem
                        icon={<ShieldCheck className="size-5 text-accent" />}
                        title="Segurança"
                        description="Seus dados protegidos com criptografia de ponta a ponta."
                    />
                    <FeatureItem
                        icon={<BarChart3 className="size-5 text-accent" />}
                        title="Relatórios"
                        description="Visualize seus dados com gráficos e relatórios inteligentes."
                    />
                </div>
            </div>

            <div className="relative z-10">
                <p className="text-xs text-secondary-foreground/40">
                    {"© 2026 Clarus. Todos os direitos reservados."}
                </p>
            </div>
        </div>
    )
}

function FeatureItem({
                         icon,
                         title,
                         description,
                     }: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <div className="flex gap-4 items-start">
            <div className="size-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <h3 className="font-semibold text-sm text-secondary-foreground">{title}</h3>
                <p className="text-xs text-secondary-foreground/60 leading-relaxed mt-1">{description}</p>
            </div>
        </div>
    )
}
