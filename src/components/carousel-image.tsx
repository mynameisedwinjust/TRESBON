import { useState, useEffect } from "react"
import { generatePlaceholderImage } from "@/lib/images"
import Image from "next/image"

interface CarouselImageProps {
  src: string
  alt: string
  className?: string
  index?: number
}

export function CarouselImage({ src, alt, className = "", index }: CarouselImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [error, setError] = useState(false)

  useEffect(() => {
    setImgSrc(src)
    setError(false)
  }, [src])

  const handleError = () => {
    if (!error) {
      setError(true)
      setImgSrc(generatePlaceholderImage("carousel", undefined, index))
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={`${className} object-cover transition-opacity duration-700`}
        style={{
          objectFit: 'cover',
        }}
        priority={index === 0}
        onError={handleError}
        sizes="100vw"
        quality={85}
      />
    </div>
  )
}

