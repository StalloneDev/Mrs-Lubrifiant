import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // We assume the first commercial for now if not authenticated
    const commercial = await prisma.user.findFirst({ where: { role: 'COMMERCIAL' } })

    const visit = await prisma.visit.create({
      data: {
        partner_id: data.partnerId,
        commercial_user_id: commercial?.id || "",
        notes: data.notes,
        visited_at: new Date(data.visitedAt)
      }
    })

    return NextResponse.json(visit)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
