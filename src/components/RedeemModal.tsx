import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'

const VAULT_ADDRESS = '0x0000000f2eb9f69274678c76222b35eec7588a65' as `0x${string}`

const VAULT_ABI = [
  {
    name: 'redeem',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'receiver', type: 'address' },
      { name: 'owner', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

interface RedeemModalProps {
  onClose: () => void
}

export function RedeemModal({ onClose }: RedeemModalProps) {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState('input')

  const { data: sharesBalance } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address },
  })

  const formattedShares = sharesBalance
    ? (Number(sharesBalance) / 1_000_000).toFixed(6)
    : '0.000000'

  const { writeContract, data: redeemTxHash } = useWriteContract()

  const { isSuccess: redeemSuccess } = useWaitForTransactionReceipt({
    hash: redeemTxHash,
  })

  if (redeemSuccess && step === 'redeeming') {
    setStep('done')
  }

  function handleRedeem() {
    if (!amount || Number(amount) <= 0) return
    setStep('redeeming')
    const sharesInUnits = BigInt(Math.floor(Number(amount) * 1_000_000))
    writeContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: 'redeem',
      args: [sharesInUnits, address!, address!],
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-bold">Withdraw Savings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">X</button>
        </div>

        {step === 'input' && (
          <div>
            <p className="text-gray-400 text-sm mb-1">Your yoUSD shares</p>
            <p className="text-green-400 font-bold text-lg mb-4">{formattedShares} yoUSD</p>
            <p className="text-gray-400 text-sm mb-2">Amount to withdraw</p>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.000000"
              className="w-full bg-gray-700 text-white rounded-xl p-4 text-xl mb-4 outline-none"
            />
            <p className="text-gray-500 text-sm mb-6">
              Enter the amount of yoUSD shares to redeem back to USDC
            </p>
            <button
              onClick={handleRedeem}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl text-lg"
            >
              Withdraw
            </button>
          </div>
        )}

        {step === 'redeeming' && (
          <div className="text-center py-8">
            <p className="text-white text-lg">Processing withdrawal...</p>
            <p className="text-gray-400 mt-2">Please confirm in your wallet</p>
            <p className="text-gray-500 text-sm mt-4">This may take a moment</p>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-8">
            <p className="text-4xl mb-4">Done!</p>
            <p className="text-white text-xl font-bold">Withdrawal Successful!</p>
            <p className="text-gray-400 mt-2">Your USDC has been returned to your wallet</p>
            {redeemTxHash && (
              <p className="text-green-400 text-sm mt-4 break-all">
                TX: {redeemTxHash}
              </p>
            )}
            <button
              onClick={onClose}
              className="mt-6 w-full bg-gray-700 text-white font-bold py-4 rounded-xl"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  )
}