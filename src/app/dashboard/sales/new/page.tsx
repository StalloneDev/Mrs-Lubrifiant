"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Plus, Trash2, ChevronLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NewSalePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [partners, setPartners] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([{ productId: "", quantity: 1, price: 0 }])
  const [selectedPartner, setSelectedPartner] = useState("")

  useEffect(() => {
    async function fetchData() {
      const [resP, resPr] = await Promise.all([
        fetch("/api/partners-list"),
        fetch("/api/products-list")
      ])
      const partnersData = await resP.json()
      setPartners([
        { id: "direct", business_name: "--- VENTE COMPTOIR (SANS PARTENAIRE) ---" },
        ...partnersData
      ])
      setProducts(await resPr.json())
    }
    fetchData()
  }, [])

  const addItem = () => setItems([...items, { productId: "", quantity: 1, price: 0 }])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index][field] = value
    if (field === "productId") {
      const product = products.find(p => p.id === value)
      if (product) newItems[index].price = product.selling_price_suggested
    }
    setItems(newItems)
  }

  const total = items.reduce((acc, item) => acc + (item.quantity * item.price), 0)

  async function handleSubmit() {
    if (!selectedPartner || items.some(i => !i.productId)) {
      alert("Veuillez remplir tous les champs")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        body: JSON.stringify({
          partnerId: selectedPartner,
          items: items
        }),
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        router.push("/dashboard/sales")
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/sales">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A]">Nouvelle Vente</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Panier de vente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {items.map((item, index) => (
                  <div key={index} className="p-4 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                    <div className="flex-1 space-y-2 w-full">
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Produit</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(v) => updateItem(index, "productId", v)}
                      >
                        <SelectTrigger className="w-full h-10 border-slate-200">
                          <SelectValue placeholder="Choisir un produit" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.viscosity_grade})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Qté</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                        className="h-10 border-slate-200"
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Prix Unit.</Label>
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(index, "price", parseFloat(e.target.value))}
                        className="h-10 border-slate-200 font-bold"
                      />
                    </div>
                    <div className="w-8 flex justify-center pb-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-50">
                <Button variant="outline" onClick={addItem} className="w-full border-dashed border-slate-300 text-slate-500 hover:bg-slate-50">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un autre produit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-[#0B1F3A] text-white">
            <CardHeader>
              <CardTitle className="text-white text-sm font-bold uppercase tracking-wider opacity-60">Client & Facturation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white opacity-80">Partenaire (Client)</Label>
                <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-12">
                    <SelectValue placeholder="Sélectionner le partenaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.business_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-3">
                <div className="flex justify-between text-sm opacity-60">
                  <span>Sous-total</span>
                  <span>{total.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm opacity-60">
                  <span>Remise (0%)</span>
                  <span>0 FCFA</span>
                </div>
                <div className="flex justify-between items-end pt-3">
                  <span className="text-lg font-black leading-none">Total Net</span>
                  <span className="text-2xl font-black leading-none text-[#C9A961]">{total.toLocaleString()} FCFA</span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#C9A961] hover:bg-[#B89850] text-[#0B1F3A] font-black h-12 mt-6"
              >
                <Save className="mr-2 h-5 w-5" />
                {loading ? "Traitement..." : "Valider la Vente"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
