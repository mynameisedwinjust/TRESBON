import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  const timestamp = new Date().toLocaleTimeString()
  console.log(`[${timestamp}] GET /api/services CALLED`)
  try {
    const services = await prisma.service.findMany({
      include: { items: true },
      orderBy: { name: 'asc' }
    })

    console.log(`FETCHED ${services?.length || 0} SERVICES`)

    return NextResponse.json({ services })
  } catch (error: any) {
    console.error("SERVICE API ERROR:", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    )
  }
}

