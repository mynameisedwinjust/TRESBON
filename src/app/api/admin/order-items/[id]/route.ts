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
    const itemId = params.id
    const body = await request.json()

    if (body.notes === undefined) {
      return NextResponse.json({ error: "Missing notes field" }, { status: 400 })
    }

    // Update the item notes
    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: { notes: body.notes }
    })

    return NextResponse.json({ success: true, item: updatedItem })
  } catch (error: any) {
    console.error("Error updating order item:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update item" },
      { status: error.message.includes("Admin access") ? 403 : 500 }
    )
  }
}
