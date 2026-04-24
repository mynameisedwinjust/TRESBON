import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()

    const tasks = await prisma.deliveryTask.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            customer: true
          }
        },
        assigned_user: true,
      }
    })

    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error("Error fetching delivery tasks:", error)
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to fetch delivery tasks" },
      { status }
    )
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()

    const task = await prisma.deliveryTask.create({
      data: {
        orderId: body.order_id,
        type: body.type,
        address: body.address,
        phone: body.phone || null,
        scheduledAt: body.scheduled_at ? new Date(body.scheduled_at) : null,
        assignedTo: body.assigned_to || null,
        status: body.status || "pending",
        notes: body.notes || null,
      }
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating delivery task:", error)
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to create delivery task" },
      { status }
    )
  }
}


