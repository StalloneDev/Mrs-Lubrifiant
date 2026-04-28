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
import { Textarea } from "@/components/ui/textarea"
import { Plus, MapPin, Camera } from "lucide-react"
import { cn } from "@/lib/utils"

export function VisitDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [partners, setPartners] = useState<any[]>([])
  const [gps, setGps] = useState<{ lat: number, lng: number } | null>(null)

  useEffect(() => {
    fetch("/api/partners-list").then(res => res.json()).then(setPartners)
  }, [])

  const captureGPS = () => {
      if (typeof window !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
              setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          })
      }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    
    const data = {
        partnerId: formData.get("partner_id"),
        notes: formData.get("notes"),
        visitedAt: new Date().toISOString(),
        gps_lat: gps?.lat,
        gps_lng: gps?.lng
    }

    try {
      const response = await fetch("/api/visits", {
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
          <Plus className="mr-2 h-4 w-4" /> Nouvelle Visite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rapport de Visite Commerciale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="partner_id">Partenaire visité</Label>
            <Select name="partner_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un partenaire" />
              </SelectTrigger>
              <SelectContent>
                {partners.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.business_name} ({p.zone})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
             <Label htmlFor="notes">Notes / Observations</Label>
             <Textarea id="notes" name="notes" placeholder="Rupture de stock sur le 20W50, demande de passage livreur..." className="min-h-[100px]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="photos">Photos (Preuve de passage)</Label>
            <div className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 bg-slate-50">
               <Camera className="h-8 w-8 text-slate-300" />
               <Input id="photos" name="photos" type="file" multiple accept="image/*" className="border-none bg-transparent shadow-none" />
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <MapPin className={cn("h-4 w-4", gps ? "text-green-600" : "text-blue-600")} />
                <span className="text-[10px] font-bold uppercase">
                    {gps ? `COORDONNÉES: ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : "Position GPS Requis"}
                </span>
             </div>
             <Button type="button" size="sm" variant="outline" onClick={captureGPS} className="h-7 text-[10px] bg-white">
                {gps ? "Reconnecter" : "Capturer GPS"}
             </Button>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading || !gps} className="w-full bg-[#0B1F3A]">
              {loading ? "Enregistrement..." : "Valider la Visite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
