export function ExpertCareIcon({ className }: { className?: string }) {
  const gradientId = "expertGradientUnique"
  
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill={`url(#${gradientId})`} />
      
      {/* Professional cap/top */}
      <path
        d="M30 40 Q50 25 70 40 L65 45 Q50 35 35 45 Z"
        fill="white"
      />
      
      {/* Cap tassel */}
      <circle cx="50" cy="32" r="2" fill="#fbbf24" />
      <line x1="50" y1="32" x2="50" y2="38" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Certificate/scroll body */}
      <rect x="30" y="50" width="40" height="25" rx="2" fill="white" />
      
      {/* Certificate lines */}
      <line x1="35" y1="58" x2="60" y2="58" stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="35" y1="63" x2="55" y2="63" stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="35" y1="68" x2="50" y2="68" stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Star badge */}
      <path
        d="M65 55 L67 60 L72 60 L68 63 L69.5 68 L65 65 L60.5 68 L62 63 L58 60 L63 60 Z"
        fill="#fbbf24"
      />
      
      {/* Ribbon ends */}
      <path d="M30 50 L25 48 L30 46 Z" fill="#fbbf24" />
      <path d="M70 50 L75 48 L70 46 Z" fill="#fbbf24" />
      
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  )
}

