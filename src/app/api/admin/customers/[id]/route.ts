import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    const enhancedCustomer = {
      ...customer,
      loyaltyPoints: customer._count.orders
    }

    return NextResponse.json({ customer: enhancedCustomer })
  } catch (error: any) {
    console.error("Error fetching customer:", error)
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to fetch customer" },
      { status }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const body = await request.json()

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: body.name,
        phone: body.phone,
        address: body.address,
        gender: body.gender,
        type: body.type,
        discountPercentage: body.discountPercentage,
      }
    })

    return NextResponse.json({ customer })
  } catch (error: any) {
    console.error("Error updating customer:", error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to update customer" },
      { status }
    )
  }
}


