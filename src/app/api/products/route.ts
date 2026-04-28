import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const product = await prisma.product.create({
      data: {
        code: data.code,
        name: data.name,
        category: data.category,
        viscosity_grade: data.viscosity_grade,
        container_size: data.container_size,
        container_unit: data.container_unit,
        purchase_price: data.purchase_price,
        selling_price_suggested: data.selling_price_suggested,
        photo_url: data.photo_url || null,
      }
    })
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json()
    const { id, ...updateData } = data

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    })
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
