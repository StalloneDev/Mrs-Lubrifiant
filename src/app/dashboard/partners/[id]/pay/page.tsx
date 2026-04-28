import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PaymentRecording from '@/components/dashboard/PaymentRecording'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function PayPage({ params }: { params: { id: string } }) {
  const partner = await prisma.partner.findUnique({
    where: { id: params.id },
    include: {
      sales: true,
      payments: true
    }
  })

  if (!partner) notFound()

  const totalSales = partner.sales.reduce((acc, curr) => acc + curr.total_ttc, 0)
  const totalPaid = partner.payments.reduce((acc, curr) => acc + curr.amount, 0)
  const balance = totalSales - totalPaid

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Link href={`/dashboard/partners/${params.id}`} className="flex items-center gap-2 text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Encaisser Règlement</h1>
        <p className="text-slate-500">{partner.business_name}</p>
      </div>
      <PaymentRecording partnerId={params.id} balance={balance} />
    </div>
  )
}
