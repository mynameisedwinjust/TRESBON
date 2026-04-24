export function FastServiceIcon({ className }: { className?: string }) {
  const gradientId = "fastGradientUnique"
  
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill={`url(#${gradientId})`} />
      
      {/* Speed lines */}
      <path
        d="M20 50 L35 50 M65 50 L80 50"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Clock face */}
      <circle cx="50" cy="50" r="25" stroke="white" strokeWidth="2.5" fill="none" />
      
      {/* Clock hands - showing fast time */}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="35"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="50"
        x2="60"
        y2="50"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      
      {/* Speed indicator arrow */}
      <path
        d="M70 30 L80 40 L75 40 L75 50 L65 50 L65 40 L70 40 Z"
        fill="white"
      />
      
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
    </svg>
  )
}

