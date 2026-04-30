import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { partnerId, lines, deliveryUserId } = await req.json()

        // 1. Find Central Warehouse
        const central = await prisma.warehouse.findFirst({
            where: { type: 'CENTRAL' }
        })

        if (!central) {
            throw new Error("Dépôt central non configuré. Veuillez réceptionner du stock d'abord.")
        }

        const result = await prisma.$transaction(async (tx) => {
            // 2. Create Delivery Header
            const delivery = await tx.delivery.create({
                data: {
                    partner_id: partnerId,
                    warehouse_source_id: central.id,
                    target_date: new Date(),
                    status: 'CREATED',
                    ...(deliveryUserId ? { assigned_delivery_user_id: deliveryUserId } : {})
                }
            })

            for (const line of lines) {
                // 3. Check Central Stock
                const stockLevel = await tx.stockLevel.findUnique({
                    where: {
                        warehouse_id_product_id: {
                            warehouse_id: central.id,
                            product_id: line.productId
                        }
                    }
                })

                if (!stockLevel || stockLevel.quantity < parseFloat(line.quantity)) {
                    throw new Error(`Stock insuffisant au dépôt central pour le produit ID: ${line.productId}`)
                }

                // 4. Create Delivery Line
                await tx.deliveryLine.create({
                    data: {
                        delivery_id: delivery.id,
                        product_id: line.productId,
                        quantity_planned: parseFloat(line.quantity)
                    }
                })

                // 5. Subtract from Central Stock
                await tx.stockLevel.update({
                    where: { id: stockLevel.id },
                    data: {
                        quantity: { decrement: parseFloat(line.quantity) }
                    }
                })

                // 6. Create Stock Movement (DELIVERY_OUT)
                await tx.stockMovement.create({
                    data: {
                        movement_type: 'DELIVERY_OUT',
                        quantity: parseFloat(line.quantity),
                        product_id: line.productId,
                        warehouse_source_id: central.id,
                        source_operation_type: 'DELIVERY_CREATE',
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
