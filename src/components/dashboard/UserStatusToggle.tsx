"use client"

import { useState } from "react"
import { toggleUserStatus } from "@/app/dashboard/users/actions"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface UserStatusToggleProps {
    userId: string
    currentStatus: boolean
}

export function UserStatusToggle({ userId, currentStatus }: UserStatusToggleProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleToggle() {
        if (!confirm(`Voulez-vous vraiment ${currentStatus ? 'désactiver' : 'réactiver'} cet utilisateur ?`)) {
            return
        }

        setLoading(true)
        try {
            const res = await toggleUserStatus(userId, currentStatus)
            if ('success' in res && res.success) {
                router.refresh()
            } else {
                alert('error' in res ? res.error : "Une erreur est survenue")
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
