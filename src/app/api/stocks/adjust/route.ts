import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { logAction } from "@/lib/audit"

export async function POST(req: Request) {
    try {
        const { product_id, quantity, type, warehouse_id, justification } = await req.json()
        const session = await getSession()

        if (!product_id || !quantity || !type || !warehouse_id) {
            return NextResponse.json({ error: "Champs manquants" }, { status: 400 })
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Get warehouse to check type
            const warehouse = await tx.warehouse.findUnique({ where: { id: warehouse_id } })

            // 2. Identify destination for returns
            let destinationId = null
            if (type === 'RETURN') {
                const central = await tx.warehouse.findFirst({ where: { type: 'CENTRAL' } })
                destinationId = central?.id
            }

            // 3. Create movement
            const movement = await tx.stockMovement.create({
                data: {
                    movement_type: type, // ADJUSTMENT or RETURN
                    quantity: parseFloat(quantity),
                    product_id,
                    warehouse_source_id: warehouse_id,
                    warehouse_destination_id: destinationId,
                    justification,
                    source_operation_type: 'MANUAL_ADJUSTMENT'
                }
            })

            // 4. Update Stock Level (Decrease source)
            await tx.stockLevel.update({
                where: {
                    warehouse_id_product_id: {
                        warehouse_id,
                        product_id
                    }
                },
                data: {
                    quantity: { decrement: parseFloat(quantity) }
                }
            })

            // 5. If RETURN, increase Central
            if (type === 'RETURN' && destinationId) {
                await tx.stockLevel.upsert({
                    where: {
                        warehouse_id_product_id: {
                            warehouse_id: destinationId,
                            product_id
                        }
                    },
                    update: { quantity: { increment: parseFloat(quantity) } },
                    create: {
                        warehouse_id: destinationId,
                        product_id,
                        quantity: parseFloat(quantity)
                    }
                })
            }

            return movement
        })

        await logAction(
            session?.userId || 'SYSTEM',
            `STOCK_${type}`,
            'STOCK',
            result.id,
            {},
            { product_id, quantity, warehouse_id, type, justification }
        )

        return NextResponse.json({ success: true, movement: result })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
