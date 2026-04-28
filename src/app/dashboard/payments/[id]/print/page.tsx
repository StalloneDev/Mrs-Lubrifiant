import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function PrintPaymentPage({ params }: { params: { id: string } }) {
    const payment = await prisma.payment.findUnique({
        where: { id: params.id },
        include: {
            partner: true,
        }
    })

    if (!payment) notFound()

    return (
        <div className="bg-white min-h-screen p-8 text-slate-900 font-sans max-w-[800px] mx-auto print:p-0">
            <div className="flex justify-between items-start border-b-4 border-[#0B1F3A] pb-6 mb-8">
                <div>
                    <img src="/logo.png" alt="MRS Logo" className="h-16 w-16 mb-2" />
                    <h1 className="text-2xl font-black text-[#0B1F3A]">MRS BENIN S.A.</h1>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Distribution de Lubrifiants</p>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-black text-slate-200 uppercase mb-1">Reçu de Paiement</h2>
                    <p className="text-sm font-bold">N° PAY-{payment.payment_number.toString().padStart(4, '0')}</p>
                    <p className="text-xs text-slate-500">Date: {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-10">
                <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-2">Bénéficiaire</p>
                    <div className="text-sm space-y-1">
                        <p className="font-bold">MRS BENIN S.A.</p>
                        <p>Zone Industrielle, Cotonou</p>
                        <p>Tél: +229 21 XX XX XX</p>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-2">Partenaire (Client)</p>
                    <div className="text-sm space-y-1">
                        <p className="font-black text-[#0B1F3A] text-base">{payment.partner.business_name}</p>
                        <p className="font-medium">{payment.partner.manager_name}</p>
                        <p className="font-bold">Tél: {payment.partner.phone}</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-100 mb-12 text-center">
                <p className="text-xs font-bold uppercase text-slate-400 mb-2">Montant Reçu</p>
                <p className="text-5xl font-black text-[#0B1F3A] mb-2">{payment.amount.toLocaleString()} FCFA</p>
                <div className="inline-flex items-center gap-2 bg-white px-4 py-1 rounded-full border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-400">Méthode:</span>
                    <span className="text-xs font-bold text-blue-600">{payment.channel}</span>
                </div>
            </div>

            <div className="space-y-4 mb-12">
                <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-slate-500">Référence Externe</span>
                    <span className="text-sm font-mono font-bold">{payment.external_reference || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-slate-500">Statut du Paiement</span>
                    <span className="text-sm font-bold text-emerald-600 uppercase">Confirmé / Encaissé</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-12 border-t border-dashed mt-auto">
                <div className="text-center h-32 border border-slate-200 rounded p-4 flex flex-col justify-between">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Signature Caissier MRS</p>
                    <div className="text-[10px] italic text-slate-300">Document généré par le système de gestion</div>
                </div>
                <div className="text-center h-32 border border-slate-200 rounded p-4 flex flex-col justify-between">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Signature Partenaire</p>
                    <div className="text-[10px] italic text-slate-300">Pour valoir ce que de droit</div>
                </div>
            </div>

            <div className="mt-16 pt-8 border-t text-[9px] text-slate-400 text-center">
                MRS BENIN S.A. - RCCM RB/COT/07 B 123 - IFU 1234567890123 <br />
                Ce reçu confirme l'encaissement de la somme mentionnée ci-dessus pour le compte de MRS BENIN S.A.
            </div>

            <div className="fixed bottom-8 right-8 print:hidden flex gap-2">
                <button
                    onClick={() => window.print()}
                    className="bg-[#0B1F3A] text-white px-6 py-2 rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
                >
                    Imprimer / Exporter PDF
                </button>
            </div>
        </div>
    )
}
