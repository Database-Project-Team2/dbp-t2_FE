import { useId } from 'react'

export function BrandNetwork({ className = '' }: { className?: string }) {
  const id = useId().replaceAll(':', '')
  return (
    <svg
      className={`block shrink-0 overflow-visible ${className}`}
      viewBox="0 0 360 240"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-red`}
          x1="145"
          y1="70"
          x2="220"
          y2="172"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fa4458" />
          <stop offset="1" stopColor="#d80023" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#a91430" floodOpacity=".13" />
        </filter>
      </defs>
      <path d="M180 15 272 68v106l-92 53-92-53V68Z" stroke="#ebcbd1" strokeDasharray="3 6" />
      <path d="m180 49 63 36v73l-63 36-63-36V85Z" fill="#fff" fillOpacity=".45" stroke="#f1d9de" />
      <path
        d="m101 75 45 27m68 36 42 26m-80-6-34 43m70-101 50-35"
        stroke="#e7b5bf"
        strokeWidth="1.5"
      />
      <g filter={`url(#${id}-shadow)`}>
        <path d="m180 67 46 27v54l-46 27-46-27V94Z" fill={`url(#${id}-red)`} />
        <path
          d="m180 95 22 13v26l-22 13-22-13v-26Z"
          stroke="white"
          strokeWidth="9"
          strokeLinejoin="round"
        />
        <rect x="61" y="42" width="62" height="62" rx="18" fill="white" stroke="#f4e4e7" />
        <path
          d="M78 64h10l4 4h15v21H78Z"
          stroke="#df1735"
          strokeWidth="2.3"
          strokeLinejoin="round"
          transform="translate(0 -4)"
        />
        <rect x="245" y="132" width="66" height="66" rx="20" fill="white" stroke="#f4e4e7" />
        <circle cx="273" cy="157" r="6" stroke="#df1735" strokeWidth="2.3" />
        <path
          d="M261 181v-5a12 12 0 0 1 24 0v5m0-29a5 5 0 0 1 0 10m5 7a10 10 0 0 1 6 9"
          stroke="#df1735"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
        <rect x="116" y="187" width="41" height="41" rx="14" fill="white" stroke="#f4e4e7" />
        <path
          d="m128 207 6 6 11-13"
          stroke="#d91b38"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <circle cx="264" cy="61" r="7" fill="#ed2441" />
      <circle cx="49" cy="154" r="4" fill="#e9b0bb" />
      <circle cx="315" cy="98" r="3" fill="#d8d8de" />
    </svg>
  )
}
