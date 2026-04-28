"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
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
import { Plus } from "lucide-react"

export function PartnerDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gps, setGps] = useState<{ lat: number, lng: number } | null>(null)
  const [capturing, setCapturing] = useState(false)

  const captureGps = () => {
    setCapturing(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGps({ lat: position.coords.latitude, lng: position.coords.longitude })
          setCapturing(false)
        },
        (error) => {
          console.error(error)
          alert("Erreur lors de la capture GPS. Veuillez vérifier les permissions.")
          setCapturing(false)
        }
      )
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.")
      setCapturing(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const photoManagerFile = formData.get("photo_manager") as File
    const photoStorefrontFile = formData.get("photo_storefront") as File

    let photoManagerUrl = ""
    let photoStorefrontUrl = ""

    try {
      // Upload Manager Photo
      if (photoManagerFile && photoManagerFile.size > 0) {
        const up = new FormData()
        up.append("file", photoManagerFile)
        const res = await fetch("/api/upload", { method: "POST", body: up }).then(r => r.json())
        photoManagerUrl = res.url
      }

      // Upload Storefront Photo
      if (photoStorefrontFile && photoStorefrontFile.size > 0) {
        const up = new FormData()
        up.append("file", photoStorefrontFile)
        const res = await fetch("/api/upload", { method: "POST", body: up }).then(r => r.json())
        photoStorefrontUrl = res.url
      }

      const data = {
        code: formData.get("code"),
        partner_type: formData.get("partner_type"),
        business_name: formData.get("business_name"),
        manager_name: formData.get("manager_name"),
        phone: formData.get("phone"),
        mobile_money_number: formData.get("mobile_money_number"),
        mobile_money_operator: formData.get("mobile_money_operator"),
        commission_rate: parseFloat(formData.get("commission_rate") as string),
        stock_ceiling_amount: parseFloat(formData.get("stock_ceiling_amount") as string),
        address_description: formData.get("address_description"),
        zone: formData.get("zone"),
        photo_manager_url: photoManagerUrl,
        photo_storefront_url: photoStorefrontUrl,
        gps_lat: gps?.lat || null,
        gps_lng: gps?.lng || null,
      }

      const response = await fetch("/api/partners", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
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
          <Plus className="mr-2 h-4 w-4" /> Nouveau partenaire
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enregistrer un nouveau partenaire</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code (Unique)</Label>
              <Input id="code" name="code" placeholder="PART-XXXX" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner_type">Type</Label>
              <Select name="partner_type" defaultValue="MECHANIC">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MECHANIC">Mécanicien (Garage)</SelectItem>
                  <SelectItem value="SHOP">Boutique / Revendeur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_name">Nom de l'établissement / Enseigne</Label>
            <Input id="business_name" name="business_name" placeholder="Garage du Progrès" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manager_name">Nom du Gérant</Label>
              <Input id="manager_name" name="manager_name" placeholder="Jean Dupont" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" placeholder="+229 XX XX XX XX" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mobile_money_number">Numéro MoMo (Paiements)</Label>
              <Input id="mobile_money_number" name="mobile_money_number" placeholder="+229..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile_money_operator">Opérateur</Label>
              <Select name="mobile_money_operator" defaultValue="MTN">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MTN">MTN Benín</SelectItem>
                  <SelectItem value="MOOV">Moov Africa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission_rate">Taux Commission (%)</Label>
              <Input id="commission_rate" name="commission_rate" type="number" step="0.1" defaultValue="5" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_ceiling_amount">Plafond Stock (FCFA)</Label>
              <Input id="stock_ceiling_amount" name="stock_ceiling_amount" type="number" placeholder="500000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="photo_manager">Photo du Gérant</Label>
              <Input id="photo_manager" name="photo_manager" type="file" accept="image/*" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo_storefront">Photo de la Devanture</Label>
              <Input id="photo_storefront" name="photo_storefront" type="file" accept="image/*" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_description">Addresse / Point de repère</Label>
            <Input id="address_description" name="address_description" placeholder="A côté de la station MRS..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zone">Zone Géographique</Label>
              <Input id="zone" name="zone" placeholder="Cotonou / Calavi" />
            </div>
            <div className="space-y-2">
              <Label>Position GPS</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full text-xs font-bold", gps ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-slate-200")}
                  onClick={captureGps}
                  disabled={capturing}
                >
                  {capturing ? "Localisation..." : gps ? "Position Capturée ✓" : "Capturer GPS Terrain"}
                </Button>
                {gps && (
                  <div className="text-[9px] text-slate-400 font-mono flex flex-col justify-center">
                    <span>Lat: {gps.lat.toFixed(4)}</span>
                    <span>Lng: {gps.lng.toFixed(4)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-[#0B1F3A]">
              {loading ? "Création en cours..." : "Enregistrer le partenaire"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
