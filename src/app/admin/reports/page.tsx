"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
  Download,
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  BarChart3,
  Calendar,
  Eye,
  ArrowLeft
} from "lucide-react"
import * as XLSX from 'xlsx'
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { loadImage } from "@/lib/pdf-helpers"
import { cn } from "@/lib/utils"

interface ReportData {
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  totalCash: number
  totalPhone: number
  totalPaymentsCombined: number
  topServices: Array<{ name: string; count: number; revenue: number }>
    customerStats: {
      newCustomers: number
      returningCustomers: number
      totalOrdersMade: number
    }
  staffPerformance: Array<{ name: string; orders: number; hours: number }>
  dailyRevenue: Array<{ date: string; revenue: number }>
  detailedOrders: Array<{
    orderNumber: string
    customerName: string
    date: string
    totalAmount: number
    paidAmount: number
    status: string
    itemsCount: number
  }>
}



import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const userRole = (session?.user as any)?.role || "employee"
  const isAdminOrSupervisor = userRole === "admin" || userRole === "supervisor"

  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30_days")
  const [reportType, setReportType] = useState<"overview" | "daily" | "weekly" | "monthly" | "unpaid">("overview")
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    } else if (status === "authenticated" && !isAdminOrSupervisor) {
      router.push("/admin/dashboard")
    }
  }, [status, isAdminOrSupervisor, router])

  useEffect(() => {
    if (status === "authenticated" && isAdminOrSupervisor) {
      handlePeriodChange("30_days")
    }
  }, [status, isAdminOrSupervisor])

  useEffect(() => {
    if (status === "authenticated" && isAdminOrSupervisor) {
      loadReportData()
    }
  }, [dateRange, status, isAdminOrSupervisor])

  const handlePeriodChange = (value: string) => {
    setPeriod(value)
    const end = new Date()
    let start = new Date()

    switch (value) {
      case "today":
        start = new Date()
        break
      case "this_week":
        const day = end.getDay()
        start.setDate(end.getDate() - day)
        break
      case "this_month":
        start = new Date(end.getFullYear(), end.getMonth(), 1)
        break
      case "last_month":
        start = new Date(end.getFullYear(), end.getMonth() - 1, 1)
        end.setDate(0) // Last day of previous month
        break
      case "30_days":
        start.setDate(end.getDate() - 30)
        break
      case "60_days":
        start.setDate(end.getDate() - 60)
        break
      case "3_months":
        start.setMonth(end.getMonth() - 3)
        break
      case "6_months":
        start.setMonth(end.getMonth() - 6)
        break
      case "1_year":
        start.setFullYear(end.getFullYear() - 1)
        break
      case "all_time":
        start = new Date(2023, 0, 1) // Project start
        break
      default:
        start.setDate(end.getDate() - 30)
    }

    setDateRange({
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0]
    })
  }

  const loadReportData = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end
      })

      const res = await fetch(`/api/admin/reports?${query.toString()}`)
      const data = await res.json()
      
      if (data.customerStats) {
        data.customerStats.totalOrdersMade = data.customerStats.totalLoyaltyPoints
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch reports")
      }

      setReportData(data)
    } catch (error: any) {
      console.error("Error loading reports:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load report data",
      })
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async (download: boolean = true) => {
    if (!reportData) return

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

      // 2. Report Header Text - Matching brand typography
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

      // 3. Report Title & Meta Info (Fixing overlaps)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(22)
      doc.setTextColor(grayDark[0], grayDark[1], grayDark[2])
      const reportTitle = reportType === 'overview' ? 'REPORTS & ANALYTICS' :
        reportType === 'daily' ? 'DAILY PERFORMANCE REPORT' :
          reportType === 'weekly' ? 'WEEKLY PERFORMANCE REPORT' :
            reportType === 'monthly' ? 'MONTHLY INCOME REPORT' : 'UNPAID INVOICES REPORT'
      doc.text(reportTitle, startX, startY + 45)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)
      doc.setTextColor(grayMed[0], grayMed[1], grayMed[2])
      doc.text("Business Performance Overview", startX, startY + 53)

      // Right-aligned Meta Data
      doc.setFontSize(9)
      doc.setTextColor(grayLight[0], grayLight[1], grayLight[2])
      doc.text(`Generated: ${new Date().toLocaleString()}`, 196, startY + 45, { align: 'right' })
      doc.text(`Period: ${dateRange.start} to ${dateRange.end}`, 196, startY + 50, { align: 'right' })

      // Move down for content
      const contentStartY = startY + 65

      // Summary Section
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text("Summary Metrics", startX, contentStartY)

      const summaryData = [
        ["Total Revenue", `RWF ${reportData.totalRevenue.toLocaleString()}`],
        ["Total Orders", reportData.totalOrders.toString()],
        ["Average Order Value", `RWF ${reportData.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`],
        ["Total Customers", reportData.totalCustomers.toString()],
        ["", ""], // Spacer
        ["Total Cash Payments", `RWF ${reportData.totalCash.toLocaleString()}`],
        ["Total Phone Payments", `RWF ${reportData.totalPhone.toLocaleString()}`],
        ["Total Payments Combined", `RWF ${reportData.totalPaymentsCombined.toLocaleString()}`]
      ]

      autoTable(doc, {
        body: summaryData,
        startY: contentStartY + 5,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        columnStyles: { 0: { fontStyle: 'bold' } }
      })

      // Top Services Section
      let finalY = (doc as any).lastAutoTable.finalY + 15
      doc.text("Top Services", startX, finalY)

      const servicesData = reportData.topServices.map(s => [
        s.name,
        s.count,
        `RWF ${s.revenue.toLocaleString()}`
      ])

      autoTable(doc, {
        head: [["Service", "Orders", "Revenue"]],
        body: servicesData,
        startY: finalY + 5,
        headStyles: { fillColor: [46, 204, 113] } // Green header
      })

      // Detailed Transaction History
      doc.addPage() // New Page for Details
      doc.setFontSize(16)
      doc.text("Detailed Transaction History", 14, 20)
      doc.setFontSize(10)
      doc.text(`Period: ${dateRange.start} to ${dateRange.end}`, 14, 28)

      const detailsData = reportData.detailedOrders.map(o => [
        new Date(o.date).toLocaleDateString(),
        o.orderNumber || "N/A",
        o.customerName || "Guest",
        `RWF ${o.totalAmount.toLocaleString()}`,
        o.status.toUpperCase(),
        o.itemsCount.toString()
      ])

      autoTable(doc, {
        head: [["Date", "Order #", "Customer", "Amount", "Status", "Items"]],
        body: detailsData,
        startY: 35,
        headStyles: { fillColor: [52, 73, 94] }, // Dark header
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 40 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 },
          5: { cellWidth: 15 }
        }
      })

      if (download) {
        doc.save(`TresBon_Report_${new Date().toISOString().split('T')[0]}.pdf`)
      } else {
        const docBlob = doc.output('blob')
        const pdfUrl = URL.createObjectURL(docBlob)
        setPreviewUrl(pdfUrl)
      }
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
    if (!reportData) return

    const wb = XLSX.utils.book_new()

    // 1. Summary Stats Sheet
    const summaryData = [
      ["Metric", "Value"],
      ["Total Revenue", reportData.totalRevenue],
      ["Total Orders", reportData.totalOrders],
      ["Total Customers", reportData.totalCustomers],
      ["Avg Order Value", reportData.averageOrderValue],
      ["New Customers", reportData.customerStats.newCustomers],
      ["Returning Customers", reportData.customerStats.returningCustomers],
      ["Total Cash Payments", reportData.totalCash],
      ["Total Phone Payments", reportData.totalPhone],
      ["Total Combined Payments", reportData.totalPaymentsCombined]
    ]
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
    wsSummary['!cols'] = [{ wch: 20 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary")

    // 2. Daily Revenue Sheet
    if (reportData.dailyRevenue.length > 0) {
      const wsDaily = XLSX.utils.json_to_sheet(reportData.dailyRevenue)
      wsDaily['!cols'] = [{ wch: 15 }, { wch: 15 }]
      XLSX.utils.book_append_sheet(wb, wsDaily, "Daily Revenue")
    }

    // 3. Top Services Sheet
    if (reportData.topServices.length > 0) {
      const wsServices = XLSX.utils.json_to_sheet(reportData.topServices)
      wsServices['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 15 }]
      XLSX.utils.book_append_sheet(wb, wsServices, "Top Services")
    }

    // Save File
    XLSX.writeFile(wb, `Reports-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading reports...</div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500">No report data available</p>
      </Card>
    )
  }

  if (previewUrl) {
    return (
      <div className="min-h-[80vh] bg-gray-100 p-4 sm:p-8 rounded-lg">
        <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center no-print">
          <Button variant="outline" onClick={() => setPreviewUrl(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reports
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => generatePDF(true)}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
        <div className="max-w-5xl mx-auto bg-white shadow-md border h-[75vh]">
          <iframe src={previewUrl} className="w-full h-full border-0" title="Report Preview" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Business insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generatePDF(false)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview PDF
          </Button>
          <Button variant="outline" onClick={() => generatePDF(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: "overview", label: "General Overview" },
          { id: "daily", label: "Daily Report" },
          { id: "weekly", label: "Weekly Report" },
          { id: "monthly", label: "Monthly Income" },
          { id: "unpaid", label: "Unpaid Invoices" },
        ].map((type) => (
          <Button
            key={type.id}
            variant={reportType === type.id ? "default" : "outline"}
            onClick={() => {
              setReportType(type.id as any)
              if (type.id === "daily") handlePeriodChange("today")
              else if (type.id === "weekly") handlePeriodChange("this_week")
              else if (type.id === "monthly") handlePeriodChange("this_month")
              else if (type.id === "unpaid") handlePeriodChange("all_time") // Check all unpaid
              else handlePeriodChange("30_days")
            }}
            className={cn(
              "rounded-full px-6",
              reportType === type.id ? "bg-blue-600 text-white" : ""
            )}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Date Range */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter Period:</span>
          </div>

          <div className="flex flex-wrap gap-2 flex-1">
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="flex h-10 w-full md:w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="30_days">Last 30 Days</option>
              <option value="90_days">Last 90 Days</option>
              <option value="all_time">All Time</option>
            </select>

            <div className="flex items-center gap-2">
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

            <Button onClick={loadReportData} className="ml-auto">
              Apply Filters
            </Button>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Showing data from <span className="font-medium">{new Date(dateRange.start).toLocaleDateString()}</span> to <span className="font-medium">{new Date(dateRange.end).toLocaleDateString()}</span>
        </div>
      </Card>

      {/* Key Metrics */}
      {reportType !== 'unpaid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  RWF {reportData.totalRevenue.toLocaleString()}
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Orders</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {reportData.totalOrders}
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {reportType === 'unpaid' ? (
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Outstanding Invoices (Unpaid)</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.detailedOrders
                  .filter(o => o.paidAmount < o.totalAmount && o.status !== 'cancelled')
                  .map((order, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        RWF {order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        RWF {order.paidAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600">
                        RWF {(order.totalAmount - order.paidAmount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs">
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {reportData.detailedOrders.filter(o => o.paidAmount < o.totalAmount && o.status !== 'cancelled').length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No unpaid invoices found in this period.
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-8 mt-8">
          {/* Payment Breakdown */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-white border-l-4 border-l-orange-500 shadow-sm">
                <div className="text-sm text-gray-600 font-medium font-mono uppercase tracking-wider">Total Cash</div>
                <div className="text-3xl font-black text-gray-900 mt-2">
                  RWF {reportData.totalCash.toLocaleString()}
                </div>
                <div className="text-xs text-orange-600 mt-1 font-bold">Physical Currency</div>
              </Card>

              <Card className="p-6 bg-white border-l-4 border-l-blue-500 shadow-sm">
                <div className="text-sm text-gray-600 font-medium font-mono uppercase tracking-wider">Total Phone Payments</div>
                <div className="text-3xl font-black text-gray-900 mt-2">
                  RWF {reportData.totalPhone.toLocaleString()}
                </div>
                <div className="text-xs text-blue-600 mt-1 font-bold">Momo & Digital</div>
              </Card>

              <Card className="p-6 bg-teal-600 text-white shadow-md">
                <div className="text-sm text-white/80 font-medium font-mono uppercase tracking-wider">Total Combined</div>
                <div className="text-3xl font-black mt-2">
                  RWF {reportData.totalPaymentsCombined.toLocaleString()}
                </div>
                <div className="text-xs text-teal-100 mt-1 font-bold">Grand Total Collected</div>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Statistics */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Statistics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Customers</div>
                      <div className="text-xl font-bold text-gray-900">
                        {reportData.totalCustomers}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">New Customers</div>
                  <div className="text-lg font-medium text-gray-900">
                    {reportData.customerStats.newCustomers}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Returning Customers</div>
                  <div className="text-lg font-medium text-gray-900">
                    {reportData.customerStats.returningCustomers}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">Total Orders Made</div>
                  <div className="text-lg font-bold text-gray-900">
                    {reportData.customerStats.totalOrdersMade.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Average Order Value</div>
                  <div className="text-lg font-medium text-gray-900">
                    RWF {reportData.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Most Used Services */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Used Services</h2>
              <div className="space-y-3">
                {reportData.topServices.length === 0 ? (
                  <p className="text-gray-500 text-sm">No service data available</p>
                ) : (
                  reportData.topServices.map((service, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-900">{service.name}</span>
                        <span className="text-gray-600">
                          {service.count} orders • RWF {service.revenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${reportData.topServices[0].revenue > 0
                              ? (service.revenue / reportData.topServices[0].revenue) * 100
                              : 0
                              }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Staff Performance */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Performance</h2>
              <div className="space-y-3">
                {reportData.staffPerformance.length === 0 ? (
                  <p className="text-gray-500 text-sm">No staff performance data available</p>
                ) : (
                  reportData.staffPerformance.slice(0, 5).map((staff, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-500">
                          {staff.orders} orders • {staff.hours.toFixed(1)} hours
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Daily Revenue Chart Placeholder */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue Trend</h2>
            <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization - to be implemented with charting library</p>
                <p className="text-sm mt-1">
                  {reportData.dailyRevenue.length} data points available
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

