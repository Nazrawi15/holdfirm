import { useVaultHistory as useYoVaultHistory } from '@yo-protocol/react'
import { VAULTS } from '../lib/yo'
import type { VaultKey } from '../lib/yo'

export interface APYDataPoint {
  date: string
  apy: number
}

export function useVaultHistory(vaultKey: VaultKey = 'yoUSD') {
  const vault = VAULTS[vaultKey]

  const { yieldHistory, isLoading } = useYoVaultHistory(vault.address)

  const points: APYDataPoint[] = yieldHistory
    ? yieldHistory
        .slice(-30)
        .map((point: any) => {
          const date = new Date(
            point.timestamp < 1e12
              ? point.timestamp * 1000
              : point.timestamp
          )

          // Value comes in as decimal (e.g. 0.0478) — multiply by 100 for %
          const rawValue = parseFloat(point.value)
          const apy = rawValue < 1
            ? parseFloat((rawValue * 100).toFixed(2))   // decimal → percent
            : parseFloat(rawValue.toFixed(2))            // already a percent

          return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            apy,
          }
        })
        .filter(p => p.apy > 0)
    : []

  return { data: points, loading: isLoading }
}