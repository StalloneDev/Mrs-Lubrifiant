import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { PrintButton } from '@/components/dashboard/PrintButton'

export default async function PrintDeliveryPage({ params }: { params: { id: string } }) {
  const delivery = await prisma.delivery.findUnique({
    where: { id: params.id },
    include: {
      partner: true,
      lines: {
        include: { product: true }
      }
    }
  })

  if (!delivery) notFound()

  return (
    <div className="bg-white min-h-screen p-8 text-slate-900 font-sans max-w-[800px] mx-auto print:p-0">
      <div className="flex justify-between items-start border-b-4 border-[#0B1F3A] pb-6 mb-8">
        <div>
          <img src="/logo.png" alt="MRS Logo" className="h-16 w-16 mb-2" />
          <h1 className="text-2xl font-black text-[#0B1F3A]">MRS BENIN S.A.</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Distribution de Lubrifiants</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-black text-slate-200 uppercase mb-1">Bon de Livraison</h2>
          <p className="text-sm font-bold">N° BL-{delivery.delivery_number.toString().padStart(4, '0')}</p>
          <p className="text-xs text-slate-500">Date: {format(new Date(delivery.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-10">
        <div>
          <p className="text-[10px] uppercase font-black text-slate-400 mb-2">Expéditeur</p>
          <div className="text-sm space-y-1">
            <p className="font-bold">Dépôt Central MRS</p>
            <p>Zone Industrielle</p>
            <p>Cotonou, Bénin</p>
            <p>Tél: +229 21 XX XX XX</p>
          </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-[10px] uppercase font-black text-slate-400 mb-2">Destinataire (Partenaire)</p>
          <div className="text-sm space-y-1">
            <p className="font-black text-[#0B1F3A] text-base">{delivery.partner.business_name}</p>
            <p className="font-medium">{delivery.partner.manager_name}</p>
            <p>{delivery.partner.address_description}</p>
            <p>{delivery.partner.zone}</p>
            <p className="font-bold">Tél: {delivery.partner.phone}</p>
          </div>
        </div>
      </div>

      <table className="w-full text-sm mb-12">
        <thead>
          <tr className="border-b-2 border-slate-900 text-left">
            <th className="py-2">Réf. Produit</th>
            <th className="py-2">Désignation</th>
            <th className="py-2">Format</th>
            <th className="py-2 text-right">Qté Prévue</th>
            <th className="py-2 text-right">Qté Livrée</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {delivery.lines.map((line) => (
            <tr key={line.id}>
              <td className="py-3 font-mono text-xs">{line.product.code}</td>
              <td className="py-3">
                <p className="font-bold">{line.product.name}</p>
                <p className="text-[10px] text-slate-500">{line.product.category}</p>
              </td>
              <td className="py-3 uppercase text-xs">{line.product.container_size}{line.product.container_unit}</td>
              <td className="py-3 text-right">{line.quantity_planned}</td>
              <td className="py-3 text-right font-black">{line.quantity_confirmed || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-8 pt-12 border-t border-dashed mt-auto">
        <div className="text-center h-32 border border-slate-200 rounded p-2 flex flex-col justify-between">
          <p className="text-xs font-bold uppercase text-slate-400">Cachet & Signature MRS</p>
          <div className="text-[10px] italic text-slate-300">Emis par le système central</div>
        </div>
        <div className="text-center h-32 border border-slate-200 rounded p-2 flex flex-col justify-between">
          <p className="text-xs font-bold uppercase text-slate-400">Accusé de réception Partenaire</p>
          <div className="text-[10px] italic text-slate-300">Lu et approuvé</div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t text-[9px] text-slate-400 text-center">
        MRS BENIN S.A. - RC : RB/COT/07 B 123 - IFU 1234567890123 <br />
        Document généré électroniquement - Valide sans signature manuscrite pour le suivi de stock consignation.
      </div>

      <div className="fixed bottom-8 right-8 print:hidden">
        <PrintButton />
      </div>
    </div>
  )
}
