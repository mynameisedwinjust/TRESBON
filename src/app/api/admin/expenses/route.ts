import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        await requireAdmin()
        const { searchParams } = new URL(request.url)
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' },
            take: limit
        })

        return NextResponse.json({ expenses })
    } catch (error: any) {
        console.error("Error fetching expenses:", error)
        return NextResponse.json(
            { error: error.message || "Failed to fetch expenses" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireAdmin()
        const body = await request.json()
        const { description, amount, category, date, notes } = body

        if (!description || !amount) {
            return NextResponse.json(
                { error: "Description and amount are required" },
                { status: 400 }
            )
        }

        const expense = await prisma.expense.create({
            data: {
                description,
                amount: parseFloat(amount),
                category: category || "Other",
                date: date ? new Date(date) : new Date(),
                notes: notes || null,
                recordedBy: (user as any).fullName || (user as any).phone || (user as any).name
            }
        })

        return NextResponse.json({ expense }, { status: 201 })
    } catch (error: any) {
        console.error("Error creating expense:", error)
        return NextResponse.json(
            { error: error.message || "Failed to create expense" },
            { status: 500 }
        )
    }
}
