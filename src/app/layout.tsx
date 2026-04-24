import type { Metadata, Viewport } from "next"
import { Inter, Mulish, Raleway } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"
import NextTopLoader from 'nextjs-toploader'

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
})

const mulish = Mulish({
  subsets: ["latin"],
  weight: ['400', '600', '700', '800'],
  variable: '--font-mulish',
})

const raleway = Raleway({
  subsets: ["latin"],
  weight: ['400', '600', '700', '800'],
  variable: '--font-raleway',
})

export const metadata: Metadata = {
  title: "Très Bon Professional Laundry - Premium Laundry Services",
  description: "Professional laundry and dry cleaning services for your family.",
  manifest: "/manifest.json",
  icons: {
    icon: '/tresbon-official-logo.png',
    shortcut: '/tresbon-official-logo.png',
    apple: '/tresbon-official-logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: "#ED1C24",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${mulish.variable} ${raleway.variable}`} suppressHydrationWarning>
      <body
        className="h-full antialiased font-sans"
        suppressHydrationWarning
        style={{
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          height: '100%',
        }}
      >
        <NextTopLoader
          color="#ED1C24"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #ED1C24,0 0 5px #ED1C24"
        />
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

