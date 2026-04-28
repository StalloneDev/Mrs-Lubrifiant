import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Truck, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { ConfirmDeliveryDialog } from '@/components/dashboard/ConfirmDeliveryDialog'
import { CreateDeliveryDialog } from '@/components/dashboard/CreateDeliveryDialog'
import { ExportCSVButton } from '@/components/dashboard/ExportCSVButton'
import { Button } from '@/components/ui/button'

export default async function DeliveriesPage() {
  const cookie = cookies().get('session')?.value
  const session = cookie ? await decrypt(cookie) : null
  const role = (session as any)?.role
  const userId = (session as any)?.userId

  let whereClause: any = {}

  if (role === 'DELIVERY') {
    whereClause = { assigned_delivery_user_id: userId }
  } else if (role === 'COMMERCIAL') {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    whereClause = {
      partner: {
        OR: [
          { assigned_commercial_user_id: userId },
          { zone: user?.assigned_zone }
        ]
      }
    }
  }

  const deliveries = await prisma.delivery.findMany({
    where: whereClause,
    include: {
      partner: true,
      lines: {
        include: { product: true }
      }
    },
    orderBy: { created_at: 'desc' },
    take: 20
  })

  const exportData = deliveries.map(d => ({
    Bon_Livraison: `BL-${d.delivery_number.toString().padStart(4, '0')}`,
    Partenaire: d.partner.business_name,
    Zone: d.partner.zone,
    Date_Prevue: format(new Date(d.target_date), 'yyyy-MM-dd'),
    Status: d.status
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A]">Suivi de Livraison & Transit</h1>
          <p className="text-slate-500">Gérez les expéditions du dépôt central vers le réseau de partenaires.</p>
        </div>
        <div className="flex gap-2">
          <ExportCSVButton data={exportData} filename="livraisons_mrs" />
          <CreateDeliveryDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-orange-600">En Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#0B1F3A]">
              {deliveries.filter(d => d.status !== 'DELIVERED' && d.status !== 'CANCELLED').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-green-600">Livraisons Confirmées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#0B1F3A]">
              {deliveries.filter(d => d.status === 'DELIVERED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>N° Bon</TableHead>
              <TableHead>Partenaire</TableHead>
              <TableHead>Date Prévue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valeur</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs font-bold">
                  BL-{d.delivery_number.toString().padStart(4, '0')}
                </TableCell>
                <TableCell>
                  <p className="font-bold">{d.partner.business_name}</p>
                  <p className="text-[10px] text-slate-500">{d.partner.zone}</p>
                </TableCell>
                <TableCell className="text-xs">
                  {format(new Date(d.target_date), 'dd MMM yyyy', { locale: fr })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={d.status === 'DELIVERED' ? 'default' : 'secondary'}
                    className={d.status === 'DELIVERED' ? 'bg-green-500' : 'bg-orange-500 text-white'}
                  >
                    {d.status === 'DELIVERED' ? 'LIVRÉ' : 'EN TRANSIT'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {/* Total calculation here if needed */}
                  -
                </TableCell>
                <TableCell className="text-right flex items-center justify-end gap-2">
                  <Link href={`/dashboard/deliveries/${d.id}/print`} target="_blank">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <FileText className="h-4 w-4 text-slate-400" />
                    </Button>
                  </Link>
                  {d.status !== 'DELIVERED' && (
                    <ConfirmDeliveryDialog delivery={d} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
