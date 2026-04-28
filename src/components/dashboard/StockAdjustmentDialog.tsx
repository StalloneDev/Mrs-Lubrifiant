'use client'

import { useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2, ArrowRightLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function StockAdjustmentDialog({ warehouse }: { warehouse: any }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<any[]>([])

    useEffect(() => {
        if (open) {
            fetch('/api/products-list').then(res => res.json()).then(setProducts)
        }
    }, [open])

    async function handleAdjust(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const formData = new FormData(event.currentTarget)

        const res = await fetch('/api/stocks/adjust', {
            method: 'POST',
            body: JSON.stringify({
                product_id: formData.get('product_id'),
                quantity: formData.get('quantity'),
                type: formData.get('type'),
                warehouse_id: warehouse.id,
                justification: formData.get('justification')
            }),
            headers: { 'Content-Type': 'application/json' }
        })

        setLoading(false)
        if (res.ok) {
            setOpen(false)
            router.refresh()
        } else {
            const err = await res.json()
            alert(err.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                    <ArrowRightLeft className="h-4 w-4 text-slate-400" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajustement / Retour de Stock</DialogTitle>
                    <DialogDescription>
                        Régularisez le stock pour : {warehouse.name}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdjust} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type d'opération</Label>
                            <Select name="type" required defaultValue="ADJUSTMENT">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADJUSTMENT">Ajustement (Perte/Correction)</SelectItem>
                                    <SelectItem value="RETURN">Retour au Dépôt Central</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Produit</Label>
                            <Select name="product_id" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Quantité à retirer du dépôt</Label>
                        <Input name="quantity" type="number" step="1" required placeholder="0" />
                    </div>
                    <div className="space-y-2">
                        <Label>Justification (Obligatoire)</Label>
                        <Textarea
                            name="justification"
                            required
                            placeholder="Ex: Coulage constaté, erreur de comptage, retour fin de contrat..."
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                        <Button type="submit" className="bg-[#0B1F3A]" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
