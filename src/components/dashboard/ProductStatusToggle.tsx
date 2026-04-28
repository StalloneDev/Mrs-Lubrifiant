"use client"

import { useState } from "react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface ProductStatusToggleProps {
    productId: string
    currentStatus: boolean
}

export function ProductStatusToggle({ productId, currentStatus }: ProductStatusToggleProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleToggle() {
        if (!confirm(`Voulez-vous vraiment ${currentStatus ? 'désactiver' : 'réactiver'} ce produit ?`)) {
            return
        }

        setLoading(true)
        try {
            const response = await fetch("/api/products", {
                method: "PATCH",
                body: JSON.stringify({ id: productId, is_active: !currentStatus }),
                headers: { "Content-Type": "application/json" },
            })

            if (response.ok) {
                router.refresh()
            } else {
                const err = await response.json()
                alert(err.error || "Une erreur est survenue")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenuItem
            onClick={(e) => {
                e.preventDefault()
                handleToggle()
            }}
            disabled={loading}
            className={currentStatus ? "text-red-500 font-bold" : "text-green-600 font-bold"}
        >
            {loading ? "Chargement..." : (currentStatus ? "Désactiver" : "Réactiver")}
        </DropdownMenuItem>
    )
}
