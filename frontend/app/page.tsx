"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/services/auth"

export default function HomePage() {
    const router = useRouter()

    useEffect(() => {
        if (!getToken()) {
            router.replace("/login")
        } else {
            router.replace("/dashboard")
        }
    }, [router])

    return null
}
