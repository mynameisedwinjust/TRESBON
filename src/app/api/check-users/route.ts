import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const users = await prisma.user.findMany({ select: { phone: true, role: true, isActive: true, password: true } })
    const isValid = await bcrypt.compare('Umutesi', users.find(u => u.phone === '0790023659')?.password || '')
    return NextResponse.json({ users, isValid })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
