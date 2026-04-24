"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { CarouselImage } from "@/components/carousel-image"

interface BackgroundSliderProps {
    images: string[]
    duration?: number
    transitionDuration?: number
    className?: string
    overlayClassName?: string
}

export function BackgroundSlider({
    images,
    duration = 5000,
    transitionDuration = 1000,
    className,
    overlayClassName
}: BackgroundSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [nextIndex, setNextIndex] = useState(1)
    const [isTransitioning, setIsTransitioning] = useState(false)

    useEffect(() => {
        if (!images || images.length <= 1) return

        const interval = setInterval(() => {
            setIsTransitioning(true)

            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length)
                setNextIndex((prev) => (prev + 1) % images.length)
                setIsTransitioning(false)
            }, transitionDuration)
        }, duration)

        return () => clearInterval(interval)
    }, [images, duration, transitionDuration])

    if (!images || images.length === 0) return null

    return (
        <div className={cn("relative w-full h-full overflow-hidden", className)}>
            {/* Current Image */}
            <div
                className={cn(
                    "absolute inset-0 transition-opacity ease-in-out",
                    isTransitioning ? "opacity-0" : "opacity-100"
                )}
                style={{ transitionDuration: `${transitionDuration}ms` }}
            >
                <div className="w-full h-full animate-ken-burns">
                    <CarouselImage
                        src={images[currentIndex]}
                        alt="Background Slide"
                        className="w-full h-full object-cover"
                        index={currentIndex}
                    />
                </div>
            </div>

            {/* Next Image (Pre-rendered for smooth transition) */}
            <div
                className={cn(
                    "absolute inset-0 transition-opacity ease-in-out",
                    isTransitioning ? "opacity-100" : "opacity-0"
                )}
                style={{ transitionDuration: `${transitionDuration}ms` }}
            >
                <div className="w-full h-full animate-ken-burns">
                    <CarouselImage
                        src={images[(currentIndex + 1) % images.length]}
                        alt="Background Slide Next"
                        className="w-full h-full object-cover"
                        index={(currentIndex + 1) % images.length}
                    />
                </div>
            </div>

            {/* Dark Overlay for better text readability */}
            <div className={cn("absolute inset-0 bg-black/40", overlayClassName)} />
        </div>
    )
}
