import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    // Generate sequential next order number based on highest existing
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true }
    })
    
    let nextOrderNumber = "001"
    if (lastOrder && lastOrder.orderNumber) {
      const lastNumber = parseInt(lastOrder.orderNumber, 10)
      if (!isNaN(lastNumber)) {
        nextOrderNumber = (lastNumber + 1).toString().padStart(3, '0')
      } else {
        const count = await prisma.order.count()
        nextOrderNumber = (count + 1).toString().padStart(3, '0')
      }
    }

    return NextResponse.json({ nextOrderNumber })
  } catch (error: any) {
    console.error("Error fetching next order number:", error)
    return NextResponse.json(
      { error: "Failed to generate order number" },
      { status: 500 }
    )
  }
}
