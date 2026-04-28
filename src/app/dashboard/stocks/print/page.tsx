import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function StockPrintPage() {
    const warehouses = await prisma.warehouse.findMany({
        include: {
            partner: true,
            stock_levels: {
                include: { product: true }
            }
        },
        orderBy: { type: 'asc' }
    })

    return (
        <div className="p-8 bg-white text-black min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-tighter">MRS BENIN S.A.</h1>
                    <p className="text-sm font-bold">Plateforme de Distribution Lubrifiants</p>
                    <p className="text-xs mt-1">Cotonou, Bénin</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold uppercase">État Global des Stocks</h2>
                    <p className="text-sm">Généré le : {format(new Date(), 'dd MMMM yyyy HH:mm', { locale: fr })}</p>
                </div>
            </div>

            <div className="space-y-10">
                {warehouses.map(w => (
                    <div key={w.id} className="break-inside-avoid">
                        <h3 className="bg-slate-100 p-2 font-bold uppercase text-sm border-l-4 border-black mb-4 flex justify-between">
                            <span>{w.type === 'CENTRAL' ? 'DÉPÔT CENTRAL' : `PARTENAIRE : ${w.partner?.business_name}`}</span>
                            <span className="text-[10px] font-mono">{w.code}</span>
                        </h3>

                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-black">
                                    <th className="text-left py-2 font-bold uppercase">Code Produit</th>
                                    <th className="text-left py-2 font-bold uppercase">Désignation</th>
                                    <th className="text-right py-2 font-bold uppercase">Quantité</th>
                                    <th className="text-right py-2 font-bold uppercase">Valeur Est. (PV)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {w.stock_levels.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-4 text-center italic text-slate-400">Aucun produit en stock.</td>
                                    </tr>
                                ) : (
                                    w.stock_levels.map(stock => (
                                        <tr key={stock.id} className="hover:bg-slate-50">
                                            <td className="py-2 font-mono">{stock.product.code}</td>
                                            <td className="py-2">{stock.product.name} ({stock.product.container_unit})</td>
                                            <td className="py-2 text-right font-bold">{stock.quantity}</td>
                                            <td className="py-2 text-right">
                                                {((stock.quantity || 0) * (stock.product.selling_price_suggested || 0)).toLocaleString()} FCFA
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-black font-bold">
                                    <td colSpan={2} className="py-2 text-right uppercase">TOTAL DEPOT</td>
                                    <td className="py-2 text-right">
                                        {w.stock_levels.reduce((acc, s) => acc + (s.quantity || 0), 0)}
                                    </td>
                                    <td className="py-2 text-right">
                                        {w.stock_levels.reduce((acc, s) => acc + ((s.quantity || 0) * (s.product.selling_price_suggested || 0)), 0).toLocaleString()} FCFA
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-20 pt-10 border-t border-dotted border-slate-300 text-[10px] text-center text-slate-400 italic">
                Document généré automatiquement par le système MRS Lubricants.
                Page 1/1 - Toute reproduction sans autorisation est interdite.
            </div>

            {/* Auto-print script */}
            <script dangerouslySetInnerHTML={{ __html: 'window.print()' }} />
        </div>
    )
}
