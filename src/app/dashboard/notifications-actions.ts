'use server'

import prisma from '@/lib/prisma'

export interface Notification {
    id: string
    type: 'STOCK' | 'DELIVERY' | 'FINANCE' | 'DISCREPANCY'
    title: string
    message: string
    href: string
    createdAt: Date
}

export async function getNotifications(role: string, userId: string): Promise<Notification[]> {
    const notifications: Notification[] = []

    // 1. Stock Alerts (Admin/Manager/Commercial)
    if (role === 'ADMIN' || role === 'MANAGER' || role === 'COMMERCIAL') {
        const lowStock = await prisma.stockLevel.findMany({
            where: {
                warehouse: { type: 'CENTRAL' },
                quantity: { lte: 10 } // Simplified threshold, can be product.reorder_point
            },
            include: { product: true },
            take: 5
        })

        lowStock.forEach(s => {
            notifications.push({
                id: `stock-${s.product_id}`,
                type: 'STOCK',
                title: 'Stock Bas',
                message: `Le produit ${s.product.name} est épuisé ou presque (${s.quantity} restants).`,
                href: '/dashboard/stocks',
                createdAt: new Date()
            })
        })
    }

    // 2. Logistics Alerts (Unconfirmed Deliveries)
    if (role === 'ADMIN' || role === 'MANAGER' || role === 'COMMERCIAL') {
        const unconfirmed = await prisma.delivery.findMany({
            where: { status: 'DELIVERED' },
            include: { partner: true },
            take: 5
        })

        unconfirmed.forEach(d => {
            notifications.push({
                id: `delivery-${d.id}`,
                type: 'DELIVERY',
                title: 'Livraison à Confirmer',
                message: `La livraison BL-${d.delivery_number} pour ${d.partner.business_name} attend votre confirmation.`,
                href: '/dashboard/deliveries',
                createdAt: d.updated_at
            })
        })
    }

    // 3. Finance Alerts (Aging Receivables)
    if (role === 'ADMIN' || role === 'MANAGER') {
        const overdue = await prisma.sale.findMany({
            where: {
                status: { in: ['VALIDATED', 'INVOICED', 'PARTIALLY_PAID'] },
                sale_date: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            },
            include: { partner: true },
            take: 5
        })

        overdue.forEach(o => {
            notifications.push({
                id: `overdue-${o.id}`,
                type: 'FINANCE',
                title: 'Créance Douteuse',
                message: `La facture FAC-${o.sale_number} de ${o.partner?.business_name || 'Partenaire'} dépasse les 30 jours.`,
                href: '/dashboard/sales',
                createdAt: o.sale_date
            })
        })
    }

    // Sort by date desc
    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}
