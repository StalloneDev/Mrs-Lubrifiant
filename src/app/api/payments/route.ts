import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    const payment = await prisma.payment.create({
      data: {
        partner_id: data.partner_id,
        amount: parseFloat(data.amount),
        channel: data.channel,
        external_reference: data.external_reference,
        proof_url: data.proof_url,
        reconciled_at: null
      }
    })

    return NextResponse.json(payment)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
