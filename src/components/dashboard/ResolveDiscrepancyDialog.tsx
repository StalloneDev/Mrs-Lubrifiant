'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { resolveDiscrepancy } from '@/app/dashboard/discrepancies/actions'
import { Loader2, Settings2 } from 'lucide-react'

export function ResolveDiscrepancyDialog({ discrepancy }: { discrepancy: any }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(discrepancy.status)
    const [notes, setNotes] = useState(discrepancy.resolution_notes || '')

    async function handleResolve() {
        setLoading(true)
        const res = await resolveDiscrepancy(discrepancy.id, status, notes)
        setLoading(false)
        if (res.success) {
            setOpen(false)
        } else {
            alert(res.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings2 className="h-4 w-4 text-slate-400 hover:text-[#0B1F3A]" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Résoudre le litige</DialogTitle>
                    <DialogDescription>
                        Écart de {discrepancy.delta} bidons sur le BL #{discrepancy.delivery.delivery_number}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Statut de résolution</Label>
                        <Select value={status} onValueChange={setStatus as any}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir un statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="OPEN">Ouvert (Non traité)</SelectItem>
                                <SelectItem value="INVESTIGATING">En cours d'investigation</SelectItem>
                                <SelectItem value="RESOLVED">Résolu (Stock régularisé)</SelectItem>
                                <SelectItem value="WRITTEN_OFF">Annulé (Perte acceptée)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Notes de résolution</Label>
                        <Textarea
                            placeholder="Expliquez la cause de l'écart ou l'action corrective prise..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Fermer</Button>
                    <Button
                        className="bg-[#0B1F3A] hover:bg-[#0B1F3A]/90"
                        onClick={handleResolve}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
