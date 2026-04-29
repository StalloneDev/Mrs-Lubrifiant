import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET() {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

        const commercials = await prisma.user.findMany({
            where: { role: 'COMMERCIAL', is_active: true },
            select: { id: true, full_name: true }
        })

        return NextResponse.json(commercials)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
