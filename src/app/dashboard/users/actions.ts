'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'
import { logAction } from '@/lib/audit'
import { getSession } from '@/lib/session'

const userSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'COMMERCIAL', 'DELIVERY', 'MANAGER']),
  phone: z.string().optional(),
})

const updateUserSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'COMMERCIAL', 'DELIVERY', 'MANAGER']),
  phone: z.string().optional(),
})

export async function createUser(formData: FormData) {
  const data = Object.fromEntries(formData)
  const result = userSchema.safeParse(data)

  if (!result.success) return { error: "Données invalides" }

  const { full_name, email, password, role, phone } = result.data

  try {
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        full_name,
        email,
        password_hash: hashedPassword,
        role,
        phone,
      }
    })

    const session = await getSession()
    await logAction(
      session?.userId || 'SYSTEM',
      'CREATE_USER',
      'USER',
      user.id,
      null,
      { full_name, email, role }
    )

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Erreur lors de la création de l'utilisateur" }
  }
}

export async function updateUser(formData: FormData) {
  const data = Object.fromEntries(formData)
  const result = updateUserSchema.safeParse(data)

  if (!result.success) return { error: "Données invalides" }

  const { id, full_name, email, role, phone } = result.data

  try {
    const before = await prisma.user.findUnique({ where: { id } })
    await prisma.user.update({
      where: { id },
      data: {
        full_name,
        email,
        role,
        phone,
      }
    })

    const session = await getSession()
    await logAction(
      session?.userId || 'SYSTEM',
      'UPDATE_USER',
      'USER',
      id,
      before,
      { full_name, email, role, phone }
    )

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Erreur lors de la mise à jour" }
  }
}

export async function toggleUserStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.user.update({
      where: { id },
      data: { is_active: !currentStatus }
    })

    const session = await getSession()
    await logAction(
      session?.userId || 'SYSTEM',
      'TOGGLE_USER_STATUS',
      'USER',
      id,
      { is_active: currentStatus },
      { is_active: !currentStatus }
    )

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error) {
    return { error: "Erreur lors du changement de statut" }
  }
}

export async function resetUserPassword(id: string, newPassword: string) {
  try {
    const hashedPassword = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id },
      data: { password_hash: hashedPassword }
    })

    const session = await getSession()
    await logAction(
      session?.userId || 'SYSTEM',
      'RESET_PASSWORD',
      'USER',
      id,
      null,
      { action: 'Password reset by admin' }
    )

    return { success: true }
  } catch (error) {
    return { error: "Erreur lors de la réinitialisation" }
  }
}
