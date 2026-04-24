import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCustomer } from "@/lib/auth-helpers"

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const orderNumberOrId = params.orderNumber

    // Find the order by ID or order number
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderNumberOrId },
          { orderNumber: orderNumberOrId.toUpperCase() }
        ]
      },
      include: {
        items: {
          include: {
            service: true
          }
        },
        customer: true,
        branch: true,
        payments: true,
        deliveryTask: {
          include: {
            assigned_user: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Verify it belongs to the customer (if logged in)
    try {
      const customer = await requireCustomer()
      if (order.customerId !== customer.id) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        )
      }
    } catch {
      // If auth fails, still return the order (public lookup by order number)
    }

    // Reformat for legacy compatibility
    const populatedOrder = {
      ...order,
      order_items: order.items.map(item => ({
        ...item,
        services: item.service
      })),
      customers: order.customer,
      branches: order.branch,
      deliveryTasks: order.deliveryTask ? [order.deliveryTask] : []
    }

    return NextResponse.json({ order: populatedOrder })
  } catch (error: any) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    )
  }
}

