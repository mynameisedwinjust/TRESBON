export function FreeDeliveryIcon({ className }: { className?: string }) {
  const gradientId = "deliveryGradientUnique"
  
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill={`url(#${gradientId})`} />
      
      {/* Delivery truck body */}
      <rect x="25" y="45" width="35" height="20" rx="2" fill="white" />
      
      {/* Truck cabin */}
      <rect x="50" y="40" width="15" height="15" rx="2" fill="white" />
      
      {/* Truck window */}
      <rect x="52" y="42" width="11" height="8" rx="1" fill={`url(#${gradientId})`} />
      
      {/* Wheels */}
      <circle cx="35" cy="70" r="6" fill="#1e293b" />
      <circle cx="35" cy="70" r="3.5" fill="white" />
      <circle cx="55" cy="70" r="6" fill="#1e293b" />
      <circle cx="55" cy="70" r="3.5" fill="white" />
      
      {/* Package/box on truck */}
      <rect x="28" y="42" width="12" height="10" rx="1" fill="white" stroke={`url(#${gradientId})`} strokeWidth="1.5" />
      <line x1="34" y1="42" x2="34" y2="52" stroke={`url(#${gradientId})`} strokeWidth="1.5" />
      <line x1="28" y1="47" x2="40" y2="47" stroke={`url(#${gradientId})`} strokeWidth="1.5" />
      
      {/* Free badge */}
      <circle cx="70" cy="30" r="12" fill="#10b981" />
      <text x="70" y="35" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">FREE</text>
      
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
    </svg>
  )
}

