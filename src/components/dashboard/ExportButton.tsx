'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportToCSV } from '@/lib/export'

interface ExportButtonProps {
    data: any[]
    filename: string
    label?: string
}

export function ExportButton({ data, filename, label = "Exporter" }: ExportButtonProps) {
    return (
        <Button
            variant="outline"
            onClick={() => exportToCSV(data, filename)}
            className="border-slate-200"
        >
            <Download className="mr-2 h-4 w-4" /> {label}
        </Button>
    )
}
