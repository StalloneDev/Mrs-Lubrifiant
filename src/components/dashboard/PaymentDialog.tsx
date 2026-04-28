"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Wallet } from "lucide-react"

export function PaymentDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [partners, setPartners] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/partners-list").then(res => res.json()).then(setPartners)
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const proofFile = formData.get("proof_file") as File
    let proofUrl = ""

    if (proofFile && proofFile.size > 0) {
        const up = new FormData()
        up.append("file", proofFile)
        try {
            const res = await fetch("/api/upload", { method: "POST", body: up }).then(r => r.json())
            proofUrl = res.url
        } catch (e) { console.error(e) }
    }

    const data = {
        partner_id: formData.get("partner_id"),
        amount: formData.get("amount"),
        channel: formData.get("channel"),
        external_reference: formData.get("external_reference"),
        proof_url: proofUrl
    }

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        setOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0B1F3A] hover:bg-[#1a3a63]">
          <Plus className="mr-2 h-4 w-4" /> Enregistrer un paiement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouvel Encaissement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="partner_id">Partenaire</Label>
            <Select name="partner_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un partenaire" />
              </SelectTrigger>
              <SelectContent>
                {partners.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.business_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="amount">Montant (FCFA)</Label>
                <Input id="amount" name="amount" type="number" placeholder="50000" required />
             </div>
             <div className="space-y-2">
                <Label htmlFor="channel">Méthode</Label>
                <Select name="channel" defaultValue="CASH">
                   <SelectTrigger>
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="CASH">Espèces</SelectItem>
                      <SelectItem value="MOBILE_MONEY_MTN">MTN MoMo</SelectItem>
                      <SelectItem value="MOBILE_MONEY_MOOV">Moov Money</SelectItem>
                      <SelectItem value="BANK">Virement Banque</SelectItem>
                   </SelectContent>
                </Select>
             </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="external_reference">Référence (N° Transaction / Chèque)</Label>
            <Input id="external_reference" name="external_reference" placeholder="Ex: TXN123456789" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proof_file">Preuve de paiement (Photo / Capture)</Label>
            <div className="flex items-center gap-2 border rounded-lg p-2 bg-slate-50">
               <Input id="proof_file" name="proof_file" type="file" accept="image/*" className="border-none bg-transparent h-8 text-xs" />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-[#0B1F3A]">
              {loading ? "Traitement..." : "Confirmer le règlement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
