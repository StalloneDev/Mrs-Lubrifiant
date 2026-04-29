import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { logAction } from "@/lib/audit"

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

    // Create Partner and its virtual warehouse in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const partner = await tx.partner.create({
        data: {
          code: data.code,
          business_name: data.business_name,
          manager_name: data.manager_name,
          phone: data.phone,
          partner_type: data.partner_type,
          address_description: data.address_description,
          zone: data.zone,
          commission_rate: data.commission_rate || 0,
          mobile_money_number: data.mobile_money_number,
          mobile_money_operator: data.mobile_money_operator,
          photo_manager_url: data.photo_manager_url,
          photo_storefront_url: data.photo_storefront_url,
          stock_ceiling_amount: data.stock_ceiling_amount,
          assigned_commercial_user_id: session.role === 'COMMERCIAL' ? (session as any).userId : undefined,
          status: 'ACTIVE'
        }
      })

      // Create dummy warehouse for consignment stock tracking
      await tx.warehouse.create({
        data: {
          code: `WH-${partner.code}`,
          name: `Stock Consignation - ${partner.business_name}`,
          type: 'VIRTUAL_PARTNER',
          partner_id: partner.id
        }
      })

      await logAction(
        session.userId,
        'CREATE_PARTNER_API',
        'PARTNER',
        partner.id,
        null,
        { business_name: partner.business_name, code: partner.code }
      )

      return partner
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json()
    const { id, ...updateData } = data

    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

    const oldPartner = await prisma.partner.findUnique({ where: { id } })
    if (!oldPartner) return NextResponse.json({ error: "Partenaire non trouvé" }, { status: 404 })

    const partner = await prisma.partner.update({
      where: { id },
      data: {
        code: updateData.code,
        business_name: updateData.business_name,
        manager_name: updateData.manager_name,
        phone: updateData.phone,
        partner_type: updateData.partner_type,
        address_description: updateData.address_description,
        zone: updateData.zone,
        commission_rate: updateData.commission_rate,
        mobile_money_number: updateData.mobile_money_number,
        mobile_money_operator: updateData.mobile_money_operator,
        photo_manager_url: updateData.photo_manager_url,
        photo_storefront_url: updateData.photo_storefront_url,
        stock_ceiling_amount: updateData.stock_ceiling_amount,
        assigned_commercial_user_id: updateData.assigned_commercial_user_id,
      }
    })

    await logAction(
      session.userId,
      'UPDATE_PARTNER',
      'PARTNER',
      partner.id,
      oldPartner,
      updateData
    )

    return NextResponse.json(partner)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
