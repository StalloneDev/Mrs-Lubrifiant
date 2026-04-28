'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Calculator,
  ShoppingCart,
  Loader2,
  Droplets,
  TrendingDown,
  ChevronRight
} from 'lucide-react'
import { declareVenteDepotVente } from '@/app/dashboard/sales/actions'
import { useRouter } from 'next/navigation'

export default function SaleDeclaration({ partnerId, currentConsignment }: { partnerId: string, currentConsignment: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [inventory, setInventory] = useState(
    currentConsignment.map(item => ({
      productId: item.productId,
      name: item.name,
      confirmedQty: item.currentQty, // What we THINK is there
      remainingQty: item.currentQty, // What the commercial sees
      price: item.price
    }))
  )

  const handleQtyChange = (productId: string, val: string) => {
    const qty = parseFloat(val) || 0
    setInventory(prev => prev.map(item =>
      item.productId === productId ? { ...item, remainingQty: qty } : item
    ))
  }

  const salesCalculated = inventory.map(item => ({
    ...item,
    sold: Math.max(0, item.confirmedQty - item.remainingQty)
  })).filter(item => item.sold > 0)

  const totalSale = salesCalculated.reduce((acc, curr) => acc + (curr.sold * curr.price), 0)

  const handleSubmit = async () => {
    if (salesCalculated.length === 0) {
      alert("Aucune vente détectée sur la base de cet inventaire.")
      return
    }

    setLoading(true)
    const res = await declareVenteDepotVente(partnerId, inventory.map(i => ({
      productId: i.productId,
      remainingQty: i.remainingQty
    })))

    if ('success' in res && res.success) {
      router.push(`/dashboard/partners/${partnerId}`)
    } else {
      setLoading(false)
      alert('error' in res ? res.error : "Une erreur est survenue")
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Inventaire du stock présent</h3>
        {inventory.map((item) => (
          <div key={item.productId} className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                  <Droplets className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight">{item.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Théorique: {item.confirmedQty} bidons</p>
                </div>
              </div>
              <div className="w-24">
                <Label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Restant</Label>
                <Input
                  type="number"
                  value={item.remainingQty}
                  onChange={(e) => handleQtyChange(item.productId, e.target.value)}
                  className="text-center font-bold"
                />
              </div>
            </div>
            {item.confirmedQty > item.remainingQty && (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg font-medium animate-in zoom-in-95">
                <TrendingDown className="h-3 w-3" />
                {item.confirmedQty - item.remainingQty} bidons vendus ({((item.confirmedQty - item.remainingQty) * item.price).toLocaleString()} FCFA)
              </div>
            )}
          </div>
        ))}
      </div>

      {totalSale > 0 && (
        <Card className="border-none bg-[#0B1F3A] text-white shadow-xl shadow-[#0B1F3A]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase text-[#C9A961] tracking-widest flex items-center gap-2">
              <Calculator className="h-4 w-4" /> Total Ventes Calculé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black">{totalSale.toLocaleString()} <span className="text-lg">FCFA</span></p>
            <p className="text-xs text-slate-400 mt-2">En validant, une facture sera automatiquement générée pour le partenaire.</p>

            <Button
              className="w-full h-14 mt-6 bg-[#C9A961] text-[#0B1F3A] font-black text-lg hover:bg-[#B89850]"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Valider et Générer Facture"}
            </Button>
          </CardContent>
        </Card>
      )}

      {totalSale === 0 && (
        <div className="p-8 text-center text-slate-400 italic bg-slate-50 border border-dashed rounded-2xl">
          Saisissez les quantités restantes pour calculer les ventes.
        </div>
      )}
    </div>
  )
}
