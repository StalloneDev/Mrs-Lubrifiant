'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Wallet,
  Loader2,
  Smartphone,
  Banknote,
  Navigation,
  CheckCircle2
} from 'lucide-react'
import { createPayment } from '@/app/dashboard/sales/payment-actions'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export default function PaymentRecording({ partnerId, balance }: { partnerId: string, balance: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const res = await createPayment(formData)
    if ('success' in res && res.success) {
      router.push(`/dashboard/partners/${partnerId}`)
    } else {
      setLoading(false)
      alert('error' in res ? res.error : "Une erreur est survenue")
    }
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="bg-[#0B1F3A] text-white rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="bg-[#C9A961] p-2 rounded-lg">
            <Wallet className="h-5 w-5 text-[#0B1F3A]" />
          </div>
          <div>
            <CardTitle className="text-lg">Nouveau Règlement</CardTitle>
            <p className="text-xs text-slate-400">Solde dû: {balance.toLocaleString()} FCFA</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-6">
          <input type="hidden" name="partner_id" value={partnerId} />

          <div className="space-y-2">
            <Label htmlFor="amount">Montant Reçu (FCFA)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="Ex: 50000"
              required
              className="text-2xl font-black h-14"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel">Moyen de paiement</Label>
            <Select name="channel" required defaultValue="MOBILE_MONEY_MTN">
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Choisir..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MOBILE_MONEY_MTN">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-yellow-500" /> MTN Mobile Money
                  </div>
                </SelectItem>
                <SelectItem value="MOBILE_MONEY_MOOV">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-blue-500" /> Moov Money
                  </div>
                </SelectItem>
                <SelectItem value="CASH">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-green-500" /> Espèces
                  </div>
                </SelectItem>
                <SelectItem value="CHECK">Chèque</SelectItem>
                <SelectItem value="BANK">Virement Bancaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="external_reference">Référence transaction (ID MoMo, etc.)</Label>
            <Input
              id="external_reference"
              name="external_reference"
              placeholder="Optionnel"
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#0B1F3A] hover:bg-[#1a3a63] text-lg font-bold"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Enregistrer l'encaissement"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
