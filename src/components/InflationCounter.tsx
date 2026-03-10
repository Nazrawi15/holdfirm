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
    <div style={{ height: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '10px',
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#dc2626',
          flexShrink: 0,
        }} />
        <p style={{
          color: '#dc2626',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: 0,
        }}>
          Inflation is stealing
        </p>
      </div>

      <p style={{
        color: '#111827',
        fontSize: '28px',
        fontWeight: 800,
        margin: '0 0 4px 0',
        letterSpacing: '-1px',
      }}>
        {currencyCode} {formatted}
      </p>

      <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 14px 0' }}>
        Lost since you opened this app — at {inflationRate}% annual inflation
      </p>

      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '10px',
        padding: '10px 12px',
      }}>
        <p style={{ color: '#15803d', fontSize: '13px', fontWeight: 600, margin: 0 }}>
          🔒 HoldFirm is protecting your savings from this
        </p>
      </div>
    </div>
  )
}