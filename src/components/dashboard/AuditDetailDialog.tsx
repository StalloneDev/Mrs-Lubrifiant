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

export function AuditDetailDialog({ log, entityName }: { log: any, entityName?: string }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#C9A961]">
                    <FileText className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex flex-col gap-1">
                        <span className="text-xs uppercase text-slate-400 font-bold">Détails de l'Action</span>
                        <span className="text-[#0B1F3A] uppercase font-black text-xl">{log.action}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Cible Highlight */}
                    <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-[#C9A961]">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Cible de l'action</p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-[#0B1F3A] text-white px-1.5 py-0.5 rounded font-bold">{log.entity_type}</span>
                            <span className="font-bold text-[#0B1F3A]">{entityName || log.entity_id}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="font-bold text-slate-400 uppercase mb-2 font-sans">Valeurs Précédentes</p>
                            <pre className="whitespace-pre-wrap opacity-60">
                                {log.before_value ? JSON.stringify(log.before_value, null, 2) : "Aucune donnée historique"}
                            </pre>
                        </div>
                        <div className="p-3 bg-blue-50/30 rounded-lg border border-blue-100">
                            <p className="font-bold text-blue-600 uppercase mb-2 font-sans">Nouvelles Valeurs</p>
                            <pre className="whitespace-pre-wrap">
                                {log.after_value ? JSON.stringify(log.after_value, null, 2) : "Aucune donnée"}
                            </pre>
                        </div>
                    </div>

                    <div className="p-4 border rounded-xl bg-white text-[10px] space-y-2">
                        <p className="font-black text-[#0B1F3A] uppercase tracking-widest opacity-50">Données Techniques</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-500">
                            <p>LOG ID: <span className="font-mono">{log.id}</span></p>
                            <p>IP ADDRESS: {log.ip_address || "N/A"}</p>
                            <p className="col-span-2 truncate">USER AGENT: {log.user_agent || "N/A"}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
