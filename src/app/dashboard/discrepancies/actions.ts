'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { logAction } from '@/lib/audit'
import { getSession } from '@/lib/session'

export async function resolveDiscrepancy(id: string, status: 'INVESTIGATING' | 'RESOLVED' | 'WRITTEN_OFF', notes: string) {
    try {
        const session = await getSession()
        if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
            return { error: "Accès refusé. Seuls les Admins peuvent résoudre les litiges." }
        }

        const before = await prisma.discrepancyLog.findUnique({ where: { id } })
        if (!before) return { error: "Litige non trouvé" }

        await prisma.discrepancyLog.update({
            where: { id },
            data: {
                status,
                resolution_notes: notes,
                resolved_at: new Date(),
                resolved_by: session.userId
            }
        })

        await logAction(
            session.userId,
            'RESOLVE_DISCREPANCY',
            'DISCREPANCY',
            id,
            { status: before.status },
            { status, notes }
        )

        revalidatePath('/dashboard/discrepancies')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error: any) {
        return { error: error.message || "Erreur lors de la résolution du litige" }
    }
}
