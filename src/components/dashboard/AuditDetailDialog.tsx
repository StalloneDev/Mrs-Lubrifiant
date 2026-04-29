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

function AuditValueFormatter({ value, variant = 'default' }: { value: any, variant?: 'default' | 'highlight' }) {
    if (!value) return <span className="italic opacity-40">Aucune donnée historique</span>

    // If it's a string, just show it
    if (typeof value === 'string') return <span>{value}</span>

    // Mapping of technical keys to human friendly ones
    const keyMap: Record<string, string> = {
        'action': 'Action',
        'status': 'Statut',
        'business_name': 'Raison Sociale',
        'full_name': 'Nom Complet',
        'email': 'Email',
        'phone': 'Téléphone',
        'zone': 'Zone',
        'commission_rate': 'Taux Commission',
        'stock_ceiling_amount': 'Plafond Stock',
        'quantity': 'Quantité',
        'price': 'Prix',
        'manager_name': 'Nom Gérant',
        'password_hash': 'Mot de Passe (Sécurisé)',
        'last_login_at': 'Dernière Connexion'
    }

    const entries = Object.entries(value)

    return (
        <div className="space-y-2">
            {entries.length === 0 ? (
                <span className="italic opacity-40">Données vides</span>
            ) : (
                entries.map(([k, v]) => (
                    <div key={k} className="flex flex-col border-b border-black/5 pb-1 mb-1">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-tighter">
                            {keyMap[k] || k.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-[11px] font-medium ${variant === 'highlight' ? 'text-blue-700' : 'text-slate-600'}`}>
                            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </span>
                    </div>
                ))
            )}
        </div>
    )
}

export function AuditDetailDialog({ log, entityName }: { log: any, entityName?: string }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#C9A961]">
                    <FileText className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto border-none shadow-2xl">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="flex flex-col gap-1 text-left">
                        <span className="text-[10px] uppercase text-slate-400 font-black tracking-[0.2em]">Audit Tracking</span>
                        <span className="text-[#0B1F3A] uppercase font-black text-2xl tracking-tighter">{log.action}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-6">
                    {/* Cible Highlight */}
                    <div className="bg-[#0B1F3A] p-5 rounded-2xl text-white shadow-lg relative overflow-hidden group">
                        <div className="absolute right-0 top-0 h-full w-32 bg-white/5 skew-x-12 translate-x-12" />
                        <p className="text-[10px] font-black uppercase text-[#C9A961] mb-2 tracking-widest opacity-80">Cible de l'action métier</p>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="px-2 py-0.5 bg-[#C9A961] text-[#0B1F3A] rounded shadow-sm text-[9px] font-black uppercase">
                                {log.entity_type}
                            </div>
                            <span className="font-black text-xl tracking-tight">{entityName || log.entity_id}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valeurs Initiales</h4>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[100px]">
                                <AuditValueFormatter value={log.before_value} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Nouvelles Valeurs</h4>
                            </div>
                            <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100 min-h-[100px]">
                                <AuditValueFormatter value={log.after_value} variant="highlight" />
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-t border-dashed mt-4">
                        <div className="grid grid-cols-3 gap-6 text-[10px]">
                            <div>
                                <p className="font-black text-slate-400 uppercase mb-1">ID Log</p>
                                <p className="font-mono text-slate-600 opacity-60 truncate" title={log.id}>{log.id.slice(0, 8)}...</p>
                            </div>
                            <div>
                                <p className="font-black text-slate-400 uppercase mb-1">IP Adresse</p>
                                <p className="font-bold text-slate-600">{log.ip_address && log.ip_address !== 'N/A' ? log.ip_address : '--'}</p>
                            </div>
                            <div>
                                <p className="font-black text-slate-400 uppercase mb-1">Horodatage</p>
                                <p className="font-bold text-slate-600">{new Date(log.timestamp).toLocaleString('fr-FR')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
