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
import { CheckCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export function ConfirmDeliveryDialog({ delivery }: { delivery: any }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gps, setGps] = useState<{ lat: number, lng: number } | null>(null)

  // Initialize with planned quantities
  const [confirmedLines, setConfirmedLines] = useState(
    delivery.lines.map((l: any) => ({
      id: l.id,
      productId: l.product_id,
      name: l.product.name,
      quantity: l.quantity_planned,
      planned: l.quantity_planned
    }))
  )

  const captureGPS = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      })
    }
  }

  const handleQtyChange = (id: string, val: string) => {
    setConfirmedLines((prev: any[]) => prev.map((l: any) => l.id === id ? { ...l, quantity: val } : l))
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      const response = await fetch("/api/deliveries/confirm", {
        method: "POST",
        body: JSON.stringify({
          deliveryId: delivery.id,
          confirmedLines: confirmedLines,
          gps_lat: gps?.lat,
          gps_lng: gps?.lng
        }),
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
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8">
          <CheckCircle className="mr-2 h-4 w-4" /> Confirmer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Confirmation de Réception</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex gap-3 text-xs text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>Vérifiez les quantités réellement reçues par <b>{delivery.partner.business_name}</b> avant de valider.</p>
          </div>

          <div className="space-y-3">
            {confirmedLines.map((line: any) => (
              <div key={line.id} className="flex items-center justify-between gap-4 p-2 border rounded-md">
                <div className="flex-1">
                  <p className="text-sm font-bold">{line.name}</p>
                  <p className="text-[10px] text-slate-500">Prévu: {line.planned} Bidons</p>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    value={line.quantity}
                    onChange={(e) => handleQtyChange(line.id, e.target.value)}
                    className="h-8 text-right font-bold"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className={cn("h-4 w-4", gps ? "text-green-600" : "text-blue-600")} />
              <span className="text-[10px] font-bold uppercase">
                {gps ? `GPS: ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : "GPS Requis"}
              </span>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={captureGPS} className="h-7 text-[10px] bg-white">
              {gps ? "Reconnecter" : "Capturer GPS"}
            </Button>
          </div>

          <DialogFooter className="pt-4">
            <Button
              onClick={handleConfirm}
              disabled={loading || !gps}
              className="w-full bg-[#0B1F3A]"
            >
              {loading ? "Confirmation..." : "Valider la Livraison"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
