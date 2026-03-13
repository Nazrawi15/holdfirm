import { useEffect, useState } from 'react'

interface InflationCounterProps {
  usdcBalance: number
  inflationRate: number
  currencyCode: string
  currencyRate: number
}

export function InflationCounter({
  usdcBalance,
  inflationRate,
  currencyCode,
  currencyRate,
}: InflationCounterProps) {
  const [lostAmount, setLostAmount] = useState(0)

  useEffect(() => {
    setLostAmount(0)
    const annualLossRate = inflationRate / 100
    const perSecondLoss = annualLossRate / (365 * 24 * 60 * 60)
    const balanceInLocal = usdcBalance * currencyRate

    const interval = setInterval(() => {
      setLostAmount(prev => prev + balanceInLocal * perSecondLoss)
    }, 1000)

    return () => clearInterval(interval)
  }, [usdcBalance, inflationRate, currencyRate])

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(lostAmount)

  return (
    <div style={{ height: '100%', fontFamily: 'Inter, sans-serif' }}>

      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        {/* Pulsing red dot */}
        <div style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            backgroundColor: '#fca5a5', animation: 'hf-pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 1, borderRadius: '50%',
            backgroundColor: '#dc2626',
          }} />
        </div>
        <p style={{
          fontSize: '0.6875rem', fontWeight: 700, color: '#dc2626',
          textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0,
        }}>
          Inflation stealing right now
        </p>
      </div>

      {/* Ticking number */}
      <p style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '1.625rem',
        fontWeight: 700,
        color: '#111827',
        letterSpacing: '-0.5px',
        margin: '0 0 4px 0',
        lineHeight: 1.1,
      }}>
        − {currencyCode} {formatted}
      </p>

      {/* Subtitle */}
      <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '0 0 14px 0', lineHeight: 1.5 }}>
        Lost since you opened this page · {inflationRate}% annual inflation
      </p>

      {/* Protection badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 10,
        padding: '9px 12px',
      }}>
        <span style={{ fontSize: '0.875rem', flexShrink: 0 }}>🔒</span>
        <p style={{ color: '#15803d', fontSize: '0.75rem', fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
          HoldFirm is protecting your savings from this
        </p>
      </div>

      {/* Pulse keyframe */}
      <style>{`
        @keyframes hf-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
