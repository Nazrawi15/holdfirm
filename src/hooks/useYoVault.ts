import { useEffect, useState } from 'react'
import { getVaultSnapshot } from '@yo-protocol/core'
import { apiClient, VAULTS, NETWORK } from '../lib/yo'
import type { VaultKey } from '../lib/yo'

interface VaultData {
  apy: string
  tvl: string
  loading: boolean
}

export function useYoVault(vaultKey: VaultKey = 'yoUSD'): VaultData {
  const [apy, setApy] = useState('0')
  const [tvl, setTvl] = useState('0')
  const [loading, setLoading] = useState(true)

  const vault = VAULTS[vaultKey]

  useEffect(() => {
    setLoading(true)
    setApy('0')
    setTvl('0')

    getVaultSnapshot(apiClient, NETWORK, vault.address)
      .then(snapshot => {
        const raw = snapshot.stats.yield['1d']
        setApy(raw ? parseFloat(raw).toFixed(2) : '0')
        setTvl(
          parseFloat(snapshot.stats.tvl.formatted).toLocaleString('en-US', {
            maximumFractionDigits: 0,
          })
        )
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [vaultKey])

  return { apy, tvl, loading }
}

// ── Fetch both vaults at once (used in dashboard overview) ───────────────────
export function useAllVaults() {
  const usd = useYoVault('yoUSD')
  const eur = useYoVault('yoEUR')
  return { yoUSD: usd, yoEUR: eur }
}