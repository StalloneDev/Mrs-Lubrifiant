"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExportCSVButtonProps {
    data: any[]
    filename: string
    label?: string
}

export function ExportCSVButton({ data, filename, label = "Exporter CSV" }: ExportCSVButtonProps) {
    const downloadCSV = () => {
        if (data.length === 0) return

        // Get headers from first object keys
        const headers = Object.keys(data[0])
        const csvRows = []

        // Add header row
        csvRows.push(headers.join(","))

        // Add data rows
        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header]
                const escaped = ('' + val).replace(/"/g, '""') // Escape double quotes
                return `"${escaped}"`
            })
            csvRows.push(values.join(","))
        }

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `${filename}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Button variant="outline" size="sm" onClick={downloadCSV} className="text-slate-600 font-bold border-slate-200">
            <Download className="mr-2 h-4 w-4 text-green-600" /> {label}
        </Button>
    )
}
