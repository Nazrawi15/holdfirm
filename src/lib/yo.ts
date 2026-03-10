import { YoClient } from '@yo-protocol/core'
import { createPublicClient, http } from 'viem'
import { base } from 'wagmi/chains'

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})

export const yoClient = new YoClient({
  publicClients: { [base.id]: publicClient },
  chain: base,
})

export const VAULT_ADDRESS = '0x0000000f2eb9f69274678c76222b35eec7588a65' as `0x${string}`