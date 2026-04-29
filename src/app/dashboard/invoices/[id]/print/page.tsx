import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { PrintButton } from '@/components/dashboard/PrintButton'

export default async function PrintInvoicePage({ params }: { params: { id: string } }) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: params.id },
        include: {
            partner: true,
        }
    })

    if (!invoice) notFound()

    return (
        <div className="bg-white min-h-screen p-8 text-slate-900 font-sans max-w-[800px] mx-auto print:p-0">
            {/* Header */}
            <div className="flex justify-between items-start border-b-4 border-[#0B1F3A] pb-6 mb-8">
                <div>
                    <img src="/logo.png" alt="MRS Logo" className="h-16 w-16 mb-2" />
                    <h1 className="text-2xl font-black text-[#0B1F3A]">MRS BENIN S.A.</h1>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Distribution de Lubrifiants</p>
                    <p className="text-[10px] text-slate-400 mt-1">Zone Industrielle, Akpakpa, Cotonou</p>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-black text-slate-200 uppercase mb-1">Facture</h2>
                    <p className="text-lg font-bold">N° FAC-{invoice.invoice_number.toString().padStart(4, '0')}</p>
                    <p className="text-xs text-slate-500">Date d'émission: {format(new Date(invoice.created_at), 'dd/MM/yyyy', { locale: fr })}</p>
                </div>
            </div>

            {/* Partner Info */}
            <div className="grid grid-cols-2 gap-12 mb-10">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-2">Destinataire (Partenaire)</p>
                    <div className="text-sm space-y-1">
                        <p className="font-black text-[#0B1F3A] text-lg">{invoice.partner.business_name}</p>
                        <p className="font-medium">Attn: {invoice.partner.manager_name}</p>
                        <p>{invoice.partner.address_description}</p>
                        <p className="font-bold">Zone: {invoice.partner.zone}</p>
                        <p className="font-bold pt-2">Tél: {invoice.partner.phone}</p>
                    </div>
                </div>
                <div className="flex flex-col justify-end text-right pb-6">
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Date d'échéance</p>
                    <p className="text-xl font-black text-red-600">{invoice.due_date ? format(new Date(invoice.due_date), 'dd MMMM yyyy', { locale: fr }) : 'Immédiat'}</p>
                </div>
            </div>

            {/* Table Header Placeholder */}
            <div className="text-[10px] font-black uppercase text-slate-400 mb-2 px-4">Détails de la prestation / Ventes déclarées</div>
            <TablePlaceholder total={invoice.total_ttc} />

            {/* Totals */}
            <div className="flex justify-end mb-12">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm py-1">
                        <span className="text-slate-500">Total Hors Taxes</span>
                        <span className="font-bold">{invoice.total_ht.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-t">
                        <span className="text-slate-500">TVA (0%)</span>
                        <span className="font-bold">0 FCFA</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-t-2 border-[#0B1F3A]">
                        <span className="text-base font-black uppercase text-[#0B1F3A]">Total à Payer</span>
                        <span className="text-2xl font-black text-[#0B1F3A]">{invoice.total_ttc.toLocaleString()} FCFA</span>
                    </div>
                </div>
            </div>

            {/* Payment Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-12">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Instructions de Paiement</p>
                <p className="text-xs leading-relaxed text-slate-600">
                    Merci de régler cette facture avant l'échéance indiquée. <br />
                    Modes acceptés : **Espèces**, **Mobile Money (MTN/Moov)** ou **Virement Bancaire**. <br />
                    Libellé : FAC-{invoice.invoice_number.toString().padStart(4, '0')} - {invoice.partner.business_name}
                </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-12 border-t border-dashed mt-auto">
                <div className="text-center h-32 border border-slate-200 rounded p-4 flex flex-col justify-between">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Cachet et Signature Commercial</p>
                    <div className="text-[10px] italic text-slate-300">Validé informatiquement</div>
                </div>
                <div className="text-center h-32 border border-slate-200 rounded p-4 flex flex-col justify-between">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Signature Partenaire pour Accord</p>
                    <div className="text-[10px] italic text-slate-300">Mention "Bon pour accord"</div>
                </div>
            </div>

            <div className="mt-16 pt-8 border-t text-[9px] text-slate-400 text-center">
                MRS BENIN S.A. - Société Anonyme au capital de 1.000.000.000 FCFA <br />
                Siège Social : Akpakpa, Cotonou - République du Bénin <br />
                RCCM RB/COT/07 B 123 - IFU 1234567890123
            </div>

            {/* Print Button */}
            <div className="fixed bottom-8 right-8 print:hidden">
                <PrintButton label="Imprimer Facture" />
            </div>
        </div>
    )
}

function TablePlaceholder({ total }: { total: number }) {
    return (
        <table className="w-full mb-8 border-collapse">
            <thead>
                <tr className="bg-[#0B1F3A] text-white">
                    <th className="text-left py-3 px-4 text-[10px] uppercase font-bold rounded-tl-xl">Désignation</th>
                    <th className="text-center py-3 px-4 text-[10px] uppercase font-bold">P.U</th>
                    <th className="text-center py-3 px-4 text-[10px] uppercase font-bold">Qty</th>
                    <th className="text-right py-3 px-4 text-[10px] uppercase font-bold rounded-tr-xl">Total</th>
                </tr>
            </thead>
            <tbody className="text-sm">
                <tr className="border-b">
                    <td className="py-4 px-4 font-medium">Ventes de lubrifiants déclarées sur stock en dépôt-vente</td>
                    <td className="py-4 px-4 text-center italic text-slate-400">Varié</td>
                    <td className="py-4 px-4 text-center italic text-slate-400">1 lot</td>
                    <td className="py-4 px-4 text-right font-bold">{total.toLocaleString()} FCFA</td>
                </tr>
                {/* Visual filler lines */}
                {[1, 2, 3].map(i => (
                    <tr key={i} className="border-b">
                        <td className="py-4 px-4 text-transparent italic">.</td>
                        <td className="py-2 px-4"></td>
                        <td className="py-2 px-4"></td>
                        <td className="py-2 px-4"></td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
