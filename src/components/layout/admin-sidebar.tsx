"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  CreditCard,
  Truck,
  UserCog,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  Receipt
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Logo } from "@/components/logo"
import { PlusCircle } from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: PlusCircle, label: "Make an Order", href: "/admin/orders/new" },
  { icon: Users, label: "Customers", href: "/admin/customers" },
  { icon: Shield, label: "Users & Auth", href: "/admin/users" },
  { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
  { icon: Receipt, label: "Expenses", href: "/admin/expenses" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: UserCog, label: "Employees", href: "/admin/employees" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || "employee"

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout-action", { method: "POST" })
    } catch (e) {
      console.error("Logout report error:", e)
    }

    // Clear PIN access cookie
    document.cookie = 'admin_pin_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    await signOut({ redirect: false })
    router.push("/auth/login")
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-8 border-b border-gray-100">
            <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)}>
              <Logo size="sm" showText={true} className="justify-start scale-110 origin-left" />
            </Link>
            <p className="text-xs font-semibold text-gray-400 mt-4 uppercase tracking-widest px-1">Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-6">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isAdminOnly = ["/admin/users", "/admin/settings", "/admin/employees", "/admin/reports"].includes(item.href)
                if (isAdminOnly && userRole !== "admin" && userRole !== "supervisor") return null

                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-laundry-primary text-white shadow-lg shadow-laundry-primary/30 font-semibold"
                          : "text-gray-600 hover:bg-laundry-primary/5 hover:text-laundry-primary"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400")} />
                      <span className="font-heading">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-6 border-t border-gray-100">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl px-4 py-6"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className="font-heading">Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}

