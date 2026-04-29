import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Calendar, MapPin, ArrowLeft, Package, User } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function SaleDetailsPage({ params }: { params: { id: string } }) {
    const sale = await prisma.sale.findUnique({
        where: { id: params.id },
        include: {
            partner: true,
            lines: {
                include: {
                    product: true
                }
            }
        }
    })

    if (!sale) notFound()

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/sales">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-200">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-[#0B1F3A] flex items-center gap-2">
                        Vente #{sale.sale_number}
                        <Badge className="bg-[#C9A961] hover:bg-[#B89850]">{sale.status}</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Créée le {format(new Date(sale.sale_date), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-5 w-5 text-[#0B1F3A]" />
                        <h2 className="text-lg font-bold text-[#0B1F3A]">Client / Partenaire</h2>
                    </div>
                    {sale.partner ? (
                        <div className="space-y-2 text-sm">
                            <p className="text-xl font-black text-slate-800">{sale.partner.business_name}</p>
                            <p className="text-slate-500 font-medium flex items-center gap-2">
                                <User className="h-4 w-4" /> {sale.partner.manager_name}
                            </p>
                            <p className="text-slate-500">{sale.partner.address_description}</p>
                            <p className="text-slate-500 font-bold bg-slate-100 w-fit px-2 py-1 rounded">{sale.partner.zone}</p>
                        </div>
                    ) : (
                        <div className="py-4 text-slate-500 italic">Vente Directe (Comptoir)</div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Montant Total de la Vente</p>
                    <p className="text-4xl font-black text-[#0B1F3A] mb-4">
                        {sale.total_ttc?.toLocaleString()} <span className="text-lg font-bold text-slate-400">FCFA</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-500">Mode de paiement : </p>
                        <Badge variant="outline" className="font-bold border-green-200 text-green-700 bg-green-50 uppercase tracking-wider">
                            {sale.sale_type.replace('_', ' ')}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mt-6">
                <div className="px-6 py-4 border-b bg-slate-50/50 flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#0B1F3A]" />
                    <h2 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wider">Produits Vendus</h2>
                </div>
                <div className="p-0">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50">
                                <th className="p-4 font-bold">Produit</th>
                                <th className="p-4 font-bold text-center">Quantité</th>
                                <th className="p-4 font-bold text-right">Prix Unitaire</th>
                                <th className="p-4 font-bold text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {sale.lines.map((line) => (
                                <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-slate-800">{line.product.name}</p>
                                        <p className="text-xs text-slate-400 font-mono mt-0.5">{line.product.code} • {line.product.container_unit}</p>
                                    </td>
                                    <td className="p-4 text-center font-black text-slate-700">
                                        {line.quantity}
                                    </td>
                                    <td className="p-4 text-right tabular-nums text-slate-600 font-medium">
                                        {line.unit_price.toLocaleString()} FCFA
                                    </td>
                                    <td className="p-4 text-right tabular-nums font-bold text-[#0B1F3A]">
                                        {(line.line_total || 0).toLocaleString()} FCFA
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {/* Footer de table */}
                        <tfoot>
                            <tr className="bg-slate-50/80 border-t-2 border-slate-200">
                                <td colSpan={3} className="p-4 text-right text-xs font-black uppercase text-slate-500">
                                    Total Général
                                </td>
                                <td className="p-4 text-right font-black text-xl text-[#0B1F3A] tabular-nums">
                                    {sale.total_ttc?.toLocaleString()} FCFA
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    )
}
