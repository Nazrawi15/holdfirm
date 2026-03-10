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
    // How much local currency value is lost per second
    // inflationRate is annual percentage e.g. 65 for 65%
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
    <div className="bg-red-900 bg-opacity-40 border border-red-500 rounded-2xl p-6 w-full max-w-md">
      <p className="text-red-400 text-sm font-semibold uppercase tracking-wide">
        Inflation is stealing
      </p>
      <p className="text-white text-3xl font-bold mt-1">
        {currencyCode} {formatted}
      </p>
      <p className="text-red-300 text-sm mt-2">
        Lost since you opened this app — at {inflationRate}% annual inflation
      </p>
      <div className="mt-4 pt-4 border-t border-red-700">
        <p className="text-green-400 text-sm font-semibold">
          HoldFirm is protecting your savings from this
        </p>
      </div>
    </div>
  )
}