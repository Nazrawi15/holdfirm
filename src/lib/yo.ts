import { createApiClient, API_BASE_URL } from '@yo-protocol/core'
import { createPublicClient, http } from 'viem'
import { base } from 'wagmi/chains'

export const apiClient = createApiClient({ baseUrl: API_BASE_URL })

export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})

export const VAULT_ADDRESS = '0x0000000f2eb9f69274678c76222b35eec7588a65' as `0x${string}`
export const NETWORK = 'base' as const