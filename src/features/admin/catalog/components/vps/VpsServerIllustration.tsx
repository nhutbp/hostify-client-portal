export function VpsServerIllustration() {
  return (
    <svg viewBox="0 0 110 78" className="h-[66px] w-[100px]" aria-hidden="true">
      <defs>
        <linearGradient id="vps-server-front" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#075de7" />
          <stop offset="1" stopColor="#083781" />
        </linearGradient>
        <linearGradient id="vps-server-side" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#2d91f8" />
          <stop offset="1" stopColor="#062759" />
        </linearGradient>
      </defs>
      <ellipse cx="56" cy="70" rx="43" ry="5" fill="#b6d2fa" opacity=".55" />
      {[0, 1, 2, 3].map((row) => {
        const y = 7 + row * 15
        return (
          <g key={row}>
            <path
              d={`M14 ${y + 5} 77 ${y - 1} 93 ${y + 4} 30 ${y + 10}Z`}
              fill="#4aa0ff"
              stroke="#1554ac"
              strokeWidth=".7"
            />
            <path
              d={`M14 ${y + 5} 77 ${y - 1} 77 ${y + 12} 14 ${y + 18}Z`}
              fill="url(#vps-server-front)"
              stroke="#113b85"
              strokeWidth="1"
            />
            <path
              d={`M77 ${y - 1} 93 ${y + 4} 93 ${y + 17} 77 ${y + 12}Z`}
              fill="url(#vps-server-side)"
              stroke="#113b85"
              strokeWidth="1"
            />
            <path
              d={`M22 ${y + 10} 56 ${y + 7}`}
              stroke="#75baff"
              strokeWidth="1.4"
              opacity=".8"
            />
            <circle cx="66" cy={y + 7} r="1.8" fill="#4cf0ff" />
            <circle cx="72" cy={y + 6} r="1.3" fill="#9de9ff" />
          </g>
        )
      })}
    </svg>
  )
}
