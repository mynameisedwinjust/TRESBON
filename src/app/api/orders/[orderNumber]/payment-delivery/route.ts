import { NextResponse } from "next/server"
import { requireCustomer } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const customer = await requireCustomer()
    const body = await request.json()
    const orderNumberOrId = params.orderNumber

    const {
      payment_method, // 'cash' | 'mobile_money'
      delivery_method, // 'pickup' | 'delivery'
      delivery_address,
      delivery_phone,
      mobile_money_number, // For mobile money payments
      transaction_id, // For digital payments
    } = body

    // Find order by orderNumber or ID
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderNumberOrId },
          { orderNumber: orderNumberOrId.toUpperCase() }
        ]
      },
      include: {
        payments: true,
        deliveryTask: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Verify order belongs to customer
    if (order.customerId !== customer.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Only allow updates for accepted orders
    if (order.status !== 'accepted') {
      return NextResponse.json(
        { error: "Order must be accepted before selecting payment and delivery options" },
        { status: 400 }
      )
    }

    // Create or update payment record
    if (payment_method) {
      const existingPayment = order.payments.find(p => p.status === 'pending')

      if (existingPayment) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            method: payment_method,
            transactionId: transaction_id || existingPayment.transactionId,
            notes: mobile_money_number ? `Mobile Money: ${mobile_money_number}` : existingPayment.notes,
          }
        })
      } else {
        await prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.totalAmount - order.paidAmount,
            method: payment_method,
            status: 'pending',
            transactionId: transaction_id,
            notes: mobile_money_number ? `Mobile Money: ${mobile_money_number}` : undefined,
          }
        })
      }
    }

    // Create or update delivery task
    if (delivery_method) {
      if (order.deliveryTask) {
        await prisma.deliveryTask.update({
          where: { id: order.deliveryTask.id },
          data: {
            type: delivery_method,
            address: delivery_address || order.deliveryTask.address,
            phone: delivery_phone || order.deliveryTask.phone,
          }
        })
      } else {
        if (delivery_method === 'delivery' && !delivery_address) {
          return NextResponse.json(
            { error: "Delivery address is required for delivery" },
            { status: 400 }
          )
        }

        await prisma.deliveryTask.create({
          data: {
            orderId: order.id,
            type: delivery_method,
            address: delivery_address || '',
            phone: delivery_phone || customer.phone || undefined,
            status: 'pending',
          }
        })
      }
    }

    // Auto-advance order to "in_process" if payment and delivery are both selected
    if (payment_method && delivery_method && order.status === 'accepted') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'in_process',
          updatedAt: new Date()
        }
      })
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        payments: true,
        deliveryTask: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Payment and delivery preferences updated",
      order: updatedOrder
    })
  } catch (error: any) {
    console.error("Error updating payment/delivery:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update payment and delivery preferences" },
      { status: 500 }
    )
  }
}

