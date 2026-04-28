'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { logAction } from '@/lib/audit'
import { getSession } from '@/lib/session'

const partnerSchema = z.object({
  // ... existing schema ...
  business_name: z.string().min(1, "Nom de l'entreprise requis"),
  manager_name: z.string().min(1, "Nom du gérant requis"),
  phone: z.string().min(1, "Téléphone requis"),
  mobile_money_number: z.string().optional(),
  mobile_money_operator: z.string().optional(),
  address_description: z.string().optional(),
  gps_lat: z.coerce.number().optional(),
  gps_lng: z.coerce.number().optional(),
  zone: z.string().optional(),
  assigned_commercial_user_id: z.string().optional(),
  commission_rate: z.coerce.number().default(0),
})

export async function createPartner(formData: FormData) {
  const data = Object.fromEntries(formData)
  const result = partnerSchema.safeParse(data)

  if (!result.success) {
    return { error: "Données invalides" }
  }

  try {
    const session = await getSession()
    // Generate a unique code (simplified for MVP)
    const count = await prisma.partner.count()
    const code = `PART-${(count + 1).toString().padStart(4, '0')}`

    const partner = await prisma.partner.create({
      data: {
        ...result.data,
        code,
      },
    })

    await logAction(
      session?.userId || 'SYSTEM',
      'CREATE_PARTNER',
      'PARTNER',
      partner.id,
      null,
      { business_name: partner.business_name, code: partner.code }
    )

    revalidatePath('/dashboard/partners')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Erreur lors de la création" }
  }
}

export async function updatePartnerStatus(id: string, status: any) {
  try {
    const session = await getSession()
    const before = await prisma.partner.findUnique({ where: { id } })

    await prisma.partner.update({
      where: { id },
      data: { status },
    })

    await logAction(
      session?.userId || 'SYSTEM',
      'UPDATE_PARTNER_STATUS',
      'PARTNER',
      id,
      { status: before?.status },
      { status }
    )

    revalidatePath('/dashboard/partners')
    return { success: true }
  } catch (error) {
    return { error: "Erreur lors de la mise à jour du statut" }
  }
}
