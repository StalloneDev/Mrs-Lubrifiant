'use client'

import { useState, useRef, useEffect } from 'react'
import SignaturePad from 'signature_pad'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, MapPin, CheckCircle2, Loader2, ChevronDown, ChevronUp, Droplets } from 'lucide-react'
import { executeDelivery } from '@/app/dashboard/deliveries/actions'
import { useRouter } from 'next/navigation'

export default function DeliveryExecution({ delivery }: { delivery: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const signaturePadRef = useRef<SignaturePad | null>(null)

  useEffect(() => {
    if (isFinishing && canvasRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current)
    }
  }, [isFinishing])

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      })
    }
  }, [])

  const [deliveredQtys, setDeliveredQtys] = useState<Record<string, number>>(
    Object.fromEntries(delivery.lines.map((l: any) => [l.id, l.quantity_planned]))
  )

  const handleSubmit = async () => {
    if (!signaturePadRef.current?.isEmpty()) {
      setLoading(true)
      const signature = signaturePadRef.current?.toDataURL() || ''

      const res = await executeDelivery(delivery.id, {
        lines: delivery.lines.map((l: any) => ({
          id: l.id,
          productId: l.product_id,
          qty: deliveredQtys[l.id]
        })),
        signature_url: signature,
        photo_url: 'mock_photo_url', // Mock for MVP
        gps: coords || { lat: 0, lng: 0 }
      })

      if ('success' in res && res.success) {
        router.push('/dashboard/deliveries')
      } else {
        setLoading(false)
        alert('error' in res ? res.error : "Une erreur est survenue")
      }
    } else {
      alert("Veuillez signer pour confirmer la livraison.")
    }
  }

  if (!isFinishing) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-blue-50 p-4 border border-blue-100 flex items-center gap-3">
          <MapPin className="h-5 w-5 text-blue-600" />
          <div className="text-sm">
            <p className="font-bold text-blue-900">{delivery.partner.business_name}</p>
            <p className="text-blue-700">{delivery.partner.address_description || 'Adresse non spécifiée'}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Contenu du chargement</h3>
          {delivery.lines.map((line: any) => (
            <div key={line.id} className="flex flex-col p-4 bg-white rounded-xl shadow-sm border border-slate-100 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <Droplets className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-bold leading-tight">{line.product.name}</p>
                    <p className="text-xs text-slate-400">Prévu: {line.quantity_planned} bidons</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-xs font-bold whitespace-nowrap">Qté Livrée :</Label>
                <Input
                  type="number"
                  className="h-10 text-center font-black text-[#0B1F3A]"
                  value={deliveredQtys[line.id]}
                  onChange={(e) => setDeliveredQtys({ ...deliveredQtys, [line.id]: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 space-y-4">
          <Button variant="outline" className="w-full h-14 gap-2 text-slate-600 font-bold border-dashed border-2">
            <Camera className="h-5 w-5" /> Prendre une photo du stock
          </Button>

          <Button
            className="w-full h-16 bg-[#0B1F3A] text-[#C9A961] text-xl font-black shadow-lg shadow-[#0B1F3A]/20"
            onClick={() => setIsFinishing(true)}
          >
            Terminer la livraison
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-none shadow-xl">
      <CardHeader>
        <CardTitle className="text-center text-slate-500 text-sm font-bold uppercase">Signature du Partenaire Receptionnaire</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-white overflow-hidden h-64 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full touch-none"
            width={400}
            height={256}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-2 right-2 text-slate-400"
            onClick={() => signaturePadRef.current?.clear()}
          >
            Effacer
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button variant="outline" onClick={() => setIsFinishing(false)} disabled={loading}>
            Retour
          </Button>
          <Button
            className="bg-[#0B1F3A] font-bold"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Signer et Valider"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
