import { useEffect, useState } from 'react'

interface VaultData {
  apy: string
  tvl: string
  loading: boolean
  error: string | null
}

const VAULT_ADDRESS = '0x0000000f2eb9f69274678c76222b35eec7588a65'

export function useYoVault() {
  const [vaultData, setVaultData] = useState<VaultData>({
    apy: '0',
    tvl: '0',
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchVaultData() {
      try {
        const response = await fetch(
          `https://api.yo.xyz/api/v1/vault/base/${VAULT_ADDRESS}`
        )
        const result = await response.json()
        const stats = result.data.stats

        const apy = Number(stats.yield['1d']).toFixed(2)
        const tvl = Number(stats.tvl.formatted).toLocaleString()

        setVaultData({
          apy,
          tvl,
          loading: false,
          error: null,
        })
      } catch (err) {
        setVaultData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load vault data',
        }))
      }
    }

    fetchVaultData()
  }, [])

  return vaultData
}