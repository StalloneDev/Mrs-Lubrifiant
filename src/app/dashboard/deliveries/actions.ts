'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { logAction } from '@/lib/audit'
import { getSession } from '@/lib/session'

const deliveryLineSchema = z.object({
  product_id: z.string().min(1),
  quantity_planned: z.coerce.number().min(0.1),
})

const deliverySchema = z.object({
  partner_id: z.string().min(1),
  assigned_delivery_user_id: z.string().min(1),
  target_date: z.string().min(1),
  warehouse_source_id: z.string().min(1),
  lines: z.array(deliveryLineSchema).min(1),
})

export async function createDelivery(formData: FormData) {
  // Parsing the complex lines array from form data
  const rawData = Object.fromEntries(formData)
  const linesIds = formData.getAll('product_id') as string[]
  const linesQtys = formData.getAll('quantity_planned') as string[]

  const parsedLines = linesIds.map((id, index) => ({
    product_id: id,
    quantity_planned: parseFloat(linesQtys[index]),
  }))

  const result = deliverySchema.safeParse({
    partner_id: rawData.partner_id,
    assigned_delivery_user_id: rawData.assigned_delivery_user_id,
    target_date: rawData.target_date,
    warehouse_source_id: rawData.warehouse_source_id,
    lines: parsedLines,
  })

  if (!result.success) {
    return { error: "Données de livraison invalides" }
  }

  const { partner_id, assigned_delivery_user_id, target_date, warehouse_source_id, lines } = result.data

  try {
    const session = await getSession()
    const partner = await prisma.partner.findUnique({
      where: { id: partner_id },
      include: { warehouse: true }
    })

    if (!partner) return { error: "Partenaire non trouvé" }

    // STOCK CEILING CHECK
    if (partner.stock_ceiling_amount && partner.stock_ceiling_amount > 0) {
      // 1. Calculate current consignment quantity
      const stockLevels = await prisma.stockLevel.findMany({
        where: { warehouse_id: partner.warehouse?.id },
      })

      const currentStockQuantity = stockLevels.reduce((acc, level) => acc + level.quantity, 0)

      // 2. Calculate new delivery quantity
      const newDeliveryQuantity = lines.reduce((acc, line) => acc + line.quantity_planned, 0)

      if ((currentStockQuantity + newDeliveryQuantity) > partner.stock_ceiling_amount) {
        return {
          error: `Plafond de stock dépassé. Quantité actuelle: ${currentStockQuantity} unités. Nouvelle: ${newDeliveryQuantity} unités. Plafond autorisé: ${partner.stock_ceiling_amount} unités.`
        }
      }
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Create the delivery
      const delivery = await tx.delivery.create({
        data: {
          partner_id,
          assigned_delivery_user_id,
          target_date: new Date(target_date),
          warehouse_source_id,
          status: 'ASSIGNED',
          lines: {
            create: lines.map(line => ({
              product_id: line.product_id,
              quantity_planned: line.quantity_planned,
            })),
          },
        },
      })

      // 2. Track stock movement (Reserved from Central)
      for (const line of lines) {
        await tx.stockMovement.create({
          data: {
            movement_type: 'DELIVERY_PENDING',
            quantity: line.quantity_planned,
            product_id: line.product_id,
            warehouse_source_id,
            source_operation_type: 'DELIVERY',
            source_operation_id: delivery.id,
            justification: `Livraison n°${delivery.delivery_number} assignée`,
          },
        })
      }

      await logAction(
        session?.userId || 'SYSTEM',
        'CREATE_DELIVERY',
        'DELIVERY',
        delivery.id,
        null,
        { partner_id, delivery_number: (delivery as any).delivery_number }
      )

      revalidatePath('/dashboard/deliveries')
      return { success: true, deliveryId: delivery.id }
    })
  } catch (error: any) {
    return { error: error.message || "Erreur lors de la création du bon de livraison" }
  }
}

export async function executeDelivery(deliveryId: string, signedData: {
  lines: { id: string, productId: string, qty: number }[],
  signature_url: string,
  photo_url: string,
  gps: { lat: number, lng: number }
}) {
  try {
    const session = await getSession()
    return await prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.findUnique({
        where: { id: deliveryId },
        include: { partner: { include: { warehouse: true } } }
      })

      if (!delivery) throw new Error("Livraison non trouvée")
      if (!delivery.partner.warehouse) throw new Error("L'entrepôt virtuel du partenaire n'existe pas")

      // Update delivery lines and status
      for (const line of signedData.lines) {
        await tx.deliveryLine.update({
          where: { id: line.id },
          data: { quantity_delivered: line.qty }
        })

        // STOCK LOGIC: 
        // We move the confirmed quantity to the virtual partner warehouse with DELIVERY_PENDING status
        await tx.stockMovement.create({
          data: {
            movement_type: 'DELIVERY_PENDING',
            quantity: line.qty,
            product_id: line.productId,
            warehouse_source_id: delivery.warehouse_source_id,
            warehouse_destination_id: delivery.partner.warehouse.id,
            source_operation_type: 'DELIVERY',
            source_operation_id: delivery.id,
            justification: `Livraison effectuée par livreur`,
          },
        })
      }

      await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: 'DELIVERED',
          delivered_at: new Date(),
          signature_image_url: signedData.signature_url,
          photo_url: signedData.photo_url,
          gps_lat_delivered: signedData.gps.lat,
          gps_lng_delivered: signedData.gps.lng,
        }
      })

      revalidatePath('/dashboard/deliveries')
      return { success: true }
    })
  } catch (error: any) {
    return { error: error.message || "Erreur lors de l'exécution" }
  }
}
