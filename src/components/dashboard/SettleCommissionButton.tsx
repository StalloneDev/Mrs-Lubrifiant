"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function SettleCommissionButton({ partnerId, amount }: { partnerId: string, amount: number }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSettle() {
        if (!confirm(`Confirmez-vous le règlement de ${amount.toLocaleString()} FCFA pour ce partenaire ?`)) {
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/commissions/settle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ partner_id: partnerId })
            })
            if (res.ok) {
                alert("Commissions marquées comme réglées.")
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
            onClick={handleSettle}
            disabled={loading || amount <= 0}
            variant={amount > 0 ? "default" : "outline"}
            className={amount > 0 ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            size="sm"
        >
            <Check className="mr-2 h-4 w-4" />
            {loading ? "En cours..." : "Marquer comme réglé"}
        </Button>
    )
}
