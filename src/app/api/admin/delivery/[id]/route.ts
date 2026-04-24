import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const body = await request.json()
    const taskId = params.id

    const updateData: any = { ...body }

    if (body.status === "completed") {
      updateData.completedAt = new Date()
    }

    await prisma.deliveryTask.update({
      where: { id: taskId },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating delivery task:", error)
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to update task" },
      { status }
    )
  }
}


