import { useAccount, useReadContract } from 'wagmi'

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const

export function useUSDCBalance() {
  const { address } = useAccount()

  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address },
  })

  const formatted = balance
    ? (Number(balance) / 1_000_000).toFixed(2)
    : '0.00'

  return { formatted }
}