import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { logAction } from "@/lib/audit"

export async function POST(req: Request) {
    try {
        const { partner_id } = await req.json()
        const session = await getSession()

        if (!partner_id) {
            return NextResponse.json({ error: "Partner ID requis" }, { status: 400 })
        }

        const updated = await prisma.sale.updateMany({
            where: {
                partner_id: partner_id,
                is_commission_validated: true,
                is_commission_paid: false,
                status: 'VALIDATED'
            },
            data: {
                is_commission_paid: true
            }
        })

        await logAction(
            session?.userId || 'SYSTEM',
            'SETTLE_PARTNER_COMMISSIONS',
            'PARTNER',
            partner_id,
            { is_commission_paid: false },
            { is_commission_paid: true, count: updated.count }
        )

        return NextResponse.json({ success: true, count: updated.count })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
