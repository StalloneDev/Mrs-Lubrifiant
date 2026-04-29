"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PrintButton({ label = "Imprimer / Exporter PDF", className = "" }: { label?: string, className?: string }) {
    return (
        <Button
            onClick={() => window.print()}
            className={`bg-[#0B1F3A] text-white px-6 py-2 rounded-full font-bold shadow-xl hover:scale-105 transition-transform print:hidden ${className}`}
        >
            <Printer className="mr-2 h-4 w-4" />
            {label}
        </Button>
    )
}
