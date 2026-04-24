import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()

    // Run all database queries in parallel
    const [
      totalCustomers,
      totalOrders,
      pendingOrders,
      activeDeliveries,
      revenueStats,
      recentCustomersCount,
      pendingPayments,
      activeStaff
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "received" } }),
      prisma.order.count({ where: { status: "ready" } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "completed" }
      }),
      (async () => {
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 1)
        return prisma.customer.count({
          where: { createdAt: { gte: oneDayAgo } }
        })
      })(),
      prisma.payment.count({ where: { status: "pending" } }),
      prisma.user.count({ 
        where: { 
          role: { in: ['admin', 'supervisor', 'cashier', 'delivery', 'cleaner'] },
          lastActive: { gte: new Date(Date.now() - 1000 * 60 * 5) }
        }
      })
    ])

    const totalRevenue = revenueStats._sum.amount || 0

    return NextResponse.json({
      totalCustomers,
      totalOrders,
      totalRevenue,
      pendingOrders,
      activeDeliveries,
      recentCustomers: recentCustomersCount,
      pendingPayments,
      activeStaff
    })

  } catch (error: any) {
    console.error("Error fetching stats:", error)
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status }
    )
  }
}


