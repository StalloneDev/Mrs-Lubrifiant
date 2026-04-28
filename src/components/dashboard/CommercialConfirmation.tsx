'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Droplets,
  PackageCheck,
  PackageX
} from 'lucide-react'
import { confirmDeliveryCommercial } from '@/app/dashboard/sales/actions'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export default function CommercialConfirmation({ delivery }: { delivery: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmations, setConfirmations] = useState(
    delivery.lines.map((l: any) => ({
      lineId: l.id,
      plannedQty: l.quantity_planned,
      confirmedQty: l.quantity_planned, // Default to planned
      reason: ''
    }))
  )

  const handleQtyChange = (lineId: string, val: string) => {
    const qty = parseFloat(val) || 0
    setConfirmations((prev: any[]) => prev.map((c: any) =>
      c.lineId === lineId ? { ...c, confirmedQty: qty } : c
    ))
  }

  const handleReasonChange = (lineId: string, val: string) => {
    setConfirmations((prev: any[]) => prev.map((c: any) =>
      c.lineId === lineId ? { ...c, reason: val } : c
    ))
  }

  const handleSubmit = async () => {
    setLoading(true)
    const res = await confirmDeliveryCommercial(delivery.id, confirmations)
    if ('success' in res && res.success) {
      router.push(`/dashboard/partners/${delivery.partner_id}`)
    } else {
      setLoading(false)
      alert('error' in res ? res.error : "Une erreur est survenue")
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Comptage contradictoire</h3>
        {delivery.lines.map((line: any, idx: number) => {
          const conf = confirmations.find((c: any) => c.lineId === line.id)
          const hasDiscrepancy = conf.confirmedQty !== line.quantity_planned

          return (
            <Card key={line.id} className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 flex items-center justify-between border-b bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="font-bold">{line.product.name}</span>
                  </div>
                  <Badge variant="outline" className="font-mono">{line.quantity_planned} bidons attendus</Badge>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantité réelle présente</Label>
                      <Input
                        type="number"
                        value={conf.confirmedQty}
                        onChange={(e) => handleQtyChange(line.id, e.target.value)}
                        className={hasDiscrepancy ? "border-orange-500 bg-orange-50" : ""}
                      />
                    </div>
                    {hasDiscrepancy && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                        <Label className="text-xs text-orange-600 font-bold">Raison de l'écart</Label>
                        <Select onValueChange={(v) => handleReasonChange(line.id, v)}>
                          <SelectTrigger className="border-orange-500">
                            <SelectValue placeholder="Choisir..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MISSING">Manquant</SelectItem>
                            <SelectItem value="DAMAGED">Cassé / Endommagé</SelectItem>
                            <SelectItem value="WRONG_PRODUCT">Erreur produit</SelectItem>
                            <SelectItem value="OTHER">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="p-6 bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <PackageCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold">Validation Commerciale</p>
            <p className="text-xs text-slate-500">En validant, le stock devient vendable par le partenaire.</p>
          </div>
        </div>

        <Button
          className="w-full h-14 bg-[#0B1F3A] text-[#C9A961] font-black text-lg shadow-xl shadow-[#0B1F3A]/20"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : "Confirmer la mise en dépôt"}
        </Button>
      </div>
    </div>
  )
}

function Badge({ children, variant = 'default', className = '' }: any) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
}
