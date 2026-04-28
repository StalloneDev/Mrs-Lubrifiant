import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { logAction } from "@/lib/audit"

export async function POST(req: Request) {
  try {
    const { partnerId, items } = await req.json()
    const session = await getSession()

    // Check if it's a direct sale (no partner or explicitly "direct")
    const isDirectSale = !partnerId || partnerId === "direct" || partnerId === ""

    let warehouseId: string
    let partner: any = null
    let commissionAmount = 0
    let partnerNameForLog = "Vente Comptoir"

    if (isDirectSale) {
      // Find Central Warehouse
      const centralWarehouse = await prisma.warehouse.findFirst({
        where: { type: 'CENTRAL' }
      })
      if (!centralWarehouse) {
        throw new Error("Dépôt central introuvable pour la vente directe")
      }
      warehouseId = centralWarehouse.id
    } else {
      partner = await prisma.partner.findUnique({
        where: { id: partnerId },
        include: { warehouse: true }
      })

      if (!partner || !partner.warehouse) {
        throw new Error("Partenaire ou dépôt virtuel introuvable")
      }
      warehouseId = partner.warehouse.id
      commissionAmount = items.reduce((acc: number, item: any) => acc + (parseFloat(item.quantity) * parseFloat(item.price)), 0) * (partner.commission_rate / 100)
      partnerNameForLog = partner.business_name
    }

    const totalAmount = items.reduce((acc: number, item: any) => acc + (parseFloat(item.quantity) * parseFloat(item.price)), 0)

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Sale
      const sale = await tx.sale.create({
        data: {
          partner_id: isDirectSale ? null : partnerId,
          sale_date: new Date(),
          total_ht: totalAmount,
          total_ttc: totalAmount,
          commission_amount: commissionAmount,
          status: 'VALIDATED',
          sale_type: isDirectSale ? 'DIRECT' : 'CONSIGNMENT_DECLARED',
          warehouse_id: warehouseId,
          lines: {
            create: items.map((item: any) => ({
              product_id: item.productId,
              quantity: parseFloat(item.quantity),
              unit_price: parseFloat(item.price),
              line_total: parseFloat(item.quantity) * parseFloat(item.price)
            }))
          }
        }
      })

      // 1.5 Create Invoice if for Partner
      if (!isDirectSale) {
        await tx.invoice.create({
          data: {
            partner_id: partnerId,
            total_ht: totalAmount,
            total_ttc: totalAmount,
            status: 'ISSUED',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        })
      }

      // 2. Logic: Subtract from Warehouse
      for (const item of items) {
        const product_id = item.productId
        const qty = parseFloat(item.quantity)

        // Check if stock is available
        const stockLevel = await tx.stockLevel.findUnique({
          where: {
            warehouse_id_product_id: {
              warehouse_id: warehouseId,
              product_id: product_id
            }
          }
        })

        if (!stockLevel || stockLevel.quantity < qty) {
          throw new Error(`Stock insuffisant en magasin pour le produit ID: ${product_id}. Disponible: ${stockLevel?.quantity || 0}`)
        }

        // Update Level
        await tx.stockLevel.update({
          where: { id: stockLevel.id },
          data: { quantity: { decrement: qty } }
        })

        // Track Movement
        await tx.stockMovement.create({
          data: {
            movement_type: isDirectSale ? 'OUT' : 'CONSIGNMENT_SOLD',
            quantity: -qty,
            product_id: product_id,
            warehouse_source_id: warehouseId,
            source_operation_type: 'SALE',
            source_operation_id: sale.id,
            justification: `Vente ${isDirectSale ? 'comptoir' : 'dépositaire'} - ${partnerNameForLog}`
          }
        })
      }

      await logAction(
        session?.userId || 'SYSTEM',
        isDirectSale ? 'CREATE_DIRECT_SALE' : 'CREATE_CONSIGNMENT_SALE',
        'SALE',
        sale.id,
        null,
        { total_ttc: totalAmount, items_count: items.length }
      )

      return sale
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
