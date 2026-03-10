import { useEffect, useState } from 'react'
import { getVaultSnapshot } from '@yo-protocol/core'
import { apiClient, VAULT_ADDRESS, NETWORK } from '../lib/yo'

export function useYoVault() {
  const [apy, setApy] = useState('0')
  const [tvl, setTvl] = useState('0')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getVaultSnapshot(apiClient, NETWORK, VAULT_ADDRESS)
      .then(snapshot => {
        const raw = snapshot.stats.yield['1d']
        setApy(raw ? (parseFloat(raw) * 100).toFixed(2) : '0')
        setTvl(snapshot.stats.tvl.formatted)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { apy, tvl, loading }
}