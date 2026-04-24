import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, password, gender } = body

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: 'Name, phone, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
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
        { error: 'User with this phone already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and customer record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          phone: normalizedPhone,
          password: hashedPassword,
          fullName: name,
          role: 'customer',
          isActive: true,
        }
      })

      await tx.customer.create({
        data: {
          name,
          phone: normalizedPhone,
          gender: gender || undefined,
          type: 'regular',
          loyaltyPoints: 0,
          discountPercentage: 0,
        }
      })

      return newUser
    })

    return NextResponse.json(
      { message: 'User created successfully', userId: result.id },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)

    return NextResponse.json(
      { error: error.message || 'An error occurred during registration. Please try again.' },
      { status: 500 }
    )
  }
}

