import Link from "next/link"
import { Logo } from "@/components/logo"
import { Phone, Mail, MapPin, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="mb-6">
              <Logo size="md" className="text-white" />
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed text-sm">
              Professional laundry and dry cleaning services you can trust. Fresh, clean clothes for your entire family.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 group">
                <div className="bg-primary/20 p-2.5 rounded-lg group-hover:bg-primary transition-all duration-300 group-hover:scale-110">
                  <Phone className="h-4 w-4 text-primary group-hover:text-white transition-colors" />
                </div>
                <span className="font-medium text-sm">+250 790 002 060</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 group">
                <div className="bg-primary/20 p-2.5 rounded-lg group-hover:bg-primary transition-all duration-300 group-hover:scale-110">
                  <Mail className="h-4 w-4 text-primary group-hover:text-white transition-colors" />
                </div>
                <span className="font-medium text-sm">tresbondrycleaners01@gmail.com</span>
              </div>
              <div className="flex items-start gap-3 text-gray-300 hover:text-white transition-all duration-300 group">
                <div className="bg-primary/20 p-2.5 rounded-lg group-hover:bg-primary transition-all duration-300 group-hover:scale-110 mt-0.5">
                  <MapPin className="h-4 w-4 text-primary group-hover:text-white transition-colors" />
                </div>
                <span className="font-medium text-sm">Kicukiro Center, Kigali, Rwanda</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-base mb-5 text-white">Services</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/services" className="text-gray-300 hover:text-primary transition-all duration-300 flex items-center gap-2 group text-sm">
                  <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity group-hover:scale-150"></span>
                  <span className="group-hover:translate-x-1 transition-transform">Dry Cleaning</span>
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-primary transition-all duration-300 flex items-center gap-2 group text-sm">
                  <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity group-hover:scale-150"></span>
                  <span className="group-hover:translate-x-1 transition-transform">Washing</span>
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-primary transition-all duration-300 flex items-center gap-2 group text-sm">
                  <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity group-hover:scale-150"></span>
                  <span className="group-hover:translate-x-1 transition-transform">Ironing</span>
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-primary transition-all duration-300 flex items-center gap-2 group text-sm">
                  <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity group-hover:scale-150"></span>
                  <span className="group-hover:translate-x-1 transition-transform">Folding</span>
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-primary transition-all duration-300 flex items-center gap-2 group text-sm">
                  <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity group-hover:scale-150"></span>
                  <span className="group-hover:translate-x-1 transition-transform">Stain Removal</span>
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-primary transition-all duration-300 flex items-center gap-2 group text-sm">
                  <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity group-hover:scale-150"></span>
                  <span className="group-hover:translate-x-1 transition-transform">Delivery</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-base mb-5 text-white">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-primary transition-all duration-300 flex items-center gap-2 group text-sm">
                  <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity group-hover:scale-150"></span>
                  <span className="group-hover:translate-x-1 transition-transform">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-primary transition-all duration-300 flex items-center gap-2 group text-sm">
                  <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity group-hover:scale-150"></span>
                  <span className="group-hover:translate-x-1 transition-transform">Our Services</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-base mb-5 text-white">Business Hours</h4>
            <div className="space-y-2.5 text-gray-300 text-sm mb-6">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p>Monday - Sunday: 7:30 AM - 10:00 PM</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-base mb-5 text-white">Account</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/auth/login" className="text-gray-300 hover:text-primary transition-all duration-300 flex items-center gap-2 group text-sm">
                    <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity group-hover:scale-150"></span>
                    <span className="group-hover:translate-x-1 transition-transform">Staff Portal Login</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700/50 pt-6 text-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} TrèsBon DRY CLEANERS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
