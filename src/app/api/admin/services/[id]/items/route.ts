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
        const body = await request.json()
        const serviceId = params.id

        if (!body.name || !body.price) {
            return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
        }

        const item = await prisma.serviceItem.create({
            data: {
                name: body.name,
                price: Number(body.price),
                description: body.description || null,
                serviceId: serviceId,
                isActive: body.isActive !== false,
            },
        })

        return NextResponse.json({ item })
    } catch (error: any) {
        console.error("Error creating service item:", error)
        const status = error.message.includes('Admin access') ? 403 : 500
        return NextResponse.json(
            { error: error.message || "Failed to create item" },
            { status }
        )
    }
}
