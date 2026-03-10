import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { DISCIPLINE_VAULT_ABI, DISCIPLINE_VAULT_ADDRESS, USDC_MAINNET } from '../lib/disciplineVault'

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

export function DisciplineVaultPanel() {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<'idle' | 'approving' | 'depositing' | 'done' | 'withdrawing' | 'withdrawn'>('idle')

  const { writeContract, data: approveTxHash } = useWriteContract()
  const { writeContract: writeDeposit, data: depositTxHash } = useWriteContract()
  const { writeContract: writeWithdraw, data: withdrawTxHash } = useWriteContract()

  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash })
  const { isSuccess: depositSuccess } = useWaitForTransactionReceipt({ hash: depositTxHash })
  const { isSuccess: withdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawTxHash })

  const { data: userShares } = useReadContract({
    address: DISCIPLINE_VAULT_ADDRESS,
    abi: DISCIPLINE_VAULT_ABI,
    functionName: 'getUserShares',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: pendingReward } = useReadContract({
    address: DISCIPLINE_VAULT_ADDRESS,
    abi: DISCIPLINE_VAULT_ABI,
    functionName: 'getPendingReward',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: isLocked } = useReadContract({
    address: DISCIPLINE_VAULT_ADDRESS,
    abi: DISCIPLINE_VAULT_ABI,
    functionName: 'isLocked',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: timeRemaining } = useReadContract({
    address: DISCIPLINE_VAULT_ADDRESS,
    abi: DISCIPLINE_VAULT_ABI,
    functionName: 'getTimeRemaining',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: depositorCount } = useReadContract({
    address: DISCIPLINE_VAULT_ADDRESS,
    abi: DISCIPLINE_VAULT_ABI,
    functionName: 'getDepositorCount',
  })

  if (approveSuccess && step === 'approving') {
    setStep('depositing')
    const amountInUnits = BigInt(Math.floor(Number(amount) * 1_000_000))
    writeDeposit({
      address: DISCIPLINE_VAULT_ADDRESS,
      abi: DISCIPLINE_VAULT_ABI,
      functionName: 'deposit',
      args: [amountInUnits],
    })
  }

  if (depositSuccess && step === 'depositing') setStep('done')
  if (withdrawSuccess && step === 'withdrawing') setStep('withdrawn')

  function handleDeposit() {
    if (!amount || Number(amount) <= 0) return
    setStep('approving')
    const amountInUnits = BigInt(Math.floor(Number(amount) * 1_000_000))
    writeContract({
      address: USDC_MAINNET,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [DISCIPLINE_VAULT_ADDRESS, amountInUnits],
    })
  }

  function handleWithdraw() {
    if (!userShares || userShares === BigInt(0)) return
    setStep('withdrawing')
    writeWithdraw({
      address: DISCIPLINE_VAULT_ADDRESS,
      abi: DISCIPLINE_VAULT_ABI,
      functionName: 'withdraw',
      args: [userShares],
    })
  }

  const sharesFormatted = userShares ? (Number(userShares) / 1e6).toFixed(6) : '0'
  const rewardFormatted = pendingReward ? (Number(pendingReward) / 1e6).toFixed(6) : '0'
  const daysRemaining = timeRemaining ? Math.ceil(Number(timeRemaining) / 86400) : 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '20px', margin: 0 }}>
            🏦 DisciplineVault
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: '4px 0 0 0' }}>
            Lock savings. Earn from impatient users. Onchain.
          </p>
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '8px 14px', textAlign: 'center' }}>
          <div style={{ color: '#15803d', fontWeight: 800, fontSize: '15px' }}>{depositorCount?.toString() ?? '0'}</div>
          <div style={{ color: '#9ca3af', fontSize: '11px' }}>SAVERS</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
        <p style={{ color: '#92400e', fontSize: '13px', fontWeight: 600, margin: '0 0 6px 0' }}>⚡ How DisciplineVault works</p>
        <p style={{ color: '#92400e', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
          Lock your USDC for 30 days. If someone withdraws early, they pay a 5% penalty.
          That penalty is distributed to everyone who stayed locked.
          <strong> Patience pays.</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 600, margin: '0 0 4px 0' }}>YOUR SHARES</p>
          <p style={{ color: '#111827', fontSize: '18px', fontWeight: 800, margin: 0 }}>{sharesFormatted}</p>
        </div>
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 600, margin: '0 0 4px 0' }}>PENALTY REWARDS</p>
          <p style={{ color: '#15803d', fontSize: '18px', fontWeight: 800, margin: 0 }}>{rewardFormatted}</p>
        </div>
        <div style={{ backgroundColor: isLocked ? '#eff6ff' : '#f9fafb', border: `1px solid ${isLocked ? '#bfdbfe' : '#f3f4f6'}`, borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 600, margin: '0 0 4px 0' }}>DAYS LEFT</p>
          <p style={{ color: isLocked ? '#3b82f6' : '#111827', fontSize: '18px', fontWeight: 800, margin: 0 }}>
            {isLocked ? daysRemaining : '—'}
          </p>
        </div>
      </div>

      {step === 'idle' && (
        <div>
          <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, margin: '0 0 8px 0' }}>DEPOSIT USDC (BASE MAINNET)</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.01"
              style={{ flex: 1, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '10px', padding: '12px', fontSize: '15px', outline: 'none' }}
            />
            <button
              onClick={handleDeposit}
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', fontWeight: 700, fontSize: '14px', padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
            >
              Lock & Deposit
            </button>
          </div>
          {userShares && userShares > BigInt(0) && (
            <button
              onClick={handleWithdraw}
              style={{ marginTop: '10px', width: '100%', backgroundColor: isLocked ? '#fef2f2' : '#f0fdf4', border: `1px solid ${isLocked ? '#fecaca' : '#bbf7d0'}`, color: isLocked ? '#dc2626' : '#15803d', fontWeight: 700, fontSize: '14px', padding: '12px', borderRadius: '10px', cursor: 'pointer' }}
            >
              {isLocked ? `⚠️ Withdraw Early (5% penalty → community)` : `✅ Withdraw (no penalty)`}
            </button>
          )}
        </div>
      )}

      {step === 'approving' && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: '#111827', fontWeight: 700 }}>Step 1 of 2 — Approving USDC...</p>
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>Confirm in your wallet</p>
        </div>
      )}

      {step === 'depositing' && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: '#111827', fontWeight: 700 }}>Step 2 of 2 — Depositing to DisciplineVault...</p>
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>Confirm in your wallet</p>
        </div>
      )}

      {step === 'done' && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>🔒</p>
          <p style={{ color: '#15803d', fontWeight: 800, fontSize: '18px', margin: '0 0 4px 0' }}>Locked & Earning!</p>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 12px 0' }}>Your USDC is locked for 30 days. You'll earn from anyone who withdraws early.</p>
          {depositTxHash && (
            <a href={`https://basescan.org/tx/${depositTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: '13px' }}>
              View on Basescan →
            </a>
          )}
          <button onClick={() => { setStep('idle'); setAmount('') }} style={{ marginTop: '12px', width: '100%', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151', fontWeight: 600, fontSize: '14px', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}>
            Done
          </button>
        </div>
      )}

      {step === 'withdrawing' && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: '#111827', fontWeight: 700 }}>Withdrawing...</p>
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>Confirm in your wallet</p>
        </div>
      )}

      {step === 'withdrawn' && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>✅</p>
          <p style={{ color: '#15803d', fontWeight: 800, fontSize: '18px', margin: '0 0 12px 0' }}>Withdrawn successfully!</p>
          {withdrawTxHash && (
            <a href={`https://basescan.org/tx/${withdrawTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: '13px' }}>
              View on Basescan →
            </a>
          )}
          <button onClick={() => setStep('idle')} style={{ marginTop: '12px', width: '100%', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151', fontWeight: 600, fontSize: '14px', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}>
            Done
          </button>
        </div>
      )}
    </div>
  )
}