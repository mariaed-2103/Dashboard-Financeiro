"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, LogOut, Loader2 } from "lucide-react"

import { ProfileAvatar } from "@/components/profile/profile-avatar"
import { ProfileForm } from "@/components/profile/profile-form"
import { PasswordForm } from "@/components/profile/password-form"

import { getUserProfile } from "@/services/api"
import type { UserProfile } from "@/services/api"
import { getToken, removeToken } from "@/services/auth"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster, toast } from "sonner"

export default function ProfilePage() {
    const router = useRouter()
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const [user, setUser] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!getToken()) {
            router.replace("/login")
        } else {
            setIsCheckingAuth(false)
        }
    }, [router])

    const loadProfile = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const profile = await getUserProfile()
            setUser(profile)
        } catch (err) {
            const apiError = err as Error & { status?: number }
            if (apiError.status === 401) {
                removeToken()
                router.replace("/login")
                return
            }
            setError("Erro ao carregar perfil. Tente novamente.")
            toast.error("Erro ao carregar perfil.")
        } finally {
            setIsLoading(false)
        }
    }, [router])

    useEffect(() => {
        if (!isCheckingAuth) loadProfile()
    }, [isCheckingAuth, loadProfile])

    const handleLogout = () => {
        removeToken()
        router.push("/login")
    }

    if (isCheckingAuth) return null

    return (
        <div className="min-h-svh bg-background flex flex-col">
            <Toaster position="top-right" />

            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card">
                <div className="flex items-center gap-3">
                    <div className="relative size-9 flex items-center justify-center overflow-hidden">
                        <Image src="/logo.png" alt="Logo Clarus" width={36} height={36} className="object-contain" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-foreground">Clarus</h1>
                        <p className="text-xs text-muted-foreground">Dados claros, decis&otilde;es melhores</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/")}
                        className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                        <ArrowLeft className="size-4" />
                        Voltar
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                        <LogOut className="size-4" />
                        Sair
                    </Button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                <div className="flex flex-col gap-2 mb-8">
                    <h2 className="text-2xl font-bold text-foreground">Meu Perfil</h2>
                    <p className="text-muted-foreground">Gerencie suas informa&ccedil;&otilde;es pessoais e seguran&ccedil;a</p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-6">
                        {/* Avatar Skeleton */}
                        <div className="bg-card border border-border/50 rounded-lg p-6">
                            <Skeleton className="h-5 w-32 mb-6 bg-muted" />
                            <div className="flex flex-col items-center gap-4">
                                <Skeleton className="size-28 rounded-full bg-muted" />
                                <Skeleton className="h-9 w-32 bg-muted" />
                            </div>
                        </div>
                        {/* Form Skeleton */}
                        <div className="bg-card border border-border/50 rounded-lg p-6">
                            <Skeleton className="h-5 w-36 mb-6 bg-muted" />
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <Skeleton className="h-4 w-12 bg-muted" />
                                    <Skeleton className="h-10 w-full bg-muted" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Skeleton className="h-4 w-12 bg-muted" />
                                    <Skeleton className="h-10 w-full bg-muted" />
                                </div>
                                <Skeleton className="h-10 w-40 self-end bg-muted" />
                            </div>
                        </div>
                        {/* Password Skeleton */}
                        <div className="bg-card border border-border/50 rounded-lg p-6">
                            <Skeleton className="h-5 w-32 mb-6 bg-muted" />
                            <div className="flex flex-col gap-4">
                                <Skeleton className="h-10 w-full bg-muted" />
                                <Skeleton className="h-10 w-full bg-muted" />
                                <Skeleton className="h-10 w-full bg-muted" />
                                <Skeleton className="h-10 w-40 self-end bg-muted" />
                            </div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-card border border-border/50 rounded-lg p-8 text-center">
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button
                            onClick={loadProfile}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Tentar novamente
                        </Button>
                    </div>
                ) : user ? (
                    <div className="flex flex-col gap-6">
                        <ProfileAvatar
                            name={user.name}
                            profileImageUrl={user.profileImageUrl}
                            onAvatarUpdated={loadProfile}
                        />

                        <ProfileForm
                            name={user.name}
                            email={user.email}
                            onNameUpdated={loadProfile}
                        />

                        <PasswordForm />

                        {/* Logout Button */}
                        <div className="pt-4 border-t border-border/50">
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="w-full gap-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            >
                                <LogOut className="size-4" />
                                Sair da conta
                            </Button>
                        </div>
                    </div>
                ) : null}
            </main>

            {/* Footer */}
            <footer className="border-t border-border/50 bg-card mt-auto">
                <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
                    Clarus &copy; 2026 &mdash; Dados claros, decis&otilde;es melhores
                </div>
            </footer>
        </div>
    )
}
