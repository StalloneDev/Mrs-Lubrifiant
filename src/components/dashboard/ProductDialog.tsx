"use client"

import { useState } from "react"
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
import { Plus } from "lucide-react"

export function ProductDialog({ product }: { product?: any }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const photoFile = formData.get("photo") as File
    let photoUrl = ""

    if (photoFile && photoFile.size > 0) {
        const uploadData = new FormData()
        uploadData.append("file", photoFile)
        try {
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: uploadData
            })
            const uploadJson = await uploadRes.json()
            photoUrl = uploadJson.url
        } catch (err) {
            console.error("Upload failed", err)
        }
    }

    const data = {
      id: product?.id,
      code: formData.get("code"),
      name: formData.get("name"),
      viscosity_grade: formData.get("viscosity_grade"),
      container_size: parseFloat(formData.get("container_size") as string),
      container_unit: formData.get("container_unit"),
      category: formData.get("category"),
      purchase_price: parseFloat(formData.get("purchase_price") as string),
      selling_price_suggested: parseFloat(formData.get("selling_price_suggested") as string),
      photo_url: photoUrl || product?.photo_url
    }

    try {
      const response = await fetch("/api/products", {
        method: product ? "PATCH" : "POST",
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
        {product ? (
          <Button variant="ghost" size="sm" className="w-full justify-start">Modifier</Button>
        ) : (
          <Button className="bg-[#0B1F3A] hover:bg-[#1a3a63]">
            <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? "Modifier le produit" : "Ajouter un nouveau produit"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code Produit</Label>
              <Input id="code" name="code" defaultValue={product?.code} placeholder="MRS-XXX" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="viscosity_grade">Viscosité</Label>
              <Input id="viscosity_grade" name="viscosity_grade" defaultValue={product?.viscosity_grade} placeholder="20W50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nom Complet</Label>
            <Input id="name" name="name" defaultValue={product?.name} placeholder="MRS Super 20W50" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="container_size">Taille</Label>
              <Input id="container_size" name="container_size" type="number" step="0.1" defaultValue={product?.container_size} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="container_unit">Unité</Label>
              <Input id="container_unit" name="container_unit" defaultValue={product?.container_unit || 'L'} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input id="category" name="category" defaultValue={product?.category} placeholder="Moteur / Frein / ..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Photo du Produit</Label>
              <Input id="photo" name="photo" type="file" accept="image/*" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Prix Achat</Label>
              <Input id="purchase_price" name="purchase_price" type="number" defaultValue={product?.purchase_price} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selling_price_suggested">Prix Vente Sugg.</Label>
              <Input id="selling_price_suggested" name="selling_price_suggested" type="number" defaultValue={product?.selling_price_suggested} required />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-[#0B1F3A]">
              {loading ? "Enregistrement..." : product ? "Mettre à jour" : "Créer le produit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
