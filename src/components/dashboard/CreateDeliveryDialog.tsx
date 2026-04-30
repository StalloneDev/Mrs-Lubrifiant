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
import { Plus, Trash2, Truck } from "lucide-react"

export function CreateDeliveryDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [partners, setPartners] = useState<{ id: string; business_name: string; zone: string }[]>([])
  const [products, setProducts] = useState<{ id: string; name: string }[]>([])
  const [deliveryUsers, setDeliveryUsers] = useState<{ id: string; full_name: string }[]>([])

  const [selectedPartner, setSelectedPartner] = useState("")
  const [selectedDeliveryUser, setSelectedDeliveryUser] = useState("")
  const [selectedLines, setSelectedLines] = useState<{ productId: string, quantity: string }[]>([
    { productId: "", quantity: "1" }
  ])

  useEffect(() => {
    if (open) {
      fetch("/api/partners-list").then(res => res.json()).then(setPartners)
      fetch("/api/products-list").then(res => res.json()).then(setProducts)
      fetch("/api/users/delivery-list").then(res => res.json()).then(setDeliveryUsers)
    }
  }, [open])

  const addLine = () => setSelectedLines([...selectedLines, { productId: "", quantity: "1" }])
  const removeLine = (index: number) => setSelectedLines(selectedLines.filter((_, i) => i !== index))
  const updateLine = (index: number, field: string, val: string) => {
    setSelectedLines(prev => prev.map((l, i) => i === index ? { ...l, [field]: val } : l))
  }

  async function handleSubmit() {
    if (!selectedPartner || selectedLines.some(l => !l.productId)) return
    setLoading(true)
    try {
      const response = await fetch("/api/deliveries", {
        method: "POST",
        body: JSON.stringify({
          partnerId: selectedPartner,
          lines: selectedLines,
          deliveryUserId: selectedDeliveryUser || null
        }),
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        setOpen(false)
        setSelectedPartner("")
        setSelectedDeliveryUser("")
        setSelectedLines([{ productId: "", quantity: "1" }])
        router.refresh()
      } else {
        const err = await response.json()
        alert(err.error || "Une erreur est survenue")
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
          <Truck className="mr-2 h-4 w-4" /> Nouvel Envoi (BL)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Préparer un Bon de Livraison</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {/* Partenaire */}
          <div className="space-y-2">
            <Label>Partenaire Destinataire</Label>
            <Select onValueChange={setSelectedPartner} value={selectedPartner}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir le partenaire" />
              </SelectTrigger>
              <SelectContent>
                {partners.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.business_name} ({p.zone})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Livreur assigné */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              Livreur assigné
            </Label>
            <Select onValueChange={setSelectedDeliveryUser} value={selectedDeliveryUser}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un livreur (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                {deliveryUsers.length === 0 && (
                  <SelectItem value="_none" disabled>Aucun livreur disponible</SelectItem>
                )}
                {deliveryUsers.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {deliveryUsers.length === 0 && (
              <p className="text-xs text-amber-600">⚠️ Aucun livreur actif trouvé. Créez d&apos;abord un compte livreur.</p>
            )}
          </div>

          {/* Produits */}
          <div className="space-y-3">
            <Label>Produits à expédier</Label>
            {selectedLines.map((line, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Select onValueChange={(val) => updateLine(index, 'productId', val)} value={line.productId}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-20 space-y-1">
                  <Input
                    type="number"
                    className="h-9"
                    value={line.quantity}
                    onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500" onClick={() => removeLine(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2 border-dashed" onClick={addLine}>
              <Plus className="mr-2 h-3 w-3" /> Ajouter un produit
            </Button>
          </div>

          <DialogFooter className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={loading || !selectedPartner}
              className="w-full bg-[#0B1F3A]"
            >
              {loading ? "Création..." : "Générer le Bon de Livraison"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
