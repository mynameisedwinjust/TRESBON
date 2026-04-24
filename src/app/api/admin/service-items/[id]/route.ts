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
        const itemId = params.id

        const updateData: any = {}
        if (body.name !== undefined) updateData.name = body.name
        if (body.price !== undefined) updateData.price = Number(body.price)
        if (body.description !== undefined) updateData.description = body.description
        if (body.isActive !== undefined) updateData.isActive = body.isActive

        const item = await prisma.serviceItem.update({
            where: { id: itemId },
            data: updateData,
        })

        return NextResponse.json({ item })
    } catch (error: any) {
        console.error("Error updating service item:", error)
        const status = error.message.includes('Admin access') ? 403 : 500
        return NextResponse.json(
            { error: error.message || "Failed to update item" },
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
        const itemId = params.id

        await prisma.serviceItem.delete({
            where: { id: itemId },
        })

        return NextResponse.json({ success: true, message: "Item deleted successfully" })
    } catch (error: any) {
        console.error("Error deleting service item:", error)
        const status = error.message.includes('Admin access') ? 403 : 500
        return NextResponse.json(
            { error: error.message || "Failed to delete item" },
            { status }
        )
    }
}
