"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, ChevronRight } from "lucide-react"

export function AuditDetailDialog({ log }: { log: any }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#C9A961]">
                    <FileText className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Détails de l'Action : <span className="text-[#C9A961] uppercase">{log.action}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="font-bold text-slate-400 uppercase mb-2">Avant</p>
                            <pre className="whitespace-pre-wrap font-mono opacity-70">
                                {log.before_value ? JSON.stringify(log.before_value, null, 2) : "Aucune donnée"}
                            </pre>
                        </div>
                        <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                            <p className="font-bold text-amber-600 uppercase mb-2">Après</p>
                            <pre className="whitespace-pre-wrap font-mono">
                                {log.after_value ? JSON.stringify(log.after_value, null, 2) : "Aucune donnée"}
                            </pre>
                        </div>
                    </div>

                    <div className="p-4 border rounded-xl bg-white text-xs space-y-2">
                        <p className="font-bold text-[#0B1F3A] uppercase tracking-wider">Metadonnées</p>
                        <div className="grid grid-cols-2 gap-2 text-slate-500">
                            <p>ID Log: <span className="font-mono">{log.id}</span></p>
                            <p>IP: {log.ip_address || "N/A"}</p>
                            <p className="col-span-2 truncate">Navigateur: {log.user_agent || "N/A"}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
