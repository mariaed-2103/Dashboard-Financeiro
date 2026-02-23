"use client"

import { useRef, useState } from "react"
import { Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { uploadAvatar } from "@/services/api"
import { toast } from "sonner"

interface ProfileAvatarProps {
    name: string
    profileImageUrl: string | null
    onAvatarUpdated: () => void
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
}

export function ProfileAvatar({ name, profileImageUrl, onAvatarUpdated }: ProfileAvatarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast.error("Por favor, selecione um arquivo de imagem.")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("A imagem deve ter no m\u00e1ximo 5MB.")
            return
        }

        setIsUploading(true)
        try {
            await uploadAvatar(file)
            toast.success("Foto atualizada com sucesso!")
            onAvatarUpdated()
        } catch {
            toast.error("Erro ao atualizar foto. Tente novamente.")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    return (
        <Card className="bg-card border-border/50">
            <CardHeader>
                <CardTitle className="text-foreground">Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div className="relative">
                    {profileImageUrl ? (
                        <img
                            src={profileImageUrl}
                            alt={`Foto de ${name}`}
                            className="size-28 rounded-full object-cover border-2 border-accent"
                        />
                    ) : (
                        <div className="size-28 rounded-full bg-secondary flex items-center justify-center border-2 border-accent">
                            <span className="text-3xl font-bold text-secondary-foreground">
                                {getInitials(name)}
                            </span>
                        </div>
                    )}
                    {isUploading && (
                        <div className="absolute inset-0 rounded-full bg-background/70 flex items-center justify-center">
                            <Loader2 className="size-8 animate-spin text-accent" />
                        </div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Selecionar foto de perfil"
                />

                <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="gap-2 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                    <Camera className="size-4" />
                    {isUploading ? "Enviando..." : "Alterar foto"}
                </Button>
            </CardContent>
        </Card>
    )
}
