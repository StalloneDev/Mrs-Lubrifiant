import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const adminEmail = 'admin@mrs.bj'
    const hashedPassword = await bcrypt.hash('MRS_Admin2024!', 10)

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        full_name: 'Administrateur MRS',
        password_hash: hashedPassword,
        role: 'ADMIN',
        phone: '+22900000000',
      },
    })

    return NextResponse.json({ message: 'Admin created', email: admin.email })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
