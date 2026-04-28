import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle, RefreshCcw, History, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'

export default async function StockMovementsPage() {
    const cookie = cookies().get('session')?.value
    const session = cookie ? await decrypt(cookie) : null
    const role = (session as any)?.role
    const userId = (session as any)?.userId

    let whereClause: any = {}

    // Isolation for Commercial: Only movements related to their warehouses or zone
    if (role === 'COMMERCIAL') {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        whereClause = {
            OR: [
                { warehouse_source: { partner: { OR: [{ assigned_commercial_user_id: userId }, { zone: user?.assigned_zone }] } } },
                { warehouse_destination: { partner: { OR: [{ assigned_commercial_user_id: userId }, { zone: user?.assigned_zone }] } } }
            ]
        }
    }

    const movements = await prisma.stockMovement.findMany({
        where: whereClause,
        include: {
            product: true,
            warehouse_source: true,
            warehouse_destination: true
        },
        orderBy: { created_at: 'desc' },
        take: 100
    })

    // Fetch creator names
    const creatorIds = Array.from(new Set(movements.map(m => m.created_by).filter(Boolean))) as string[]
    const creators = await prisma.user.findMany({
        where: { id: { in: creatorIds } },
        select: { id: true, full_name: true }
    })
    const creatorMap = Object.fromEntries(creators.map(u => [u.id, u.full_name]))

    const movementTypeLabels: any = {
        IN: { label: 'Entrée', color: 'bg-green-100 text-green-700', icon: ArrowDownCircle },
        OUT: { label: 'Sortie', color: 'bg-red-100 text-red-700', icon: ArrowUpCircle },
        TRANSFER: { label: 'Transfert', color: 'bg-blue-100 text-blue-700', icon: RefreshCcw },
        DELIVERY_OUT: { label: 'Livraison (Départ)', color: 'bg-orange-100 text-orange-700', icon: ArrowUpCircle },
        DELIVERY_PENDING: { label: 'Transit', color: 'bg-slate-100 text-slate-700', icon: History },
        CONSIGNMENT_ACTIVE: { label: 'Mise en Dépôt', color: 'bg-emerald-100 text-emerald-700', icon: ArrowDownCircle },
        CONSIGNMENT_SOLD: { label: 'Vente Dépôt', color: 'bg-purple-100 text-purple-700', icon: ArrowUpCircle },
        RETURN: { label: 'Retour', color: 'bg-amber-100 text-amber-700', icon: RefreshCcw },
        ADJUSTMENT: { label: 'Ajustement', color: 'bg-slate-100 text-slate-700', icon: RefreshCcw },
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/stocks">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A]">Historique des Mouvements</h1>
                        <p className="text-slate-500 text-sm">Traçabilité complète des flux de stock lubrifiants.</p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[150px]">Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Produit</TableHead>
                            <TableHead className="text-right">Quantité</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Opérateur</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {movements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-slate-400 italic">
                                    Aucun mouvement enregistré.
                                </TableCell>
                            </TableRow>
                        ) : (
                            movements.map((m) => {
                                const typeInfo = movementTypeLabels[m.movement_type] || { label: m.movement_type, color: 'bg-slate-100', icon: History }
                                return (
                                    <TableRow key={m.id} className="text-xs">
                                        <TableCell className="font-mono text-slate-500">
                                            {format(new Date(m.created_at), 'dd/MM HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`font-bold border-none ${typeInfo.color} flex items-center w-fit gap-1 text-[9px] uppercase px-1.5`}>
                                                <typeInfo.icon className="h-3 w-3" />
                                                {typeInfo.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {m.product.name}
                                            <p className="text-[10px] text-slate-400 opacity-70 font-mono">{m.product.code}</p>
                                        </TableCell>
                                        <TableCell className="text-right font-black">
                                            {m.quantity} {m.product.container_unit}
                                        </TableCell>
                                        <TableCell className="max-w-[120px] truncate" title={m.warehouse_source?.name || 'EXTERNE'}>
                                            {m.warehouse_source?.name || '-'}
                                        </TableCell>
                                        <TableCell className="max-w-[120px] truncate" title={m.warehouse_destination?.name || 'EXTERNE'}>
                                            {m.warehouse_destination?.name || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-slate-600 font-medium">{m.created_by ? (creatorMap[m.created_by] || 'Admin') : 'Système'}</span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
