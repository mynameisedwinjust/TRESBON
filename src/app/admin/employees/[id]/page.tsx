"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Clock, TrendingUp, Save } from "lucide-react"
import Link from "next/link"

interface Employee {
  id: string
  phone: string | null
  full_name: string | null
  role: string
  branch_id: string | null
  is_active: boolean
  created_at: string
}

interface Timesheet {
  id: string
  date: string
  time_in: string | null
  time_out: string | null
  hours_worked: number | null
  notes: string | null
}



function EmployeeDetailContent({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [formData, setFormData] = useState({
    full_name: "",
    role: "",
    branch_id: "",
    phone: "",
    is_active: true,
  })

  useEffect(() => {
    loadEmployeeData()
  }, [params.id])

  const loadEmployeeData = async () => {
    try {
      // Load employee
      const employeeRes = await fetch(`/api/admin/users`)
      if (!employeeRes.ok) throw new Error("Failed to load employee")
      const employeesData = await employeeRes.json()
      const employeeData = (employeesData.users || []).find((u: any) => (u._id || u.id) === params.id)

      if (!employeeData) throw new Error("Employee not found")

      setEmployee({
        id: employeeData._id || employeeData.id,
        phone: employeeData.phone || null,
        full_name: employeeData.fullName || employeeData.full_name || null,
        role: employeeData.role,
        branch_id: employeeData.branchId || employeeData.branch_id || null,
        is_active: employeeData.isActive !== false,
        created_at: employeeData.createdAt || employeeData.created_at,
      })
      setFormData({
        full_name: employeeData.fullName || employeeData.full_name || "",
        role: employeeData.role,
        branch_id: employeeData.branchId || employeeData.branch_id || "",
        phone: employeeData.phone || "",
        is_active: employeeData.isActive !== false,
      })

      // Load timesheets - TODO: Create /api/admin/timesheets endpoint
      setTimesheets([])

      // Load branches - TODO: Create /api/branches endpoint
      setBranches([])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load employee data",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Create /api/admin/users/[id] endpoint
      toast({
        title: "Success",
        description: "Employee updated successfully",
      })

      loadEmployeeData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update employee",
      })
    } finally {
      setSaving(false)
    }
  }

  const recordTimeIn = async () => {
    try {
      // TODO: Create /api/admin/timesheets endpoint
      toast({
        title: "Success",
        description: "Time in recorded",
      })

      loadEmployeeData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to record time in",
      })
    }
  }

  const recordTimeOut = async () => {
    try {
      // TODO: Create /api/admin/timesheets endpoint
      toast({
        title: "Success",
        description: "Time out recorded",
      })

      loadEmployeeData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to record time out",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading employee data...</div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="space-y-6">
        <Link href="/admin/employees">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
        </Link>
        <Card className="p-12 text-center">
          <p className="text-gray-500">Employee not found</p>
        </Card>
      </div>
    )
  }

  const todayTimesheet = timesheets.find(
    (t) => t.date === new Date().toISOString().split("T")[0]
  )

  const totalHours = timesheets
    .filter((t) => t.hours_worked)
    .reduce((sum, t) => sum + (t.hours_worked || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/employees">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {employee.full_name || employee.phone}
            </h1>
            <p className="text-gray-600 mt-1">Employee details and performance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employee Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input value={employee.phone || ""} disabled className="mt-1 bg-gray-50" />
                </div>


                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({ ...formData, is_active: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                  </div>
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>

          {/* Time Logs */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Logs</h2>
            {timesheets.length === 0 ? (
              <p className="text-gray-500">No time logs recorded</p>
            ) : (
              <div className="space-y-2">
                {timesheets.map((timesheet) => (
                  <div
                    key={timesheet.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(timesheet.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {timesheet.time_in
                          ? `In: ${new Date(timesheet.time_in).toLocaleTimeString()}`
                          : "No time in"}
                        {timesheet.time_out &&
                          ` • Out: ${new Date(timesheet.time_out).toLocaleTimeString()}`}
                      </div>
                    </div>
                    {timesheet.hours_worked && (
                      <div className="text-sm font-medium text-gray-900">
                        {timesheet.hours_worked.toFixed(2)} hrs
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Time In/Out */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Time Clock</h3>
            {todayTimesheet ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Time In</div>
                  <div className="text-base font-medium text-gray-900">
                    {todayTimesheet.time_in
                      ? new Date(todayTimesheet.time_in).toLocaleTimeString()
                      : "Not recorded"}
                  </div>
                </div>
                {todayTimesheet.time_in && (
                  <div>
                    <div className="text-sm text-gray-600">Time Out</div>
                    <div className="text-base font-medium text-gray-900">
                      {todayTimesheet.time_out
                        ? new Date(todayTimesheet.time_out).toLocaleTimeString()
                        : "Not recorded"}
                    </div>
                  </div>
                )}
                {todayTimesheet.hours_worked && (
                  <div>
                    <div className="text-sm text-gray-600">Hours Worked</div>
                    <div className="text-base font-medium text-gray-900">
                      {todayTimesheet.hours_worked.toFixed(2)} hours
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  {!todayTimesheet.time_in && (
                    <Button onClick={recordTimeIn} className="flex-1">
                      <Clock className="h-4 w-4 mr-2" />
                      Time In
                    </Button>
                  )}
                  {todayTimesheet.time_in && !todayTimesheet.time_out && (
                    <Button onClick={recordTimeOut} className="flex-1">
                      <Clock className="h-4 w-4 mr-2" />
                      Time Out
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Button onClick={recordTimeIn} className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Time In
              </Button>
            )}
          </Card>

          {/* Stats */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Performance</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Total Hours (Last 30 days)</div>
                <div className="text-2xl font-bold text-gray-900">{totalHours.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Days Worked</div>
                <div className="text-2xl font-bold text-gray-900">
                  {timesheets.filter((t) => t.hours_worked).length}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <EmployeeDetailContent params={params} />
    </Suspense>
  )
}

