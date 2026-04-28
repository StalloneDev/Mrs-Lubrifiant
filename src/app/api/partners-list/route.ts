import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        const partners = await prisma.partner.findMany({ where: { status: 'ACTIVE' } })
        return NextResponse.json(partners)
    } catch (error) {
        return NextResponse.json([], { status: 500 })
    }
}
