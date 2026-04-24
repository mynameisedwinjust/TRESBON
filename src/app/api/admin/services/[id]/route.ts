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
    const serviceId = params.id

    const updateData: any = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.type !== undefined) updateData.type = body.type
    if (body.basePrice !== undefined || body.base_price !== undefined) {
      updateData.basePrice = Number(body.basePrice !== undefined ? body.basePrice : body.base_price)
    }
    if (body.description !== undefined) updateData.description = body.description
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
    })

    return NextResponse.json({ service })
  } catch (error: any) {
    console.error("Error updating service:", error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to update service" },
      { status }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const serviceId = params.id

    // This will also delete related ServiceItems due to Cascade relation
    await prisma.service.delete({
      where: { id: serviceId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting service:", error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to delete service" },
      { status }
    )
  }
}
