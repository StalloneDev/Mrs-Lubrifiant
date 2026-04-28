import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package, Clock, ArrowRightLeft, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const product = await prisma.product.findUnique({
        where: { id: params.id },
        include: {
            stock_levels: {
                include: { warehouse: true }
            },
            stock_movements: {
                orderBy: { created_at: 'desc' },
                take: 50,
                include: { warehouse_source: true, warehouse_destination: true }
            }
        }
    })

    if (!product) return <div>Produit introuvable.</div>
    const p = product as any

    // Aggregated central vs partner stock
    const centralStock = p.stock_levels.find((s: any) => s.warehouse?.type === 'CENTRAL')?.quantity || 0
    const consignmentStock = p.stock_levels
        .filter((s: any) => s.warehouse?.type === 'VIRTUAL_PARTNER')
        .reduce((acc: number, curr: any) => acc + curr.quantity, 0)
    const totalStock = centralStock + consignmentStock

    const getMovementIcon = (type: string, qty: number) => {
        if (qty > 0 || type === 'RECEPTION' || type === 'ADJUSTMENT_UP') return <TrendingUp className="h-4 w-4 text-emerald-500" />
        if (qty < 0 || type === 'DELIVERY' || type === 'SALE' || type === 'CONSIGNMENT_SOLD') return <TrendingDown className="h-4 w-4 text-orange-500" />
        return <RefreshCw className="h-4 w-4 text-blue-500" />
    }

    const getMovementColor = (qty: number) => {
        return qty > 0 ? "text-emerald-700 bg-emerald-50" : "text-orange-700 bg-orange-50"
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/products">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A]">{product.name}</h1>
                    <p className="text-slate-500 font-mono text-sm">{product.code}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-none shadow-sm">
                    <CardContent className="pt-6">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Stock Central</p>
                        <p className="text-2xl font-black text-[#0B1F3A]">{centralStock} <span className="text-sm font-normal text-slate-500">{product.container_unit}</span></p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="pt-6">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">En Consignation</p>
                        <p className="text-2xl font-black text-blue-600">{consignmentStock} <span className="text-sm font-normal text-slate-500">{product.container_unit}</span></p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="pt-6">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prix Catalogue</p>
                        <p className="text-xl font-bold text-[#0B1F3A]">{product.selling_price_suggested?.toLocaleString()} FCFA</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="pt-6">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Seuil d'Alerte</p>
                        <p className="text-xl font-bold text-orange-500">{product.reorder_point} {product.container_unit}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Attributes */}
                <Card className="border-none shadow-sm h-fit">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Package className="h-4 w-4 text-slate-400" />
                            Détails du Produit
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4 text-sm">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Marque</span>
                            <span className="font-medium text-[#0B1F3A]">{product.brand}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Catégorie</span>
                            <TableCell className="font-bold text-[#0B1F3A]">{product.category || 'N/A'}</TableCell>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Viscosité</span>
                            <span className="font-medium text-[#0B1F3A]">{product.viscosity_grade || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Format d'emballage</span>
                            <span className="font-medium text-[#0B1F3A]">{product.container_size} {product.container_unit}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Statut</span>
                            <Badge className={product.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}>
                                {product.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Audit Log / Movements */}
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            Historique des Mouvements de Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Localisation</TableHead>
                                    <TableHead className="text-right">Qté.</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {p.stock_movements.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-slate-400 italic">
                                            Aucun mouvement enregistré pour ce produit.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    p.stock_movements.map((mov: any) => (
                                        <TableRow key={mov.id}>
                                            <TableCell className="text-xs text-slate-500">
                                                {format(new Date(mov.created_at), 'dd/MM/yyyy HH:mm')}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-semibold text-xs text-[#0B1F3A] flex items-center gap-1.5">
                                                        {getMovementIcon(mov.movement_type, mov.quantity)}
                                                        {mov.movement_type.replace('_', ' ')}
                                                    </p>
                                                    {mov.justification && (
                                                        <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]" title={mov.justification}>
                                                            {mov.justification}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {(mov.warehouse_source || mov.warehouse_destination) ? (
                                                    <span className="flex items-center gap-1">
                                                        <ArrowRightLeft className="h-3 w-3 text-slate-400" />
                                                        <span className="font-medium text-slate-600 truncate max-w-[150px]">
                                                            {mov.warehouse_destination ? mov.warehouse_destination.name : mov.warehouse_source?.name}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Entrepôt inconnu</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge className={`${getMovementColor(mov.quantity)} border-none font-black`}>
                                                    {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
