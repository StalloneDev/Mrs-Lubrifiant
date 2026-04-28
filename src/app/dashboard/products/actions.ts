'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { logAction } from '@/lib/audit'
import { getSession } from '@/lib/session'

const productSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  name: z.string().min(1, "Le nom est requis"),
  brand: z.string().default("MRS"),
  viscosity_grade: z.string().optional(),
  container_size: z.coerce.number().optional(),
  container_unit: z.string().optional(),
  purchase_price: z.coerce.number().optional(),
  selling_price_suggested: z.coerce.number().optional(),
})

export async function createProduct(formData: FormData) {
  const data = Object.fromEntries(formData)
  const result = productSchema.safeParse(data)

  if (!result.success) {
    return { error: "Données invalides" }
  }

  try {
    const session = await getSession()
    const product = await prisma.product.create({
      data: result.data,
    })

    await logAction(
      session?.userId || 'SYSTEM',
      'CREATE_PRODUCT',
      'PRODUCT',
      product.id,
      null,
      { code: product.code, name: product.name }
    )

    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error) {
    return { error: "Erreur lors de la création" }
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const data = Object.fromEntries(formData)
  const result = productSchema.safeParse(data)

  if (!result.success) {
    return { error: "Données invalides" }
  }

  try {
    const session = await getSession()
    const before = await prisma.product.findUnique({ where: { id } })

    await prisma.product.update({
      where: { id },
      data: result.data,
    })

    await logAction(
      session?.userId || 'SYSTEM',
      'UPDATE_PRODUCT',
      'PRODUCT',
      id,
      before,
      result.data
    )

    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error) {
    return { error: "Erreur lors de la mise à jour" }
  }
}

export async function toggleProductStatus(id: string, currentStatus: boolean) {
  try {
    const session = await getSession()
    await prisma.product.update({
      where: { id },
      data: { is_active: !currentStatus },
    })

    await logAction(
      session?.userId || 'SYSTEM',
      'TOGGLE_PRODUCT_STATUS',
      'PRODUCT',
      id,
      { is_active: currentStatus },
      { is_active: !currentStatus }
    )

    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error) {
    return { error: "Erreur lors de la modification du statut" }
  }
}
