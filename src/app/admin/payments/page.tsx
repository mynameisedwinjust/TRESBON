"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
  Plus,
  Search,
  Eye,
  Download,
  FileText,
  DollarSign,
  CreditCard,
  Smartphone,
  Banknote,
  Calendar
} from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from 'xlsx'
import { loadImage } from "@/lib/pdf-helpers"

interface Payment {
  id: string
  order_id: string
  amount: number
  method: string
  status: string
  transaction_id: string | null
  notes: string | null
  created_at: string
  order?: {
    order_number: string
    total_amount: number
    paid_amount: number
    customer?: {
      name: string
      phone: string | null
    } | null
  }
}



export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })
  const { toast } = useToast()

  useEffect(() => {
    loadPayments()
  }, [dateRange])

  useEffect(() => {
    filterPayments()
  }, [searchTerm, methodFilter, statusFilter, payments])

  const loadPayments = async () => {
    try {
      const query = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end
      })
      const response = await fetch(`/api/admin/payments?${query.toString()}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setPayments(data.payments || [])
      setFilteredPayments(data.payments || [])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load payments",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = [...payments]

    if (methodFilter !== "all") {
      filtered = filtered.filter((p) => p.method === methodFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.order?.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPayments(filtered)
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <Banknote className="h-4 w-4" />
      case "mobile_money":
        return <Smartphone className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getMethodLabel = (method: string) => {
    return method.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF()

      // Brand Colors
      const brandRed = [237, 28, 36] // #ED1C24
      const brandBlue = [0, 113, 188] // #0071BC
      const grayDark = [50, 50, 50]
      const grayMed = [100, 100, 100]
      const grayLight = [150, 150, 150]

      // 1. Add Logo Image
      const startX = 14
      const startY = 15

      try {
        const logoData = await loadImage('/tresbon-official-logo.png')
        // Professional Hanger Mascot Logo (Roughly 2.7:1 aspect ratio)
        doc.addImage(logoData, 'PNG', startX, startY, 55, 20)
      } catch (error) {
        console.error("Failed to load logo:", error)
        // Fallback to text if logo fails
        doc.setFont("helvetica", "bold")
        doc.setFontSize(22)
        doc.setTextColor(brandRed[0], brandRed[1], brandRed[2])
        doc.text("Très", startX, startY + 10)
        doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2])
        doc.text("Bon", startX + 20, startY + 10)
      }

      // 2. Report Header Text
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2])
      doc.text("P R E M I U M   L A U N D R Y   &   D R Y   C L E A N I N G", 14, startY + 23)
      
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(grayMed[0], grayMed[1], grayMed[2])
      doc.text("TEL: 0790 002 060 / 0726 230 475", 14, startY + 26)

      // Divider Line (adjusted for slightly larger banner)
      doc.setDrawColor(230, 230, 230)
      doc.setLineWidth(0.5)
      doc.line(startX, startY + 28, 196, startY + 28)

      // 3. Report Title & Meta Info
      doc.setFont("helvetica", "bold")
      doc.setFontSize(22)
      doc.setTextColor(grayDark[0], grayDark[1], grayDark[2])
      doc.text("PAYMENT HISTORY", startX, startY + 45)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)
      doc.setTextColor(grayMed[0], grayMed[1], grayMed[2])
      doc.text("Financial Transaction Report", startX, startY + 53)

      // Right-aligned Meta Data
      doc.setFontSize(9)
      doc.setTextColor(grayLight[0], grayLight[1], grayLight[2])
      doc.text(`Generated: ${new Date().toLocaleString()}`, 196, startY + 45, { align: 'right' })

      const tableColumn = ["Date", "Order #", "Method", "Status", "Transaction ID", "Amount"]
      const tableRows: any[] = []

      filteredPayments.forEach((payment) => {
        const paymentData = [
          new Date(payment.created_at).toLocaleDateString(),
          payment.order?.order_number || "N/A",
          getMethodLabel(payment.method),
          payment.status.toUpperCase(),
          payment.transaction_id || "—",
          `RWF ${payment.amount.toLocaleString()}`,
        ]
        tableRows.push(paymentData)
      })

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: startY + 65,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [66, 139, 202] }, // Blue header
      })

      doc.save(`TresBon_Payments_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error("PDF Generation Error:", error)
      toast({
        title: "Export Failed",
        description: "Could not generate PDF with logo",
        variant: "destructive"
      })
    }
  }

  const exportToExcel = () => {
    const dataToExport = filteredPayments.map(p => ({
      Date: new Date(p.created_at).toLocaleDateString(),
      "Order Number": p.order?.order_number || "N/A",
      Method: getMethodLabel(p.method),
      Status: p.status.toUpperCase(),
      "Transaction ID": p.transaction_id || "—",
      Amount: p.amount,
      Notes: p.notes || ""
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 15 }, // Order The #
      { wch: 15 }, // Method
      { wch: 10 }, // Status
      { wch: 20 }, // Transaction ID
      { wch: 12 }, // Amount
      { wch: 30 }  // Notes
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Payments")
    XLSX.writeFile(wb, `Payments-${dateRange.start}-to-${dateRange.end}.xlsx`)
  }

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0)

  const methodTotals = {
    cash: payments.filter((p) => p.method === "cash" && p.status === "completed").reduce((sum, p) => sum + p.amount, 0),
    mobile_money: payments.filter((p) => p.method === "mobile_money" && p.status === "completed").reduce((sum, p) => sum + p.amount, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Manage payments and billing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            RWF {totalRevenue.toLocaleString()}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Cash</div>
          <div className="text-xl font-bold text-gray-900 mt-1">
            RWF {methodTotals.cash.toLocaleString()}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Mobile Money</div>
          <div className="text-xl font-bold text-gray-900 mt-1">
            RWF {methodTotals.mobile_money.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          {/* Date Range */}
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Date Range:</span>
            </div>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-40"
            />
            <span className="text-gray-500">to</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-40"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by order number or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="mobile_money">Mobile Money</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading payments...</div>
        </div>
      ) : filteredPayments.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No payments found</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">
                          Order #{payment.order?.order_number || "N/A"}
                        </span>
                        <span className="text-xs font-semibold text-gray-600 mt-0.5">
                          {payment.order?.customer?.name || "Walk-in Customer"}
                          {payment.order?.customer?.phone && ` • ${payment.order.customer.phone}`}
                        </span>
                        {payment.order && (
                          <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-1.5 flex flex-wrap gap-2">
                            <span>Total: <span className="text-gray-600">RWF {payment.order.total_amount?.toLocaleString()}</span></span>
                            <span>|  Paid: <span className="text-gray-600">RWF {payment.order.paid_amount?.toLocaleString()}</span></span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      RWF {payment.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.method)}
                        <span className="text-sm text-gray-900">
                          {getMethodLabel(payment.method)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.transaction_id ? (
                        <code className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold font-mono tracking-wider border border-gray-200">{payment.transaction_id}</code>
                      ) : (
                        <span className="text-gray-400 font-bold">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{new Date(payment.created_at).toLocaleDateString()}</span>
                        <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">{new Date(payment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payment.order && (
                        <Link href={`/admin/orders/${payment.order_id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

