import prisma from '@/lib/prisma'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AuditDetailDialog } from '@/components/dashboard/AuditDetailDialog'

export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 100, // More logs for better audit
  })

  // Fetch user names for log.user_id
  const userIds = Array.from(new Set(logs.map(l => l.user_id).filter(Boolean))) as string[]
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, full_name: true }
  })
  const operatorMap = Object.fromEntries(users.map(u => [u.id, u.full_name]))

  // Fetch human readable names for entities
  const entitiesByType: Record<string, string[]> = {}
  logs.forEach(l => {
    if (!entitiesByType[l.entity_type]) entitiesByType[l.entity_type] = []
    entitiesByType[l.entity_type].push(l.entity_id)
  })

  const entityNameMap: Record<string, string> = {}

  // Parallel resolution
  await Promise.all([
    // Resolve Partners
    entitiesByType['PARTNER'] && prisma.partner.findMany({
      where: { id: { in: entitiesByType['PARTNER'] } },
      select: { id: true, business_name: true }
    }).then(list => list.forEach(p => entityNameMap[p.id] = p.business_name)),

    // Resolve Products
    entitiesByType['PRODUCT'] && prisma.product.findMany({
      where: { id: { in: entitiesByType['PRODUCT'] } },
      select: { id: true, name: true }
    }).then(list => list.forEach(p => entityNameMap[p.id] = p.name)),

    // Resolve Users (as entities)
    entitiesByType['USER'] && prisma.user.findMany({
      where: { id: { in: entitiesByType['USER'] } },
      select: { id: true, full_name: true }
    }).then(list => list.forEach(u => entityNameMap[u.id] = u.full_name)),

    // Resolve Deliveries (BL numbers)
    entitiesByType['DELIVERY'] && prisma.delivery.findMany({
      where: { id: { in: entitiesByType['DELIVERY'] } },
      select: { id: true, delivery_number: true }
    }).then(list => list.forEach(d => entityNameMap[d.id] = `BL-${d.delivery_number.toString().padStart(4, '0')}`)),

    // Resolve Sales (Invoice numbers)
    entitiesByType['SALE'] && prisma.sale.findMany({
      where: { id: { in: entitiesByType['SALE'] } },
      select: { id: true, sale_number: true }
    }).then(list => list.forEach(s => entityNameMap[s.id] = `FAC-${s.sale_number}`)),

    // Resolve Payments (Recu numbers)
    entitiesByType['PAYMENT'] && prisma.payment.findMany({
      where: { id: { in: entitiesByType['PAYMENT'] } },
      select: { id: true, payment_number: true }
    }).then(list => list.forEach(p => entityNameMap[p.id] = `REÇU-${p.payment_number.toString().padStart(4, '0')}`))
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A]">Journal d'Audit & Sécurité</h1>
          <p className="text-slate-500">Traçabilité inaltérable de chaque manipulation de données.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[180px]">Horodatage</TableHead>
              <TableHead>Opérateur</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Cible (Entité)</TableHead>
              <TableHead className="text-right">Détails</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-400 italic">
                  Aucun log d'audit disponible.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs font-mono text-slate-500">
                    {format(new Date(log.timestamp), 'dd/MM/yy HH:mm:ss', { locale: fr })}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {log.user_id ? (operatorMap[log.user_id] || <span className="font-mono text-xs text-slate-400">{log.user_id.slice(0, 8)}…</span>) : <span className="italic text-slate-400">Système</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-bold border-slate-200 uppercase text-[10px] bg-slate-50">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-bold uppercase border">{log.entity_type}</span>
                    <span className="font-bold text-[#0B1F3A]">
                      {entityNameMap[log.entity_id] || <span className="font-mono text-[10px] opacity-40">{log.entity_id.slice(0, 8)}...</span>}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <AuditDetailDialog log={log} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
