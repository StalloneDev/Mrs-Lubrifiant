import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createDelivery } from '@/app/dashboard/deliveries/actions'
import DeliveryFormItems from '@/components/dashboard/DeliveryFormItems'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

export default async function NewDeliveryPage() {
  const partners = await prisma.partner.findMany({ where: { status: 'ACTIVE' } })
  const products = await prisma.product.findMany({ where: { is_active: true } })
  const deliveryUsers = await prisma.user.findMany({ where: { role: 'DELIVERY' } })
  const warehouses = await prisma.warehouse.findMany({ where: { type: 'CENTRAL' } })

  async function action(formData: FormData) {
    'use server'
    const res = await createDelivery(formData)
    if ('success' in res && res.success) {
      redirect('/dashboard/deliveries')
    }
    // Handle error UI later
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard/deliveries" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nouveau Bon de Livraison (BL)</h1>
      </div>

      <form action={action}>
        <div className="grid gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="partner_id">Partenaire Destinataire</Label>
                <Select name="partner_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un garagiste" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.business_name} ({p.zone})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_delivery_user_id">Livreur assigné</Label>
                <Select name="assigned_delivery_user_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir le chauffeur" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_date">Date prévue de livraison</Label>
                <Input type="date" name="target_date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouse_source_id">Dépôt source</Label>
                <Select name="warehouse_source_id" required defaultValue={warehouses[0]?.id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir le dépôt" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <DeliveryFormItems products={products} />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full bg-[#0B1F3A] h-12 text-lg font-bold">
            Générer et Transmettre le BL <Send className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
