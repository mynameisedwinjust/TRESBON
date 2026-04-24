"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface ServiceImageProps {
  src?: string
  alt: string
  title?: string
  className?: string
  fallback?: string
  priority?: boolean
}

export function ServiceImage({ src, alt, className = "", fallback, priority = false }: ServiceImageProps) {
  const [error, setError] = useState(false)
  const [imgSrc, setImgSrc] = useState(src || fallback || "")

  useEffect(() => {
    setImgSrc(src || fallback || "")
    setError(false)
  }, [src, fallback])

  // Better fallback SVG with brand styling
  const fallbackSvg = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(`
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ef4444;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:#991b1b;stop-opacity:0.2" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <text x="50%" y="45%" font-family="Arial" font-size="28" fill="#991b1b" text-anchor="middle" font-weight="bold">${alt}</text>
      <text x="50%" y="55%" font-family="Arial" font-size="16" fill="#ef4444" text-anchor="middle" font-weight="600">TrèsBon DRY CLEANERS</text>
    </svg>
  `)))}`

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Image
        src={error ? fallbackSvg : (imgSrc || fallbackSvg)}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={() => setError(true)}
        priority={priority}
        unoptimized={imgSrc.startsWith('data:')}
      />
    </div>
  )
}
