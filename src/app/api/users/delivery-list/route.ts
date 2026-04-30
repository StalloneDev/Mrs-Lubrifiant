import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            where: { role: 'DELIVERY', is_active: true },
            select: { id: true, full_name: true },
            orderBy: { full_name: 'asc' }
        })
        return NextResponse.json(users)
    } catch {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
