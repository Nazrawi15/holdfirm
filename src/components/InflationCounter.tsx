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
    <div style={{
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '24px',
      padding: '24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          animation: 'pulse 1s infinite',
        }} />
        <p style={{
          color: '#ef4444',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          Inflation is stealing
        </p>
      </div>

      <p style={{
        color: 'white',
        fontSize: '36px',
        fontWeight: 800,
        marginBottom: '4px',
        letterSpacing: '-1px',
      }}>
        {currencyCode} {formatted}
      </p>

      <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
        Lost since you opened this app — at {inflationRate}% annual inflation
      </p>

      <div style={{
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        border: '1px solid rgba(34, 197, 94, 0.15)',
        borderRadius: '12px',
        padding: '12px',
      }}>
        <p style={{ color: '#22c55e', fontSize: '13px', fontWeight: 600 }}>
          🔒 HoldFirm is protecting your savings from this
        </p>
      </div>
    </div>
  )
}