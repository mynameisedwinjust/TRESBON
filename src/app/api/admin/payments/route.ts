import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        await requireAdmin()

        const { searchParams } = new URL(request.url)
        const startDateParam = searchParams.get('startDate')
        const endDateParam = searchParams.get('endDate')

        let where: any = {}

        if (startDateParam || endDateParam) {
            where.createdAt = {}
            if (startDateParam) {
                where.createdAt.gte = new Date(startDateParam)
            }
            if (endDateParam) {
                const end = new Date(endDateParam)
                end.setHours(23, 59, 59, 999)
                where.createdAt.lte = end
            }
        }

        const payments = await prisma.payment.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                order: {
                    select: {
                        orderNumber: true,
                        totalAmount: true,
                        paidAmount: true,
                        customer: {
                            select: {
                                name: true,
                                phone: true
                            }
                        }
                    }
                }
            }
        })

        // Format for frontend compatibility
        const formattedPayments = payments.map(p => ({
            id: p.id,
            order_id: p.orderId,
            amount: p.amount,
            method: p.method,
            status: p.status,
            transaction_id: p.transactionId,
            notes: p.notes,
            created_at: p.createdAt,
            order: {
                order_number: p.order.orderNumber,
                total_amount: p.order.totalAmount,
                paid_amount: p.order.paidAmount,
                customer: p.order.customer ? {
                    name: p.order.customer.name,
                    phone: p.order.customer.phone
                } : null
            }
        }))

        return NextResponse.json({ payments: formattedPayments })
    } catch (error: any) {
        console.error("[API] Error fetching payments:", error)
        const status = error.message.includes('Admin access') ? 403 : 500
        return NextResponse.json(
            { error: error.message || "Failed to fetch payments" },
            { status }
        )
    }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()

    const { amount, method, transaction_id, notes, order_id } = body

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Valid payment amount is required" },
        { status: 400 }
      )
    }

    if (!order_id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: order_id }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    const paymentAmount = Number(amount)
    const paymentStatus = method === 'cash' ? 'completed' : 'pending'

    // Create payment and update order in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          amount: paymentAmount,
          method: method,
          status: paymentStatus,
          transactionId: transaction_id || null,
          notes: notes || null,
          orderId: order.id
        }
      })

      // We only update the paid amount if it's cash or completed directly
      if (paymentStatus === 'completed') {
        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            paidAmount: {
              increment: paymentAmount
            }
          }
        })

        let newStatus;
        if (updatedOrder.paidAmount >= updatedOrder.totalAmount && updatedOrder.clothesTaken) {
          newStatus = 'completed';
        } else if (updatedOrder.status === 'completed') {
          // If it was completed but newly added/adjusted payment makes it not full, drop back to pending
          newStatus = 'received'; 
        } else if (updatedOrder.paidAmount > 0 && updatedOrder.paidAmount < updatedOrder.totalAmount) {
          // It's a partial payment
          if (updatedOrder.status !== 'ready' && updatedOrder.status !== 'delivered') {
            newStatus = 'partially_paid';
          }
        }

        if (newStatus && newStatus !== updatedOrder.status) {
          await tx.order.update({
            where: { id: order.id },
            data: { status: newStatus }
          })
        }
      }
    })

    return NextResponse.json({ success: true, message: "Payment recorded successfully" })
  } catch (error: any) {
    console.error("Error creating payment:", error)
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to create payment" },
      { status }
    )
  }
}

