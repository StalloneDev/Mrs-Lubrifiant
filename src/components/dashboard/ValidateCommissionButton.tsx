"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"

export function ValidateCommissionButton({ partnerId, amount }: { partnerId: string, amount: number }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleValidate() {
        setLoading(true)
        try {
            const res = await fetch("/api/commissions/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ partner_id: partnerId })
            })
            if (res.ok) {
                router.refresh()
            } else {
                const data = await res.json()
                alert(data.error || "Une erreur est survenue")
            }
        } catch (err) {
            alert("Erreur réseau.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleValidate}
            disabled={loading || amount <= 0}
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
            size="sm"
        >
            <ShieldCheck className="mr-2 h-4 w-4" />
            {loading ? "..." : "Valider"}
        </Button>
    )
}
