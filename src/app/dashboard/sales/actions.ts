'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { logAction } from '@/lib/audit'
import { getSession } from '@/lib/session'

export async function confirmDeliveryCommercial(deliveryId: string, confirmations: any[]) {
  try {
    const session = await getSession()
    return await prisma.$transaction(async (tx) => {
      // ... (lines 10-69)
      const delivery = await tx.delivery.findUnique({
        where: { id: deliveryId },
        include: { partner: { include: { warehouse: true } } }
      })

      if (!delivery || !delivery.partner.warehouse) throw new Error("Livraison ou partenaire invalide")

      let hasDiscrepancy = false

      for (const conf of confirmations) {
        const line = await tx.deliveryLine.findUnique({ where: { id: conf.lineId } })
        if (!line) continue

        const planned = line.quantity_planned
        const confirmed = conf.confirmedQty
        const delta = planned - confirmed

        await tx.deliveryLine.update({
          where: { id: conf.lineId },
          data: { quantity_confirmed: confirmed }
        })

        if (delta !== 0) {
          hasDiscrepancy = true
          await tx.discrepancyLog.create({
            data: {
              delivery_id: deliveryId,
              product_id: line.product_id,
              quantity_declared_by_delivery: line.quantity_planned,
              quantity_confirmed_by_commercial: confirmed,
              delta,
              reason: conf.reason || 'OTHER',
              status: 'OPEN'
            }
          })
        }

        await tx.stockMovement.create({
          data: {
            movement_type: 'CONSIGNMENT_ACTIVE',
            quantity: confirmed,
            product_id: line.product_id,
            warehouse_source_id: delivery.warehouse_source_id,
            warehouse_destination_id: delivery.partner.warehouse.id,
            source_operation_type: 'DELIVERY_CONFIRMATION',
            source_operation_id: delivery.id,
            justification: `Confirmation commerciale du BL #${delivery.delivery_number}`,
          },
        })
      }

      await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: hasDiscrepancy ? 'DISPUTED' : 'CONFIRMED',
          confirmed_at: new Date(),
        }
      })

      await logAction(
        session?.userId || 'SYSTEM',
        'CONFIRM_DELIVERY_COMMERCIAL',
        'DELIVERY',
        deliveryId,
        { status: 'DELIVERED' },
        { status: hasDiscrepancy ? 'DISPUTED' : 'CONFIRMED' }
      )

      revalidatePath('/dashboard/deliveries')
      revalidatePath('/dashboard/partners')
      return { success: true }
    })
  } catch (error: any) {
    return { error: error.message || "Erreur lors de la confirmation commerciale" }
  }
}

export async function declareVenteDepotVente(partnerId: string, inventory: { productId: string, remainingQty: number }[]) {
  try {
    const session = await getSession()
    return await prisma.$transaction(async (tx) => {
      const partner = await tx.partner.findUnique({
        where: { id: partnerId },
        include: { warehouse: true }
      })

      if (!partner || !partner.warehouse) throw new Error("Partenaire invalide")

      const saleLines = []
      let totalHt = 0

      for (const item of inventory) {
        const movements = await tx.stockMovement.findMany({
          where: {
            product_id: item.productId,
            warehouse_destination_id: partner.warehouse.id,
            movement_type: 'CONSIGNMENT_ACTIVE'
          }
        })

        const confirmedQty = movements.reduce((acc, curr) => acc + curr.quantity, 0)

        const previousSales = await tx.saleLine.findMany({
          where: {
            product_id: item.productId,
            sale: { partner_id: partnerId, sale_type: 'CONSIGNMENT_DECLARED' }
          }
        })
        const soldQtyCalculated = previousSales.reduce((acc, curr) => acc + curr.quantity, 0)

        const currentStock = confirmedQty - soldQtyCalculated
        const qtySoldNow = currentStock - item.remainingQty

        if (qtySoldNow > 0) {
          const product = await tx.product.findUnique({ where: { id: item.productId } })
          const price = product?.selling_price_suggested || 0

          saleLines.push({
            product_id: item.productId,
            quantity: qtySoldNow,
            unit_price: price,
            line_total: qtySoldNow * price
          })
          totalHt += qtySoldNow * price
        }
      }

      if (saleLines.length === 0) return { error: "Aucune vente détectée (stock inchangé)" }

      const sale = await tx.sale.create({
        data: {
          partner_id: partnerId,
          warehouse_id: partner.warehouse.id,
          sale_type: 'CONSIGNMENT_DECLARED',
          sale_date: new Date(),
          total_ht: totalHt,
          total_ttc: totalHt,
          status: 'VALIDATED',
          lines: { create: saleLines }
        }
      })

      await tx.invoice.create({
        data: {
          partner_id: partnerId,
          total_ht: totalHt,
          total_ttc: totalHt,
          status: 'ISSUED',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })

      for (const line of saleLines) {
        await tx.stockMovement.create({
          data: {
            movement_type: 'CONSIGNMENT_SOLD',
            quantity: line.quantity,
            product_id: line.product_id,
            warehouse_source_id: partner.warehouse.id,
            source_operation_type: 'SALE',
            source_operation_id: sale.id,
            justification: `Vente déclarée par commercial`,
          }
        })
      }

      await logAction(
        session?.userId || 'SYSTEM',
        'DECLARE_CONSIGNMENT_SALE',
        'SALE',
        sale.id,
        null,
        { total_ttc: totalHt, partner_id: partnerId }
      )

      revalidatePath('/dashboard/partners')
      revalidatePath('/dashboard/sales')
      return { success: true }
    })
  } catch (error: any) {
    return { error: error.message || "Erreur lors de la déclaration des ventes" }
  }
}
