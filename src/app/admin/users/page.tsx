"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  Eye,
  Mail,
  Phone,
  User,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  Trash2,
  X
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UserData {
  id: string
  phone: string
  fullName?: string
  role?: string
  user_metadata?: {
    full_name?: string
  }
  created_at: string
  last_sign_in_at: string | null
  isActive: boolean
  customer?: {
    id: string
    name: string
    phone: string | null
    type: string
  }
}



export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    fullName: "",
    role: "customer" as "delivery" | "customer"
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.customer?.phone?.includes(searchTerm)
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const loadUsers = async () => {
    try {
      // Try to get users from API route (uses service role for auth.users access)
      const response = await fetch("/api/admin/users")

      if (response.ok) {
        const { users: usersData } = await response.json()
        // Transform the data to match UserData interface
        const transformedUsers: UserData[] = (usersData || []).map((u: any) => ({
          id: u.id || u._id,
          phone: u.phone,
          fullName: u.fullName,
          role: u.role,
          user_metadata: u.fullName ? { full_name: u.fullName } : undefined,
          created_at: u.createdAt || u.created_at,
          last_sign_in_at: null,
          isActive: u.isActive !== false,
          customer: u.customer || undefined,
        }))
        setUsers(transformedUsers)
        setFilteredUsers(transformedUsers)
      } else {
        const errorData = await response.json().catch(() => ({}))
        // If it's an auth error, show a specific message
        if (response.status === 403) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: errorData.error || "Admin access required. Please log in as an admin.",
          })
        } else {
          // Fallback: Get customers if API fails
          const customersRes = await fetch("/api/admin/customers")
          if (customersRes.ok) {
            const customersData = await customersRes.json()
            const usersWithData: UserData[] = (customersData.customers || []).map((customer: any) => ({
              id: customer._id || customer.id,
              phone: customer.phone || "",
              created_at: customer.createdAt || customer.created_at,
              last_sign_in_at: null,
              customer: {
                id: customer._id || customer.id,
                name: customer.name,
                phone: customer.phone,
                type: customer.type,
              },
            }))
            setUsers(usersWithData)
            setFilteredUsers(usersWithData)
          } else {
            throw new Error(errorData.error || "Failed to load users")
          }
        }
      }
    } catch (error: any) {
      console.error("Error loading users:", error)
      // Only show toast if it's not already shown
      if (!error.message?.includes("Admin access required")) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load users. Please try again later.",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (user: UserData) => {
    if (!user.last_sign_in_at) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          <XCircle className="h-3 w-3" />
          Never Logged In
        </span>
      )
    }

    const lastSignIn = new Date(user.last_sign_in_at)
    const daysSince = Math.floor((Date.now() - lastSignIn.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSince === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Active Today
        </span>
      )
    } else if (daysSince <= 7) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          <Clock className="h-3 w-3" />
          Active {daysSince}d ago
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          <Clock className="h-3 w-3" />
          Inactive {daysSince}d ago
        </span>
      )
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.phone || !formData.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Phone number and password are required",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long",
      })
      return
    }

    setCreating(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          password: formData.password,
          fullName: formData.fullName || undefined,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user")
      }

      toast({
        title: "Success",
        description: "User created successfully",
      })

      // Reset form and close modal
      setFormData({
        phone: "",
        password: "",
        fullName: "",
        role: "customer",
      })
      setShowCreateModal(false)

      // Reload users
      loadUsers()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create user",
      })
    } finally {
      setCreating(false)
    }
  }

  const [confirmDelete, setConfirmDelete] = useState<{ id: string, phone: string } | null>(null)

  const handleDeleteUser = async (userId: string, userPhone: string) => {
    setConfirmDelete({ id: userId, phone: userPhone })
  }

  const executeDelete = async () => {
    if (!confirmDelete) return

    const { id: userId, phone: userPhone } = confirmDelete
    setDeleting(userId)
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user")
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      })

      // Reload users
      loadUsers()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete user",
      })
    } finally {
      setDeleting(null)
      setConfirmDelete(null)
    }
  }

  const [showPasswordModal, setShowPasswordModal] = useState<UserData | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

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

  const toggleUserStatus = async (user: UserData) => {
    setUpdatingStatus(user.id)
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          isActive: !user.isActive,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update status")
      }

      toast({
        title: "Success",
        description: `User ${!user.isActive ? "activated" : "suspended"} successfully`,
      })
      loadUsers()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update status",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getRoleBadge = (role?: string) => {
    if (!role) return null

    const roleColors: Record<string, string> = {
      admin: "bg-red-100 text-red-800 border border-red-200",
      supervisor: "bg-purple-100 text-purple-800 border border-purple-200",
      delivery: "bg-cyan-100 text-cyan-800 border border-cyan-200",
      customer: "bg-gray-100 text-gray-800 border border-gray-200",
      cashier: "bg-blue-100 text-blue-800 border border-blue-200",
    }

    return (
      <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${roleColors[role] || "bg-gray-100 text-gray-800 border border-gray-200"}`}>
        {role}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users & Authentication</h1>
          <p className="text-gray-600 mt-1">Manage all system users and their roles</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by phone or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading users...</div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No users found</p>
          {searchTerm && (
            <Button
              variant="ghost"
              onClick={() => setSearchTerm("")}
              className="mt-4"
            >
              Clear search
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Login Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sign In
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.user_metadata?.full_name || user.customer?.name || "User"}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 space-y-1">
                        {user.customer?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{user.customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.customer ? (
                        <div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${user.customer.type === "regular"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {user.customer.type === "regular" ? "Regular Customer" : "Walk-in"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No customer profile</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-widest bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-widest bg-red-100 text-red-700">
                            <XCircle className="h-3 w-3" />
                            Suspended
                          </span>
                        )}
                        <p className="text-[10px] text-gray-400 font-medium px-1 capitalize">
                          {getStatusBadge(user)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPasswordModal(user)}
                          className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest border-gray-200 hover:bg-laundry-primary hover:text-white hover:border-laundry-primary transition-all"
                        >
                          Pass
                        </Button>
                        <Button
                          variant={user.isActive ? "ghost" : "outline"}
                          size="sm"
                          onClick={() => toggleUserStatus(user)}
                          disabled={updatingStatus === user.id}
                          className={`h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                            user.isActive 
                              ? "text-orange-600 hover:bg-orange-50 hover:text-orange-700" 
                              : "text-green-600 border-green-200 hover:bg-green-50"
                          }`}
                        >
                          {updatingStatus === user.id ? (
                            <Clock className="h-3 w-3 animate-spin" />
                          ) : user.isActive ? (
                            "Suspend"
                          ) : (
                            "Activate"
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.phone)}
                          disabled={deleting === user.id || user.role === 'admin'}
                          className="h-8 w-8 p-0 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-30"
                        >
                          {deleting === user.id ? (
                            <Clock className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {users.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Active Users (Last 7 Days)</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {users.filter(u => {
              if (!u.last_sign_in_at) return false
              const daysSince = Math.floor((Date.now() - new Date(u.last_sign_in_at).getTime()) / (1000 * 60 * 60 * 24))
              return daysSince <= 7
            }).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">With Customer Profile</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {users.filter(u => u.customer).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Never Logged In</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {users.filter(u => !u.last_sign_in_at).length}
          </div>
        </Card>
      </div>

      {/* Change Password Modal */}
      <Dialog open={!!showPasswordModal} onOpenChange={(open) => !open && setShowPasswordModal(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-extrabold text-secondary tracking-tight">Update Password</DialogTitle>
              <DialogDescription className="text-gray-500 font-medium">Reset password for <strong>{showPasswordModal?.fullName || showPasswordModal?.phone}</strong></DialogDescription>
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

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-extrabold text-secondary tracking-tight">Create New User</DialogTitle>
              <DialogDescription className="text-gray-500 font-medium">Add a new member to the system and assign their role.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0780000000"
                  required
                  className="h-12 rounded-2xl border-gray-100 focus:border-laundry-primary"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="h-12 rounded-2xl border-gray-100 focus:border-laundry-primary"
                />
              </div>

              <div>
                <Label htmlFor="fullName" className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Optional"
                  className="h-12 rounded-2xl border-gray-100 focus:border-laundry-primary"
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Role *</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as "delivery" | "customer" })}
                  className="w-full h-12 px-4 rounded-2xl border border-gray-100 focus:border-laundry-primary focus:outline-none focus:ring-2 focus:ring-laundry-primary/20 font-medium text-gray-700 bg-white"
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="delivery">Delivery</option>
                  <option value="cashier">Cashier</option>
                  <option value="cleaner">Cleaner</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-[10px] text-gray-400 font-medium mt-2 italic">Be careful when assigning Admin/Supervisor roles.</p>
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 h-12 rounded-2xl font-bold text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="flex-1 h-12 rounded-2xl font-extrabold bg-laundry-primary hover:bg-laundry-primary/90 text-white shadow-lg shadow-laundry-primary/20"
                >
                  {creating ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Creating...</span>
                    </div>
                  ) : "Create User"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${confirmDelete?.phone}? This action will permanently remove their account and all associated data. This cannot be undone.`}
        confirmText="Delete Account"
        cancelText="Keep User"
        variant="danger"
        loading={!!deleting}
      />
    </div>
  )
}

