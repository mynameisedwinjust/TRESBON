import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()

    // Placeholder - System settings will be migrated to a new Prisma model soon
    return NextResponse.json({
      systemConfig: {
        companyName: "TrèsBon Dry Cleaners",
        minOrderAmount: 3000,
        currency: "RWF",
        contactEmail: "info@tresbon.com",
        contactPhone: "+250 788 000 000"
      },
      notificationTemplates: {
        "ORDER_RECEIVED": "Your order {orderNumber} has been received.",
        "ORDER_READY": "Your order {orderNumber} is ready for pickup/delivery.",
        "ORDER_DELIVERED": "Your order {orderNumber} has been delivered. Thank you!"
      }
    })
  } catch (error: any) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: error.message.includes("Admin access") ? 403 : 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    // In the future, this will save to a Settings table in Prisma
    return NextResponse.json({
      success: true,
      message: "Settings updated (Note: Backend storage pending migration)"
    })
  } catch (error: any) {
    console.error("Error saving settings:", error)
    return NextResponse.json(
      { error: error.message || "Failed to save settings" },
      { status: error.message.includes("Admin access") ? 403 : 500 }
    )
  }
}

