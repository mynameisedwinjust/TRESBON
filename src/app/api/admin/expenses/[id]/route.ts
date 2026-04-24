import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin()
        const { id } = params

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        await prisma.expense.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Expense deleted successfully" })
    } catch (error: any) {
        console.error("Error deleting expense:", error)
        return NextResponse.json(
            { error: error.message || "Failed to delete expense" },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin()
        const { id } = params
        const body = await request.json()

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        const updated = await prisma.expense.update({
            where: { id },
            data: {
                description: body.description,
                amount: body.amount ? parseFloat(body.amount) : undefined,
                category: body.category,
                date: body.date ? new Date(body.date) : undefined,
                notes: body.notes
            }
        })

        return NextResponse.json({ expense: updated })
    } catch (error: any) {
        console.error("Error updating expense:", error)
        return NextResponse.json(
            { error: error.message || "Failed to update expense" },
            { status: 500 }
        )
    }
}
