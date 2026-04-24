import { NextResponse } from "next/server"
import { requireCustomer } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const customer = await requireCustomer()
    const body = await request.json()

    const {
      branch_id,
      delivery_fee = 0,
      discount_amount = 0,
      notes,
      items,
    } = body

    // Calculate total
    const subtotal = items.reduce((sum: number, item: any) => sum + item.total_price, 0)
    const total_amount = subtotal + Number(delivery_fee) - Number(discount_amount)

    // Generate sequential order number
    const totalOrdersCount = await prisma.order.count()
    const nextOrderNumber = (totalOrdersCount + 1).toString().padStart(3, '0')

    // Create order and items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: nextOrderNumber,
          customerId: customer.id,
          branchId: branch_id || null,
          status: "received",
          totalAmount: total_amount,
          paidAmount: 0,
          deliveryFee: Number(delivery_fee),
          discountAmount: Number(discount_amount),
          notes,
          receivedAt: new Date(),
          items: {
            create: items.map((item: any) => ({
              serviceId: item.service_id || null,
              itemName: item.item_name,
              quantity: item.quantity,
              unitPrice: item.unit_price,
              totalPrice: item.total_price,
            }))
          }
        },
        include: {
          items: {
            include: {
              service: true
            }
          }
        }
      })
      return newOrder
    })

    // Format for backward compatibility
    const populatedOrder = {
      ...order,
      order_items: order.items.map(item => ({
        ...item,
        services: item.service
      }))
    }

    return NextResponse.json({ order: populatedOrder }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating order:", error)
    const status = error.message.includes('Customer not found') || error.message.includes('Unauthorized') ? 401 : 500
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status }
    )
  }
}

export async function GET(request: Request) {
  try {
    const customer = await requireCustomer()

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            service: true
          }
        },
        branch: true,
        payments: true,
        deliveryTask: true,
      }
    })

    // Format for backward compatibility
    const formattedOrders = orders.map(order => ({
      ...order,
      order_items: order.items.map(item => ({
        ...item,
        services: item.service
      })),
      branches: order.branch,
      deliveryTasks: order.deliveryTask ? [order.deliveryTask] : []
    }))

    return NextResponse.json({ orders: formattedOrders }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching orders:", error)
    const status = error.message.includes('Customer not found') || error.message.includes('Unauthorized') ? 401 : 500
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status }
    )
  }
}

