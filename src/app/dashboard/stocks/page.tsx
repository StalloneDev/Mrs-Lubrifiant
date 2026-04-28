import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Package, Truck, Store, History, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

import { StockReceptionDialog } from '@/components/dashboard/StockReceptionDialog'
import { ExportCSVButton } from '@/components/dashboard/ExportCSVButton'
import { StockAdjustmentDialog } from '@/components/dashboard/StockAdjustmentDialog'

export default async function StocksPage() {
  const cookie = cookies().get('session')?.value
  const session = cookie ? await decrypt(cookie) : null
  const role = (session as any)?.role
  const userId = (session as any)?.userId

  let warehouseWhere: any = {}
  let stockWhere: any = { warehouse: { type: 'VIRTUAL_PARTNER' } }

  if (role === 'COMMERCIAL') {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    warehouseWhere = {
      OR: [
        { type: 'CENTRAL' },
        { partner: { OR: [{ assigned_commercial_user_id: userId }, { zone: user?.assigned_zone }] } }
      ]
    }
    stockWhere = {
      warehouse: {
        type: 'VIRTUAL_PARTNER',
        partner: { OR: [{ assigned_commercial_user_id: userId }, { zone: user?.assigned_zone }] }
      }
    }
  }

  const warehouses = await prisma.warehouse.findMany({
    where: warehouseWhere,
    include: { partner: true }
  })

  // Grouped Stock Levels by State Machine
  const centralStocks = await prisma.stockLevel.aggregate({
    _sum: { quantity: true },
    where: { warehouse: { type: 'CENTRAL' } }
  })

  // For delivery_pending, we look at StockMovements of type DELIVERY_PENDING that aren't reversed
  const pendingMovements = await prisma.stockMovement.aggregate({
    _sum: { quantity: true },
    where: { movement_type: 'DELIVERY_PENDING' }
  })

  const partnerStocks = await prisma.stockLevel.aggregate({
    _sum: { quantity: true },
    where: stockWhere
  })

  const warehousesWithTotals = await Promise.all(warehouses.map(async (w) => {
    const total = await prisma.stockLevel.aggregate({
      _sum: { quantity: true },
      where: { warehouse_id: w.id }
    })
    return { ...w, totalQuantity: total._sum.quantity || 0 }
  }))

  const exportData = warehousesWithTotals.map(w => ({
    Depot: w.name,
    Code: w.code,
    Type: w.type,
    Zone: w.partner?.zone || 'N/A',
    Quantite: w.totalQuantity
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A]">Stock & Dépôts</h1>
          <p className="text-slate-500">Supervision en temps réel des lubrifiants à travers le réseau.</p>
        </div>
        <div className="flex gap-2">
          <ExportCSVButton data={exportData} filename="stock_mrs" />
          <Link href="/dashboard/stocks/print" target="_blank">
            <Button variant="outline" className="text-slate-600 font-bold border-slate-200">
              <FileText className="mr-2 h-4 w-4 text-orange-600" /> Imprimer le stock
            </Button>
          </Link>
          <Link href="/dashboard/stocks/movements">
            <Button variant="outline" className="text-slate-600 font-bold border-slate-200">
              <History className="mr-2 h-4 w-4 text-blue-600" /> Historique complet
            </Button>
          </Link>
          <StockReceptionDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" /> Stock Central
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#0B1F3A]">
              {(centralStocks._sum.quantity || 0).toLocaleString()} <span className="text-sm">Bidons</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Propriété MRS - Central</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
              <Truck className="h-4 w-4 text-orange-600" /> Delivery Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#0B1F3A]">
              {(pendingMovements._sum.quantity || 0).toLocaleString()} <span className="text-sm">En route</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">En cours de livraison</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
              <Store className="h-4 w-4 text-green-600" /> Consignment Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#0B1F3A]">
              {(partnerStocks._sum.quantity || 0).toLocaleString()} <span className="text-sm">Déposé</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Disponible à la vente chez partenaires</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">Répartition par Dépôt / Partenaire</h2>
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden text-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Dépôt / Partenaire</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead className="text-right">Quantité Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehousesWithTotals.map(w => (
                <TableRow key={w.id}>
                  <TableCell className="font-bold">
                    {w.name}
                    <p className="text-[10px] font-mono text-slate-400">{w.code}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {w.type === 'CENTRAL' ? 'DÉPÔT CENTRAL' : 'VIRTUEL PARTENAIRE'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 italic">
                    {w.partner?.zone || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right font-black">
                    {w.totalQuantity.toLocaleString()} Bidons
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end pr-2">
                      <StockAdjustmentDialog warehouse={w} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
