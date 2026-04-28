import prisma from './prisma'

export async function logAction(
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string,
  before?: any,
  after?: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        before_value: before,
        after_value: after,
      }
    })
  } catch (error) {
    console.error('Failed to log audit action:', error)
  }
}
