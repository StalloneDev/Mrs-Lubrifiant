import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import SaleDeclaration from '@/components/dashboard/SaleDeclaration'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function SellPage({ params }: { params: { id: string } }) {
  const partner = await prisma.partner.findUnique({
    where: { id: params.id },
    include: { warehouse: true }
  })

  if (!partner || !partner.warehouse) notFound()

  // Find all confirmed consignment products for this partner
  const movements = await prisma.stockMovement.findMany({
      where: {
          warehouse_destination_id: partner.warehouse.id,
          movement_type: 'CONSIGNMENT_ACTIVE'
      },
      include: { product: true }
  })

  // Group by product and calculate theoretical stock
  // (Simplified for MVP, logic should be in a lib later)
  const stockMap: Record<string, { productId: string, name: string, currentQty: number, price: number }> = {}
  
  movements.forEach((m: any) => {
      if (!stockMap[m.product_id]) {
          stockMap[m.product_id] = { 
              productId: m.product_id, 
              name: m.product.name, 
              currentQty: 0, 
              price: m.product.selling_price_suggested || 0
          }
      }
      stockMap[m.product_id].currentQty += m.quantity
  })

  // Subtract already sold quantities
  const soldMovements = await prisma.stockMovement.findMany({
      where: {
          warehouse_source_id: partner.warehouse.id,
          movement_type: 'CONSIGNMENT_SOLD'
      }
  })
  
  soldMovements.forEach((m: any) => {
      if (stockMap[m.product_id]) {
          stockMap[m.product_id].currentQty -= m.quantity
      }
  })

  const currentConsignment = Object.values(stockMap).filter(i => i.currentQty > 0)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href={`/dashboard/partners/${params.id}`} className="flex items-center gap-2 text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <div>
        <h1 className="text-3xl font-black text-[#0B1F3A]">Inventaire & Ventes</h1>
        <p className="text-slate-500 font-medium">Point de vente : {partner.business_name}</p>
      </div>
      
      {currentConsignment.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed text-slate-400">
              Aucun stock en dépôt-vente actif chez ce partenaire.
          </div>
      ) : (
          <SaleDeclaration partnerId={params.id} currentConsignment={currentConsignment} />
      )}
    </div>
  )
}
