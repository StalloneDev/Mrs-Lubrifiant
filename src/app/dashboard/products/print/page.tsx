import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { PrintButton } from '@/components/dashboard/PrintButton'
import { Droplets } from 'lucide-react'

export default async function PrintProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { name: 'asc' },
    })

    return (
        <div className="bg-white min-h-screen p-8 text-slate-900 font-sans max-w-[1000px] mx-auto print:p-0">
            {/* Header */}
            <div className="flex justify-between items-start border-b-4 border-[#0B1F3A] pb-6 mb-8">
                <div>
                    <img src="/logo.png" alt="MRS Logo" className="h-16 w-16 mb-2" />
                    <h1 className="text-2xl font-black text-[#0B1F3A]">MRS BENIN S.A.</h1>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Distribution de Lubrifiants</p>
                    <p className="text-[10px] text-slate-400 mt-1">Avenue Jean-Paul II, Lot Fn°4808 Les Cocotiers</p>
                    <p className="text-[10px] text-slate-400 mt-1">Cotonou, Route de L'aeroport</p>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-black text-slate-100 uppercase mb-1">Catalogue</h2>
                    <p className="text-lg font-bold uppercase tracking-tighter">Tarif des Produits</p>
                    <p className="text-xs text-slate-500 italic">Document généré le {format(new Date(), 'dd MMMM yyyy', { locale: fr })}</p>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden mb-8">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#0B1F3A] text-white">
                        <tr>
                            <th className="py-3 px-4 text-[10px] uppercase font-bold w-[60px]">Photo</th>
                            <th className="py-3 px-4 text-[10px] uppercase font-bold w-[100px]">Code</th>
                            <th className="py-3 px-4 text-[10px] uppercase font-bold">Désignation</th>
                            <th className="py-3 px-4 text-[10px] uppercase font-bold">Viscosité / Format</th>
                            <th className="py-3 px-4 text-[10px] uppercase font-bold text-right">Prix Public</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {products.map((product) => (
                            <tr key={product.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4">
                                    <div className="h-12 w-12 rounded border bg-slate-50 flex items-center justify-center overflow-hidden">
                                        {product.photo_url ? (
                                            <img src={product.photo_url} alt={product.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <Droplets className="h-6 w-6 text-slate-200" />
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4 font-mono text-xs font-bold text-slate-500 uppercase">{product.code}</td>
                                <td className="py-3 px-4">
                                    <p className="font-bold text-[#0B1F3A]">{product.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase">{product.category || 'Lubrifiant'}</p>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-600">{product.viscosity_grade || 'Multi'}</span>
                                        <span className="text-[10px] text-slate-400 italic">{product.container_size} {product.container_unit}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <span className="text-base font-black text-[#0B1F3A]">{product.selling_price_suggested?.toLocaleString()} FCFA</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t text-[9px] text-slate-400 text-center">
                Siège Social : Avenue Jean-Paul II, Lot Fn°4808 Les Cocotiers <br />
                Cotonou, Route de L'aeroport <br />
                RC : RB/COT/06/ B 44 - INSAE : 2556106573457 - IFU 3200700025313 <br />
                <span className="font-bold text-[#0B1F3A]">MRS BENIN S.A. - L'énergie de vous accompagner</span>
            </div>

            {/* Print Button */}
            <div className="fixed bottom-12 right-12 print:hidden shadow-2xl rounded-full overflow-hidden">
                <PrintButton label="Télécharger / Imprimer le Catalogue (PDF)" />
            </div>
        </div>
    )
}
