"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { 
  Plus, 
  Search, 
  Edit,
  UserCog,
  Clock,
  TrendingUp,
  UserCheck,
  UserX,
  Key,
  Shield,
  X
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"

interface Employee {
  id: string
  phone: string | null
  full_name: string | null
  role: string
  branch_id: string | null
  is_active: boolean
  created_at: string
  branch?: {
    name: string
  }
  ordersCount?: number
  revenueGenerated?: number
  lastActivity?: string | null
  isOnline?: boolean
}



export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [branches, setBranches] = useState<any[]>([])
  const [formData, setFormData] = useState({
    phone: "",
    full_name: "",
    role: "cashier",
    branch_id: "",
    password: "",
  })
  
  const [showPasswordModal, setShowPasswordModal] = useState<Employee | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [updatingPassword, setUpdatingPassword] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterEmployees()
  }, [searchTerm, roleFilter, employees])

  const loadData = async () => {
    try {
      const employeesRes = await fetch("/api/admin/users")
      const employeesData = await employeesRes.json().catch(() => ({}))

      if (!employeesRes.ok) {
        throw new Error(employeesData.error || "Failed to load employees")
      }
      
      const transformedEmployees = (employeesData.users || []).map((u: any) => {
        return {
          id: u.id,
          phone: u.phone,
          full_name: u.fullName,
          role: u.role,
          is_active: u.isActive !== false,
          created_at: u.createdAt,
          ordersCount: u.ordersCount || 0,
          revenueGenerated: u.revenueGenerated || 0,
          lastActivity: u.lastActive || null,
          isOnline: u.isOnline
        }
      })

      setEmployees(transformedEmployees)
      setFilteredEmployees(transformedEmployees)

      // Load branches - TODO: Create /api/branches endpoint
      setBranches([])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load employees",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterEmployees = () => {
    let filtered = [...employees]

    if (roleFilter !== "all") {
      filtered = filtered.filter((emp) => emp.role === roleFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.phone?.includes(searchTerm)
      )
    }

    setFilteredEmployees(filtered)
  }

  const handleAddEmployee = async () => {
    if (!formData.phone || !formData.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Phone number and password are required",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          password: formData.password,
          fullName: formData.full_name,
          role: formData.role,
          branchId: formData.branch_id || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to add employee")
      }

      toast({
        title: "Success",
        description: "Employee added successfully",
      })

      setShowAddModal(false)
      setFormData({
        phone: "",
        full_name: "",
        role: "cashier",
        branch_id: "",
        password: "",
      })
      loadData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add employee",
      })
    }
  }

  const toggleEmployeeStatus = async (employeeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: employeeId,
          isActive: !currentStatus,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update employee status")
      }

      toast({
        title: "Success",
        description: `Employee ${!currentStatus ? "activated" : "deactivated"} successfully`,
      })
      loadData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update employee status",
      })
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showPasswordModal || !newPassword) return

    setUpdatingPassword(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: showPasswordModal.id,
          password: newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update password")
      }

      toast({
        title: "Success",
        description: "Password updated successfully",
      })
      setShowPasswordModal(null)
      setNewPassword("")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update password",
      })
    } finally {
      setUpdatingPassword(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "supervisor":
        return "bg-purple-100 text-purple-800"
      case "cashier":
        return "bg-blue-100 text-blue-800"
      case "cleaner":
        return "bg-green-100 text-green-800"
      case "delivery":
        return "bg-cyan-100 text-cyan-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.lastActivity && (new Date().getTime() - new Date(e.lastActivity).getTime()) < 1000 * 60 * 5).length,
    inactive: employees.filter((e) => !e.is_active).length,
    byRole: {
      admin: employees.filter((e) => e.role === "admin").length,
      supervisor: employees.filter((e) => e.role === "supervisor").length,
      cashier: employees.filter((e) => e.role === "cashier").length,
      cleaner: employees.filter((e) => e.role === "cleaner").length,
      delivery: employees.filter((e) => e.role === "delivery").length,
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">Manage staff and their roles</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
            <UserCog className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Staff</div>
            <div className="text-2xl font-black text-gray-900">{stats.total}</div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-2xl text-green-600">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Now</div>
            <div className="text-2xl font-black text-green-600">{stats.active}</div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Top Performer</div>
            <div className="text-sm font-black text-gray-900 truncate max-w-[120px]">
              {employees.sort((a,b) => (b.ordersCount || 0) - (a.ordersCount || 0))[0]?.full_name || "N/A"}
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-white border-amber-100 flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Last Activity</div>
            <div className="text-xs font-black text-gray-900">
              {employees.find(e => e.lastActivity)?.full_name || "None"}
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Employees Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading employees...</div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No employees found</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                 {filteredEmployees.map((employee) => {
                  const lastActiveDate = employee.lastActivity ? new Date(employee.lastActivity) : null
                  const isLive = employee.isOnline && lastActiveDate && (new Date().getTime() - lastActiveDate.getTime()) < 1000 * 60 * 5
                  const isRecentlyActive = employee.isOnline && lastActiveDate && (new Date().getTime() - lastActiveDate.getTime()) < 1000 * 60 * 60 * 2
                  const wasActiveToday = lastActiveDate && (new Date().getTime() - lastActiveDate.getTime()) < 1000 * 60 * 60 * 24
                  
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${getRoleColor(employee.role).split(' ')[0]} ${getRoleColor(employee.role).split(' ')[1].replace('800', '600')}`}>
                            {(employee.full_name || "U")[0]}
                          </div>
                          <div>
                            <div className="text-sm font-black text-gray-900">
                              {employee.full_name || "No Name"}
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{employee.role} • {employee.phone}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-black text-secondary">{employee.ordersCount} Orders</div>
                          <div className="text-[10px] font-bold text-green-600">RWF {(employee.revenueGenerated || 0).toLocaleString()}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {employee.lastActivity ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-700">{new Date(employee.lastActivity).toLocaleDateString()}</span>
                            <span className="text-[10px] text-gray-400 font-medium">{new Date(employee.lastActivity).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Never recorded</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {!employee.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-widest bg-red-100 text-red-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                              Disabled
                            </span>
                          ) : isLive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-widest bg-green-100 text-green-700 ring-2 ring-green-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping"></span>
                              Live Now
                            </span>
                          ) : isRecentlyActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-widest bg-blue-50 text-blue-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                              Idle
                            </span>
                          ) : wasActiveToday ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-widest bg-gray-100 text-gray-500">
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                              Offline
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-widest bg-gray-50 text-gray-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-300"></span>
                              Away
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full font-bold text-[10px] uppercase tracking-widest px-4"
                            onClick={() => toggleEmployeeStatus(employee.id, employee.is_active)}
                          >
                            {employee.is_active ? "Suspend" : "Restore"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full hover:bg-amber-50 hover:text-amber-600"
                            onClick={() => setShowPasswordModal(employee)}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Link href={`/admin/employees/${employee.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:text-blue-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Employee</h3>
            <div className="space-y-4">
              <div>
                <Label>Phone *</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0780000000"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>


              <div className="flex gap-2">
                <Button onClick={handleAddEmployee} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Add Employee
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false)
                    setFormData({
                      phone: "",
                      full_name: "",
                      role: "cashier",
                      branch_id: "",
                      password: "",
                    })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Change Password Modal */}
      <Dialog open={!!showPasswordModal} onOpenChange={(open) => !open && setShowPasswordModal(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-extrabold text-secondary tracking-tight">Update Password</DialogTitle>
              <DialogDescription className="text-gray-500 font-medium">Reset password for <strong>{showPasswordModal?.full_name || showPasswordModal?.phone}</strong></DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <Label htmlFor="new-password" className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">New Password *</Label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    className="h-12 pl-12 rounded-2xl border-gray-100 focus:border-laundry-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPasswordModal(null)}
                  className="flex-1 h-12 rounded-2xl font-bold text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatingPassword}
                  className="flex-1 h-12 rounded-2xl font-extrabold bg-laundry-primary hover:bg-laundry-primary/90 text-white shadow-lg shadow-laundry-primary/20"
                >
                  {updatingPassword ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Updating...</span>
                    </div>
                  ) : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

