import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { deliveryId, confirmedLines, gps_lat, gps_lng } = await req.json()

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Delivery status
      const delivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: 'DELIVERED',
          confirmed_at: new Date(),
          gps_lat_delivered: gps_lat,
          gps_lng_delivered: gps_lng
        },
        include: { partner: { include: { warehouse: true } }, lines: true }
      })

      if (!delivery.partner.warehouse) {
          throw new Error("Le partenaire n'a pas de dépôt virtuel configuré.")
      }

      // 2. Process each line
      for (const line of confirmedLines) {
        const originalLine = delivery.lines.find(l => l.id === line.id)
        const planned = originalLine?.quantity_planned || 0
        const confirmed = parseFloat(line.quantity)

        await tx.deliveryLine.update({
          where: { id: line.id },
          data: {
            quantity_confirmed: confirmed,
          }
        })

        // 3. Log Discrepancy if different
        if (confirmed !== planned) {
            await tx.discrepancyLog.create({
                data: {
                    delivery_id: deliveryId,
                    product_id: line.productId,
                    quantity_declared_by_delivery: planned,
                    quantity_confirmed_by_commercial: confirmed,
                    delta: confirmed - planned,
                    reason: 'OTHER', // Default or from UI if updated
                    status: 'OPEN'
                }
            })
        }

        // 4. Update Partner Stock Level
        await tx.stockLevel.upsert({
          where: {
            warehouse_id_product_id: {
              warehouse_id: delivery.partner.warehouse.id,
              product_id: line.productId
            }
          },
          update: {
            quantity: { increment: parseFloat(line.quantity) }
          },
          create: {
            warehouse_id: delivery.partner.warehouse.id,
            product_id: line.productId,
            quantity: parseFloat(line.quantity)
          }
        })

        // 4. Create Stock Movement (CONSIGNMENT_ACTIVE)
        await tx.stockMovement.create({
          data: {
            movement_type: 'CONSIGNMENT_ACTIVE',
            quantity: parseFloat(line.quantity),
            product_id: line.productId,
            warehouse_destination_id: delivery.partner.warehouse.id,
            warehouse_source_id: delivery.warehouse_source_id,
            source_operation_type: 'DELIVERY_CONFIRM',
            source_operation_id: delivery.id,
          }
        })
      }

      return delivery
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
