import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    await requireAdmin()
  } catch (error: any) {
    console.error("Auth error in GET /api/admin/customers:", error)
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const recent = searchParams.get('recent') === 'true'

    let where: any = {}

    // If recent is true, get customers from last 24 hours
    if (recent) {
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      where.createdAt = { gte: oneDayAgo }
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        _count: {
          select: { orders: true }
        }
      }
    })

    const enhancedCustomers = customers.map(c => ({
      ...c,
      loyaltyPoints: c._count.orders
    }))

    return NextResponse.json({ customers: enhancedCustomers })
  } catch (error: any) {
    console.error("Error in GET /api/admin/customers:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch customers" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (error: any) {
    console.error("Auth error in POST /api/admin/customers:", error)
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { name, phone, address, gender, type, discountPercentage, loyaltyPoints } = body

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    if (phone) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { phone }
      })

      if (existingCustomer) {
        return NextResponse.json(
          { error: "Customer with this phone number already exists" },
          { status: 400 }
        )
      }
    }

    const customer = await prisma.customer.create({
      data: {
        name: name,
        phone: phone || null,
        address: address || null,
        gender: gender || null,
        type: type || "regular",
        loyaltyPoints: loyaltyPoints || 0,
        discountPercentage: discountPercentage || 0,
      }
    })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/admin/customers:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create customer" },
      { status: 500 }
    )
  }
}

