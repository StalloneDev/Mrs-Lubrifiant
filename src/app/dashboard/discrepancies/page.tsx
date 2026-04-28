import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertCircle, History } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ResolveDiscrepancyDialog } from '@/components/dashboard/ResolveDiscrepancyDialog'

export default async function DiscrepanciesPage() {
  const discrepancies = await prisma.discrepancyLog.findMany({
    include: {
      delivery: { include: { partner: true } },
      product: true
    },
    orderBy: { created_at: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A]">Gestion des Litiges</h1>
          <p className="text-slate-500">Suivi des écarts constatés lors des livraisons chez les partenaires.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-none shadow-sm bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-red-600">Litiges Ouverts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#0B1F3A]">
              {discrepancies.filter(d => d.status === 'OPEN').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>N° Bon</TableHead>
              <TableHead>Partenaire</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead className="text-right">Écart (Delta)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discrepancies.map(d => (
              <TableRow key={d.id}>
                <TableCell className="text-xs">
                  {format(new Date(d.created_at), 'dd/MM HH:mm', { locale: fr })}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  BL-{d.delivery.delivery_number.toString().padStart(4, '0')}
                </TableCell>
                <TableCell className="font-bold">
                  {d.delivery.partner.business_name}
                </TableCell>
                <TableCell>
                  {d.product.name}
                </TableCell>
                <TableCell className="text-right">
                  <span className={d.delta! < 0 ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>
                    {d.delta! > 0 ? `+${d.delta}` : d.delta}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={d.status === 'OPEN' ? 'destructive' : d.status === 'INVESTIGATING' ? 'secondary' : 'default'}
                    className="text-[10px]"
                  >
                    {d.status === 'OPEN' ? 'À RÉSOUDRE' : d.status === 'INVESTIGATING' ? 'INVESTIGATION' : 'TRAITÉ'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ResolveDiscrepancyDialog discrepancy={d} />
                </TableCell>
              </TableRow>
            ))}
            {discrepancies.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-slate-400 italic">
                  Aucun litige enregistré pour le moment.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
