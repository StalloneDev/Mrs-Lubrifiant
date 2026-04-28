import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { logAction } from "@/lib/audit"

export async function POST(req: Request) {
    try {
        const { partner_id } = await req.json()
        const session = await getSession()

        if (!partner_id) {
            return NextResponse.json({ error: "Partner ID manquant" }, { status: 400 })
        }

        const result = await prisma.sale.updateMany({
            where: {
                partner_id,
                is_commission_validated: false,
                is_commission_paid: false,
                status: 'VALIDATED' // Sale must be confirmed by commercial
            },
            data: {
                is_commission_validated: true
            }
        })

        await logAction(
            session?.userId || 'SYSTEM',
            'VALIDATE_COMMISSIONS',
            'PARTNER',
            partner_id,
            { count: result.count },
            { partner_id }
        )

        return NextResponse.json({ success: true, count: result.count })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
