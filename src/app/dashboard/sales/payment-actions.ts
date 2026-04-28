'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { logAction } from '@/lib/audit'
import { getSession } from '@/lib/session'

const paymentSchema = z.object({
  partner_id: z.string().min(1),
  amount: z.coerce.number().min(1),
  channel: z.enum(['CASH', 'MOBILE_MONEY_MTN', 'MOBILE_MONEY_MOOV', 'BANK', 'CHECK']),
  external_reference: z.string().optional(),
})

export async function createPayment(formData: FormData) {
  const data = Object.fromEntries(formData)
  const result = paymentSchema.safeParse(data)

  if (!result.success) return { error: "Données invalides" }

  const { partner_id, amount, channel, external_reference } = result.data

  try {
    const session = await getSession()
    return await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          partner_id,
          amount,
          channel,
          external_reference,
        }
      })

      // Simple allocation: find oldest unpaid invoices
      const invoices = await tx.invoice.findMany({
        where: { partner_id, status: { in: ['ISSUED', 'PARTIALLY_PAID'] } },
        orderBy: { created_at: 'asc' }
      })

      let remainingPayment = amount
      for (const invoice of invoices) {
        if (remainingPayment <= 0) break

        // Find how much is already paid on this invoice
        const allocations = await tx.paymentAllocation.findMany({ where: { invoice_id: invoice.id } })
        const alreadyPaid = allocations.reduce((acc, curr) => acc + curr.amount_allocated, 0)
        const unpaidOnInvoice = invoice.total_ttc - alreadyPaid

        const toAllocate = Math.min(remainingPayment, unpaidOnInvoice)

        if (toAllocate > 0) {
          await tx.paymentAllocation.create({
            data: {
              payment_id: payment.id,
              invoice_id: invoice.id,
              amount_allocated: toAllocate
            }
          })

          remainingPayment -= toAllocate

          if (toAllocate === unpaidOnInvoice) {
            await tx.invoice.update({ where: { id: invoice.id }, data: { status: 'PAID' } })
          } else {
            await tx.invoice.update({ where: { id: invoice.id }, data: { status: 'PARTIALLY_PAID' } })
          }
        }
      }

      revalidatePath('/dashboard/partners')
      revalidatePath('/dashboard/sales')
      return { success: true }
    })
  } catch (error: any) {
    return { error: error.message || "Erreur lors de l'enregistrement du paiement" }
  }
}
