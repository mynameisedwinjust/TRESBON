import React from "react"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
  showContact?: boolean
}

export function Logo({ className = "", showText = true, size = "md", showContact = false }: LogoProps) {
  const sizes = {
    sm: { scale: 0.6, width: 140, height: 45 },
    md: { scale: 1.0, width: 260, height: 80 },
    lg: { scale: 1.5, width: 400, height: 120 },
  }

  const current = sizes[size]

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width={current.width}
        height={showContact ? current.height + 30 : current.height}
        viewBox={`0 0 260 ${showContact ? 110 : 80}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm transition-opacity duration-300"
      >
        {/* Brand Name Text Block - Pure Text Branding */}
        {showText && (
          <g transform="translate(0, 45)">
            <text
              x="0"
              y="0"
              style={{ 
                fontFamily: '"Arial Black", "Gadget", sans-serif', 
                fontWeight: 900, 
                fontSize: '52px',
                letterSpacing: '-0.04em'
              }}
            >
              <tspan fill="#C11116">Très</tspan>
              <tspan fill="#005596">Bon</tspan>
            </text>
            <text
              x="2"
              y="28"
              fill="#005596"
              style={{ 
                fontFamily: '"Arial", sans-serif', 
                fontWeight: 800, 
                fontSize: '18px',
                letterSpacing: '0.35em'
              }}
            >
              DRY CLEANERS
            </text>
          </g>
        )}

        {showContact && (
          <g transform="translate(0, 85)">
            <rect width="260" height="22" fill="#005596" rx="4" />
            <text x="130" y="15" textAnchor="middle" fill="white" style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', fontWeight: 700 }}>
              TEL: 0790 002 060 / 0726 230 475
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
