"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CarouselImage } from "@/components/carousel-image"
import { cn } from "@/lib/utils"

interface CarouselProps {
  images: string[]
  autoPlay?: boolean
  interval?: number
  className?: string
}

export function Carousel({ images, autoPlay = true, interval = 5000, className }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)



  useEffect(() => {
    if (!autoPlay || images.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, images.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (!images || images.length === 0) {
    return (
      <div className={cn("relative w-full h-full overflow-hidden bg-gray-200", className)}>
        <div className="flex items-center justify-center h-full text-gray-500">
          No images available
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Images with sliding animation */}
      <div className="relative w-full h-full overflow-hidden">
        <div
          className="flex transition-transform duration-1000 ease-in-out h-full"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="h-full flex-shrink-0 w-full"
            >
              <CarouselImage
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
                index={index}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full shadow-lg"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full shadow-lg"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex ? "bg-white w-8" : "bg-white/50"
              )}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

