import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()

    const { name, type, base_price, basePrice, description } = body

    if (!name || !type || (base_price === undefined && basePrice === undefined)) {
      return NextResponse.json(
        { error: "Name, type, and base price are required" },
        { status: 400 }
      )
    }

    const price = basePrice !== undefined ? basePrice : (base_price !== undefined ? base_price : 0)

    const service = await prisma.service.create({
      data: {
        name,
        type,
        basePrice: Number(price),
        description: description || null,
        isActive: true,
      }
    })

    return NextResponse.json(
      { service },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating service:", error)
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to create service" },
      { status }
    )
  }
}


