import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (user && user.id) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          isOnline: false,
          lastActive: new Date()
        }
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout action error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
