import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    const users = await prisma.user.findMany({
      where: role ? { role } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true
      }
    })

    const usersWithStats = await Promise.all(users.map(async (u) => {
      // We add u.id to searchTerms as a fallback since Prisma client is currently out of sync
      // and doesn't recognize recordedById yet.
      const searchTerms = [u.id, u.phone]
      if (u.fullName) searchTerms.push(u.fullName)
      
      // Get order stats for this user
      const stats = await prisma.order.aggregate({
        where: {
          OR: [
            { recordedById: u.id },
            { recordedBy: { in: searchTerms } }
          ]
        },
        _count: true,
        _sum: {
          totalAmount: true
        }
      })

      return {
        ...u,
        ordersCount: stats._count || 0,
        revenueGenerated: stats._sum.totalAmount || 0
      }
    }))

    return NextResponse.json({ users: usersWithStats })
  } catch (error: any) {
    console.error("Error in GET /api/admin/users:", error)
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to load users" },
      { status }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { phone, password, role, fullName } = body

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone number and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Prevent creating admin role via API
    const validRoles = ['delivery', 'customer', 'cashier', 'cleaner', 'supervisor']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role." },
        { status: 400 }
      )
    }

    const normalizedPhone = phone.trim()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this phone number already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        phone: normalizedPhone,
        password: hashedPassword,
        fullName: fullName || null,
        role: role || 'customer',
        isActive: true,
      }
    })

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/admin/users:", error)
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role === 'admin') {
      return NextResponse.json({ error: "Admin user cannot be deleted." }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/users:", error)
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { id, password, isActive, fullName, role } = body

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updateData: any = {}
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long" },
          { status: 400 }
        )
      }
      updateData.password = await bcrypt.hash(password, 10)
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }
    
    if (fullName !== undefined) {
      updateData.fullName = fullName
    }
    
    if (role !== undefined) {
      const validRoles = ['admin', 'delivery', 'customer', 'cashier', 'cleaner', 'supervisor']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
      }
      updateData.role = role
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      }
    })
  } catch (error: any) {
    console.error("Error in PATCH /api/admin/users:", error)
    const status = error.message.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status }
    )
  }
}


