import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`
const VAULT_ADDRESS = '0x0000000f2eb9f69274678c76222b35eec7588a65' as `0x${string}`

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

const VAULT_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

interface DepositModalProps {
  onClose: () => void
}

export function DepositModal({ onClose }: DepositModalProps) {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState('input')

  const { writeContract, data: approveTxHash } = useWriteContract()
  const { writeContract: writeDeposit, data: depositTxHash } = useWriteContract()

  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  })

  const { isSuccess: depositSuccess } = useWaitForTransactionReceipt({
    hash: depositTxHash,
  })

  if (approveSuccess && step === 'approving') {
    setStep('depositing')
    const amountInUnits = BigInt(Math.floor(Number(amount) * 1_000_000))
    writeDeposit({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: 'deposit',
      args: [amountInUnits, address!],
    })
  }

  if (depositSuccess && step === 'depositing') {
    setStep('done')
  }

  function handleDeposit() {
    if (!amount || Number(amount) <= 0) return
    setStep('approving')
    const amountInUnits = BigInt(Math.floor(Number(amount) * 1_000_000))
    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [VAULT_ADDRESS, amountInUnits],
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-bold">Deposit USDC</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">X</button>
        </div>

        {step === 'input' && (
          <div>
            <p className="text-gray-400 text-sm mb-2">Amount to deposit</p>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-700 text-white rounded-xl p-4 text-xl mb-4 outline-none"
            />
            <p className="text-gray-500 text-sm mb-6">
              You will earn <span className="text-green-400 font-bold">4.86% APY</span> on your deposit
            </p>
            <button
              onClick={handleDeposit}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-lg"
            >
              Deposit
            </button>
          </div>
        )}

        {step === 'approving' && (
          <div className="text-center py-8">
            <p className="text-white text-lg">Step 1 of 2</p>
            <p className="text-gray-400 mt-2">Approving USDC spending...</p>
            <p className="text-gray-500 text-sm mt-4">Please confirm in your wallet</p>
          </div>
        )}

        {step === 'depositing' && (
          <div className="text-center py-8">
            <p className="text-white text-lg">Step 2 of 2</p>
            <p className="text-gray-400 mt-2">Depositing into YO vault...</p>
            <p className="text-gray-500 text-sm mt-4">Please confirm in your wallet</p>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-8">
            <p className="text-4xl mb-4">Done!</p>
            <p className="text-white text-xl font-bold">Deposit Successful!</p>
            <p className="text-gray-400 mt-2">Your USDC is now earning yield</p>
            {depositTxHash && (
              <p className="text-green-400 text-sm mt-4 break-all">
                TX: {depositTxHash}
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