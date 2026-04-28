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
import { Button } from '@/components/ui/button'
import { Eye, History, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 50,
  })

  // Fetch user names to replace raw IDs
  const userIds = Array.from(new Set(logs.map(l => l.user_id).filter(Boolean))) as string[]
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, full_name: true }
  })
  const userMap = Object.fromEntries(users.map(u => [u.id, u.full_name]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journal d'Audit</h1>
          <p className="text-slate-500">Historique complet des actions effectuées sur la plateforme.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[180px]">Horodatage</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entité</TableHead>
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
                    {log.user_id ? (userMap[log.user_id] || <span className="font-mono text-xs text-slate-400">{log.user_id.slice(0, 8)}…</span>) : <span className="italic text-slate-400">Système</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-bold border-slate-200">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="text-slate-400 mr-2">{log.entity_type}</span>
                    <span className="font-mono text-[10px] bg-slate-100 p-1 rounded">{log.entity_id.slice(0, 8)}...</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <History className="h-4 w-4" />
                    </Button>
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
