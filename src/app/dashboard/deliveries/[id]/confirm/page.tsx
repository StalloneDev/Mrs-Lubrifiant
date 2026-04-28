import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import CommercialConfirmation from '@/components/dashboard/CommercialConfirmation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ConfirmDeliveryPage({ params }: { params: { id: string } }) {
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
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href={`/dashboard/partners/${delivery.partner_id}`} className="flex items-center gap-2 text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Vérification de Livraison</h1>
        <p className="text-slate-500">Comptage contradictoire du BL #{delivery.delivery_number} chez {delivery.partner.business_name}</p>
      </div>
      <CommercialConfirmation delivery={delivery} />
    </div>
  )
}
