import { createApiClient, API_BASE_URL } from '@yo-protocol/core'
import { createPublicClient, http } from 'viem'
import { base } from 'wagmi/chains'

export const apiClient = createApiClient({ baseUrl: API_BASE_URL })

export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})

export const NETWORK = 'base' as const

// ── Vault registry ────────────────────────────────────────────────────────────
export const VAULTS = {
  yoUSD: {
    address: '0x0000000f2eb9f69274678c76222b35eec7588a65' as `0x${string}`,
    asset: 'USDC',
    symbol: 'yoUSD',
    label: 'Dollar Savings',
    flag: '💵',
    color: '#15803d',
    decimals: 6,
    description: 'Save in US dollars. Best for users in Turkey, Nigeria, Argentina and other high-inflation economies.',
  },
  yoEUR: {
    address: '0x50c749ae210d3977adc824ae11f3c7fd10c871e9' as `0x${string}`,
    asset: 'EURC',
    symbol: 'yoEUR',
    label: 'Euro Savings',
    flag: '💶',
    color: '#1d4ed8',
    decimals: 6,
    description: 'Save in euros. Best for users in Romania, Ukraine, Georgia and Eastern European countries.',
  },
} as const

export type VaultKey = keyof typeof VAULTS

// Keep backward-compat export for existing code that imports VAULT_ADDRESS
export const VAULT_ADDRESS = VAULTS.yoUSD.address