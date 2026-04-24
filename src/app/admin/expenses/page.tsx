"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
    Plus,
    Trash2,
    Receipt,
    Search,
    ChevronRight
} from "lucide-react"

interface Expense {
    id: string
    description: string
    amount: number
    date: string
    recordedBy: string | null
    notes: string | null
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
    })
    const { toast } = useToast()

    useEffect(() => {
        loadExpenses()
    }, [])

    const loadExpenses = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/admin/expenses")
            if (!res.ok) throw new Error("Failed to load expenses")
            const data = await res.json()
            setExpenses(data.expenses || [])
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to load expenses",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.description || !formData.amount) return

        try {
            const response = await fetch("/api/admin/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!response.ok) throw new Error("Failed to add expense")

            toast({
                title: "Success",
                description: "Expense recorded successfully",
            })

            setShowAddModal(false)
            setFormData({
                description: "",
                amount: "",
                date: new Date().toISOString().split("T")[0],
                notes: "",
            })
            loadExpenses()
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to add expense",
            })
        }
    }

    const deleteExpense = async (id: string) => {
        if (!confirm("Are you sure you want to delete this expense?")) return

        try {
            const res = await fetch(`/api/admin/expenses/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete")

            toast({ title: "Deleted", description: "Expense removed" })
            loadExpenses()
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message })
        }
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span>Admin</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-laundry-primary font-medium">Expenses</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Financial Expenses</h1>
                    <p className="text-gray-500 font-medium">Manage and track your operational expenditures</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="bg-laundry-primary hover:bg-laundry-primary/90 text-white shadow-xl shadow-laundry-primary/20 h-12 px-6 rounded-xl transition-all hover:scale-105 active:scale-95">
                    <Plus className="h-5 w-5 mr-2" />
                    Record New Expense
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 border-0 bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden relative">
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="bg-red-50 p-4 rounded-2xl">
                            <Receipt className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1">Total Expenses</p>
                            <p className="text-3xl font-black text-gray-900">RWF {totalExpenses.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/30 rounded-full -mr-16 -mt-16 blur-3xl" />
                </Card>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Date</th>
                                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Description</th>
                                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Amount</th>
                                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Recorded By</th>
                                <th className="px-6 py-5 text-right font-bold text-gray-400 uppercase tracking-wider text-[10px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">Loading expenditures...</td></tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="bg-gray-50 p-4 rounded-full">
                                                <Receipt className="h-10 w-10 text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 font-bold">No expenses found for this period</p>
                                            <Button variant="link" onClick={() => setShowAddModal(true)} className="text-laundry-primary">Record your first expense</Button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5 whitespace-nowrap font-medium text-gray-600">{new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-gray-900">{expense.description}</div>
                                            {expense.notes && <div className="text-xs text-gray-400 mt-1 line-clamp-1">{expense.notes}</div>}
                                        </td>
                                        <td className="px-6 py-5 font-black text-gray-900 text-base">RWF {expense.amount.toLocaleString()}</td>
                                        <td className="px-6 py-5">
                                            <div className="text-xs font-bold text-gray-900">{expense.recordedBy || "System"}</div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => deleteExpense(expense.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-xl shadow-2xl border-0 rounded-3xl overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-8 duration-300">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Record Expense</h2>
                                <p className="text-gray-400 text-sm font-medium">Input your business spending details</p>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100" onClick={() => setShowAddModal(false)}>
                                <Plus className="h-6 w-6 rotate-45 text-gray-400" />
                            </Button>
                        </div>
                        <form onSubmit={handleAddExpense} className="p-8 space-y-6 bg-gray-50/50">
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-gray-400">What was bought? *</Label>
                                <Input
                                    id="description"
                                    placeholder=""
                                    className="h-14 rounded-xl border-gray-200 focus:ring-laundry-primary"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="amount" className="text-xs font-black uppercase tracking-widest text-gray-400">Total Cost (RWF) *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="0.00"
                                        className="h-14 rounded-xl border-gray-200"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest text-gray-400">Date Spent</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        className="h-14 rounded-xl border-gray-200"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>



                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-xs font-black uppercase tracking-widest text-gray-400">Notes / Details</Label>
                                <textarea
                                    id="notes"
                                    className="flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-laundry-primary outline-none transition-all"
                                    placeholder="Payment method used, special details, etc."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" className="flex-1 h-14 rounded-xl font-bold" onClick={() => setShowAddModal(false)}>
                                    Go Back
                                </Button>
                                <Button type="submit" className="flex-1 h-14 rounded-xl bg-laundry-primary hover:bg-laundry-primary/90 text-white font-bold shadow-lg shadow-laundry-primary/20">
                                    Record Expense
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    )
}
