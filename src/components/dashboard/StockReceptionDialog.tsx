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
import { Plus, Download } from "lucide-react"

export function StockReceptionDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/products-list").then(res => res.json()).then(setProducts)
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const response = await fetch("/api/stocks/receive", {
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
          <Plus className="mr-2 h-4 w-4" /> Réceptionner Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Réception de Marchandises (Dépôt Central)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="product_id">Produit reçu</Label>
            <Select name="product_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.viscosity_grade})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité (Bidons)</Label>
              <Input id="quantity" name="quantity" type="number" step="0.1" placeholder="100" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_value">Valeur Unitaire (Prix Achat)</Label>
              <Input id="unit_value" name="unit_value" type="number" placeholder="5000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="justification">Référence / Bordereau</Label>
            <Input id="justification" name="justification" placeholder="BL Fournisseur #XXXX" required />
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-[#0B1F3A]">
              {loading ? "Traitement..." : "Ajouter au Stock Central"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
