import { NextResponse } from "next/server"
import { requireCustomer } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const customer = await requireCustomer()
    const body = await request.json()

    const {
      order_id,
      type,
      address,
      phone,
      scheduled_at,
      notes,
    } = body

    // Verify order belongs to customer
    const order = await prisma.order.findFirst({
      where: {
        id: order_id,
        customerId: customer.id
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Create delivery task
    const delivery = await prisma.deliveryTask.create({
      data: {
        orderId: order_id,
        type,
        address,
        phone,
        scheduledAt: scheduled_at ? new Date(scheduled_at) : undefined,
        status: "pending",
        notes,
      }
    })

    return NextResponse.json({ delivery }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating delivery task:", error)
    return NextResponse.json(
      { error: error.message || "Failed to schedule delivery" },
      { status: error.message === "Unauthorized" || error.message === "Customer not found" ? 401 : 500 }
    )
  }
}

export async function GET() {
  try {
    const customer = await requireCustomer()

    const deliveries = await prisma.deliveryTask.findMany({
      where: {
        order: {
          customerId: customer.id
        }
      },
      orderBy: { scheduledAt: 'desc' },
      include: {
        order: true,
        assigned_user: true
      }
    })

    // Build legacy response format (some frontend components might expect property names from MongoDB version)
    const deliveriesWithData = deliveries.map(delivery => ({
      ...delivery,
      orders: delivery.order,
      users: delivery.assigned_user
    }))

    return NextResponse.json({ deliveries: deliveriesWithData }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching deliveries:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch deliveries" },
      { status: error.message === "Unauthorized" || error.message === "Customer not found" ? 401 : 500 }
    )
  }
}

