import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

import {
  Shield,
  Star,
  ChevronRight,
  ArrowRight
} from "lucide-react"
import { FastServiceIcon } from "@/components/icons/fast-service-icon"
import { FreeDeliveryIcon } from "@/components/icons/free-delivery-icon"
import { ExpertCareIcon } from "@/components/icons/expert-care-icon"
import { BackgroundSlider } from "@/components/background-slider"
import { carouselImages } from "@/lib/images"

export default function HomePage() {
  const features = [
    { Icon: FastServiceIcon, title: "Fast Service", desc: "Same-day or next-day delivery available", color: "from-blue-500 to-blue-600", isCustom: true },
    { Icon: Shield, title: "Quality Guaranteed", desc: "100% satisfaction guarantee on all services", color: "from-green-500 to-green-600", isCustom: false },
    { Icon: FreeDeliveryIcon, title: "Free Delivery", desc: "Complimentary pickup and delivery service", color: "from-purple-500 to-purple-600", isCustom: true },
    { Icon: ExpertCareIcon, title: "Expert Care", desc: "Trained professionals handling your garments", color: "from-amber-500 to-amber-600", isCustom: true },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="relative h-[600px] md:h-[750px] overflow-hidden">
          {/* Dynamic Background Slider */}
          <div className="absolute inset-0 z-0">
            <BackgroundSlider
              images={carouselImages}
              duration={6000}
              transitionDuration={1500}
            />
          </div>
          <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/60 to-transparent">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-700">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
                  Premium Care for Your Garments
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-10 drop-shadow-md leading-relaxed">
                  TrèsBon DRY CLEANERS - Where professionalism meets perfection. Expert care delivered to your doorstep.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/auth/login">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                      Login to Dashboard
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 px-8 py-6 rounded-2xl text-lg font-bold">
                      Explore Services
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-7xl text-center">
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-secondary mb-4 tracking-tight">
                Why Choose TrèsBon?
              </h2>
              <div className="h-1.5 w-24 bg-laundry-primary mx-auto rounded-full"></div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-2xl transition-all duration-300 group">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                    {feature.isCustom ? <feature.Icon className="h-8 w-8 text-white" /> : <feature.Icon className="h-8 w-8 text-white" />}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Services", desc: "View our full range of cleaning options", link: "/services", color: "text-blue-600" },
                { title: "About Us", desc: "Our story and commitment to quality", link: "/about", color: "text-red-600" },
              ].map((card, i) => (
                <Link key={i} href={card.link} className="group">
                  <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all h-full">
                    <h3 className={`text-2xl font-bold mb-3 ${card.color}`}>{card.title}</h3>
                    <p className="text-gray-600 mb-6">{card.desc}</p>
                    <div className="flex items-center font-bold text-gray-900 group-hover:gap-2 transition-all">
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-secondary">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Access the TrêsBon Management System</h2>
            <Link href="/auth/login">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-10 py-8 rounded-full text-2xl font-bold shadow-2xl group transition-all duration-300 hover:scale-105">
                Login to Dashboard <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
