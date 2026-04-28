import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const hashedPassword = await bcrypt.hash(data.password, 10)
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        phone: data.phone,
        password_hash: hashedPassword,
      }
    })

    const { password_hash, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
