import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const paymentId = params.id

    // Find payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.status === "completed") {
      return NextResponse.json({ error: "Payment already verified" }, { status: 400 })
    }

    // Update payment status to completed
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "completed" }
    })

    // Update order paid amount
    const order = await prisma.order.findUnique({
      where: { id: payment.orderId }
    })

    if (order) {
      const newPaidAmount = (order.paidAmount || 0) + payment.amount
      
      const updateData: any = {
        paidAmount: newPaidAmount,
        updatedAt: new Date()
      }
      
      if (newPaidAmount >= order.totalAmount && order.clothesTaken) {
        updateData.status = "completed"
      } else if (order.status === 'completed') {
        updateData.status = "received"
      } else if (newPaidAmount > 0 && newPaidAmount < order.totalAmount) {
        if (order.status !== 'ready' && order.status !== 'delivered') {
          updateData.status = "partially_paid"
        }
      }

      await prisma.order.update({
        where: { id: order.id },
        data: updateData
      })
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully"
    })
  } catch (error: any) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: error.message.includes("Admin access") ? 403 : 500 }
    )
  }
}

