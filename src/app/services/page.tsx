import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ServiceImage } from "@/components/service-image"
import { serviceImages } from "@/lib/images"
import { servicesData } from "@/lib/services-data"
import {
  Shirt,
  Droplets,
  Wind,
  Package,
  Sparkles,
  Truck,
  CheckCircle2,
  ArrowRight
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function ServicesPage() {
  const mainServices = [
    {
      name: "Men's Collection",
      type: "dry_cleaning",
      icon: Shirt,
      image: serviceImages.men,
      description: "Professional care for men's formal and casual wear",
      features: ["Formal Suit & Costume Care", "Shirt & Trousers Cleaning", "Jacket & Coat Specialists", "Shorts & Cap Maintenance"]
    },
    {
      name: "Women's Collection",
      type: "dry_cleaning",
      icon: Sparkles,
      image: serviceImages.women,
      description: "Specialized care for women's wardrobes and delicate garments",
      features: ["Wedding Gown Preservation", "Umushanana Traditional Wear", "Dress & Ensemble Specialists", "Blouse & Skirt Handling"]
    },
    {
      name: "Household & Linens",
      type: "washing",
      icon: Package,
      image: serviceImages.washing,
      description: "Expert cleaning for your home textiles and bedding",
      features: ["Bed Cover & Duvet (All Sizes)", "Curtain & Net Maintenance", "Towel & Bathrobe Laundry", "Blankets & Tablecloths"]
    },
    {
      name: "Iron & Press",
      type: "ironing",
      icon: Wind,
      image: serviceImages.ironing,
      description: "Professional ironing and pressing service",
      features: ["Expert Steam Pressing", "Wrinkle-Free Results", "Suit & Shirt Pressing", "Linen & Bed Sheet Ironing"]
    },
    {
      name: "Stain Removal",
      type: "stain_removal",
      icon: Sparkles,
      image: serviceImages.stainRemoval,
      description: "Professional treatment for tough stains",
      features: ["Advanced Stain Removal", "Oil & Coffee Stain Specialists", "Fabric-Safe Methods", "Guaranteed Results"]
    },
    {
      name: "Express Service",
      type: "washing",
      icon: Wind,
      image: serviceImages.express,
      description: "Priority processing for your urgent needs",
      features: ["24-Hour Turnaround", "Priority Handling", "Fast Delivery", "Same-Day Possible"]
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Our Services
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive laundry solutions tailored to meet all your needs.
              Professional care for every garment.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainServices.map((service, idx) => {
              const serviceData = servicesData.find(s => s.name === service.name)
              const price = serviceData?.base_price || 0

              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative h-64 overflow-hidden">
                    <ServiceImage
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      priority={idx < 2}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {service.name}
                    </h3>
                    <div className="mb-4">
                      <p className="text-primary font-black text-lg">
                        {serviceData && serviceData.items.length > 0
                          ? `From ${formatCurrency(Math.min(...serviceData.items.map(i => i.price || 0)))}`
                          : "Itemized Pricing"}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Pricing varies by garment type</p>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {service.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href="/auth/login">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12">
                        Staff Access
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Additional Services
            </h2>
            <p className="text-xl text-gray-600">
              We also offer specialized services for your convenience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {servicesData
              .filter(s => !["washing", "dry_cleaning", "ironing", "folding", "stain_removal"].includes(s.type))
              .map((service, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {service.description}
                  </p>
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold">
                      Staff Access
                    </Button>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-purple-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Access the Staff Portal
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Manage operations, customers, and orders from the central dashboard
          </p>
          <Link href="/auth/login">
            <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 text-xl font-black px-12 py-8 rounded-2xl shadow-xl hover:scale-105 transition-all">
              Staff Portal Login
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

