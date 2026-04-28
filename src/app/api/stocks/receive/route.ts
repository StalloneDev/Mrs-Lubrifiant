import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // Find or Create Central Warehouse
    let central = await prisma.warehouse.findFirst({
        where: { type: 'CENTRAL' }
    })

    if (!central) {
        central = await prisma.warehouse.create({
            data: {
                code: 'WH-CENTRAL',
                name: 'Dépôt Central MRS',
                type: 'CENTRAL'
            }
        })
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Movement
      const movement = await tx.stockMovement.create({
        data: {
          movement_type: 'IN',
          quantity: parseFloat(data.quantity),
          unit_value: data.unit_value ? parseFloat(data.unit_value) : null,
          product_id: data.product_id,
          warehouse_destination_id: central!.id,
          justification: data.justification,
          source_operation_type: 'RECEPTION'
        }
      })

      // 2. Update StockLevel
      await tx.stockLevel.upsert({
          where: {
              warehouse_id_product_id: {
                  warehouse_id: central!.id,
                  product_id: data.product_id
              }
          },
          update: {
              quantity: { increment: parseFloat(data.quantity) }
          },
          create: {
              warehouse_id: central!.id,
              product_id: data.product_id,
              quantity: parseFloat(data.quantity)
          }
      })

      return movement
    })

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
