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

    // Find order by ID or order number
    let order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: params.id },
          { orderNumber: params.id.toUpperCase() }
        ]
      },
      include: {
        items: {
          include: {
            service: true
          }
        },
        customer: true,
        payments: true,
        deliveryTask: true,
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Format for backward compatibility
    const populatedOrder = {
      ...order,
      order_items: order.items.map(item => ({
        ...item,
        services: item.service
      })),
      customers: order.customer,
      deliveryTasks: order.deliveryTask ? [order.deliveryTask] : []
    }

    return NextResponse.json({ order: populatedOrder })
  } catch (error: any) {
    console.error("Error fetching order:", error)
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
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

    const updateData: any = {}

    // Update status
    if (body.status) {
      updateData.status = body.status

      // Set timestamp based on status
      if (body.status === "ready") {
        updateData.readyAt = new Date()
      } else if (body.status === "delivered") {
        updateData.deliveredAt = new Date()
      }
    }

    // Update other fields
    if (body.totalAmount !== undefined) updateData.totalAmount = Number(body.totalAmount)
    if (body.paidAmount !== undefined) updateData.paidAmount = Number(body.paidAmount)
    if (body.deliveryFee !== undefined) updateData.deliveryFee = Number(body.deliveryFee)
    if (body.discountAmount !== undefined) updateData.discountAmount = Number(body.discountAmount)
    if (body.notes !== undefined) updateData.notes = body.notes

    // Get current order state to determine automatic status
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { id: params.id },
          { orderNumber: params.id.toUpperCase() }
        ]
      }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    if (body.clothesTaken !== undefined) {
      updateData.clothesTaken = Boolean(body.clothesTaken)
    }

    // Determine values for status automation
    const finalClothesTaken = body.clothesTaken !== undefined ? Boolean(body.clothesTaken) : existingOrder.clothesTaken
    const finalPaidAmount = body.paidAmount !== undefined ? Number(body.paidAmount) : existingOrder.paidAmount
    const finalTotalAmount = body.totalAmount !== undefined ? Number(body.totalAmount) : existingOrder.totalAmount
    
    // Only auto-update status if it wasn't manually forced in this request
    if (!body.status) {
      if (finalClothesTaken && finalPaidAmount >= finalTotalAmount) {
        updateData.status = 'completed';
      } else if (existingOrder.status === 'completed') {
        // It was completed but they removed clothesTaken or changed amount
        updateData.status = 'received';
      } else if (finalPaidAmount > 0 && finalPaidAmount < finalTotalAmount) {
        if (existingOrder.status !== 'ready' && existingOrder.status !== 'delivered') {
          updateData.status = 'partially_paid';
        }
      }
    }

    const order = await prisma.order.updateMany({
      where: {
        OR: [
          { id: params.id },
          { orderNumber: params.id.toUpperCase() }
        ]
      },
      data: updateData
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating order:", error)
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    if (user.role !== 'admin' && user.role !== 'supervisor') {
      return NextResponse.json(
        { error: "Only a superior admin can delete orders." },
        { status: 403 }
      )
    }

    // Find the order first to get its actual ID
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: params.id },
          { orderNumber: params.id.toUpperCase() }
        ]
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Delete related items and payments to avoid foreign key constraints
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId: order.id } }),
      prisma.payment.deleteMany({ where: { orderId: order.id } }),
      // Also delete delivery task if any
      prisma.deliveryTask.deleteMany({ where: { orderId: order.id } }),
      prisma.order.delete({ where: { id: order.id } })
    ])

    return NextResponse.json({ success: true, message: "Order deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting order:", error)
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to delete order" },
      { status }
    )
  }
}


