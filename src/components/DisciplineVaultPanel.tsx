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

function ProjectedEarnings({ amount, lockDays, apy }: { amount: string; lockDays: number; apy: number }) {
  const deposit = parseFloat(amount) || 0
  if (deposit <= 0) return null

  const years = lockDays / 365
  const baseYield = deposit * (apy / 100) * years
  const penaltyLow = deposit * 0.01 * years
  const penaltyMed = deposit * 0.04 * years
  const penaltyHigh = deposit * 0.08 * years

  const apyLow = (apy + 1).toFixed(1)
  const apyMed = (apy + 4).toFixed(1)
  const apyHigh = (apy + 8).toFixed(1)

  return (
    <div style={{
      backgroundColor: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
    }}>
      <p style={{ color: '#15803d', fontSize: '12px', fontWeight: 700, margin: '0 0 12px 0', letterSpacing: '0.5px' }}>
        📊 PROJECTED EARNINGS FOR {lockDays} DAYS
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#374151', fontSize: '13px' }}>💵 Deposit</span>
          <span style={{ color: '#111827', fontWeight: 700, fontSize: '13px' }}>${deposit.toFixed(2)} USDC</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#374151', fontSize: '13px' }}>📈 Base YO yield ({apy}% APY)</span>
          <span style={{ color: '#15803d', fontWeight: 700, fontSize: '13px' }}>+${baseYield.toFixed(4)}</span>
        </div>

        <div style={{ borderTop: '1px dashed #bbf7d0', paddingTop: '8px', marginTop: '2px' }}>
          <p style={{ color: '#6b7280', fontSize: '11px', fontWeight: 600, margin: '0 0 6px 0' }}>PENALTY REWARDS (from early withdrawers)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: '🟡 Low activity', value: penaltyLow, apy: apyLow },
              { label: '🟠 Medium activity', value: penaltyMed, apy: apyMed },
              { label: '🔴 High activity', value: penaltyHigh, apy: apyHigh },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>{row.label}</span>
                <span style={{ color: '#15803d', fontSize: '12px', fontWeight: 600 }}>+${row.value.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #bbf7d0', paddingTop: '8px', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#15803d', fontSize: '13px', fontWeight: 700 }}>🎯 Estimated APY range</span>
          <span style={{ color: '#15803d', fontSize: '15px', fontWeight: 800 }}>{apyLow}% → {apyHigh}%</span>
        </div>
      </div>
    </div>
  )
}

export function DisciplineVaultPanel() {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const [lockDays, setLockDays] = useState<30 | 60 | 90>(30)
  const [step, setStep] = useState<'idle' | 'approving' | 'depositing' | 'done' | 'withdrawing' | 'withdrawn' | 'claiming' | 'claimed'>('idle')

  const { writeContract, data: approveTxHash } = useWriteContract()
  const { writeContract: writeDeposit, data: depositTxHash } = useWriteContract()
  const { writeContract: writeWithdraw, data: withdrawTxHash } = useWriteContract()
  const { writeContract: writeClaim, data: claimTxHash } = useWriteContract()

  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash })
  const { isSuccess: depositSuccess } = useWaitForTransactionReceipt({ hash: depositTxHash })
  const { isSuccess: withdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawTxHash })
  const { isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: claimTxHash })

  const { data: userShares, refetch: refetchShares } = useReadContract({
    address: DISCIPLINE_VAULT_ADDRESS,
    abi: DISCIPLINE_VAULT_ABI,
    functionName: 'getUserShares',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: pendingReward, refetch: refetchReward } = useReadContract({
    address: DISCIPLINE_VAULT_ADDRESS,
    abi: DISCIPLINE_VAULT_ABI,
    functionName: 'getPendingReward',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: totalEarned } = useReadContract({
    address: DISCIPLINE_VAULT_ADDRESS,
    abi: DISCIPLINE_VAULT_ABI,
    functionName: 'getTotalEarnedFromPenalties',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: userLockPeriod } = useReadContract({
    address: DISCIPLINE_VAULT_ADDRESS,
    abi: DISCIPLINE_VAULT_ABI,
    functionName: 'getUserLockPeriod',
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

  const { data: totalPenaltyCollected } = useReadContract({
    address: DISCIPLINE_VAULT_ADDRESS,
    abi: DISCIPLINE_VAULT_ABI,
    functionName: 'totalPenaltyCollected',
  })

  if (approveSuccess && step === 'approving') {
    setStep('depositing')
    const amountInUnits = BigInt(Math.floor(Number(amount) * 1_000_000))
    writeDeposit({
      address: DISCIPLINE_VAULT_ADDRESS,
      abi: DISCIPLINE_VAULT_ABI,
      functionName: 'deposit',
      args: [amountInUnits, BigInt(lockDays)],
    })
  }

  if (depositSuccess && step === 'depositing') {
    setStep('done')
    refetchShares()
    refetchReward()
  }

  if (withdrawSuccess && step === 'withdrawing') setStep('withdrawn')
  if (claimSuccess && step === 'claiming') {
    setStep('claimed')
    refetchReward()
  }

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

  function handleClaim() {
    setStep('claiming')
    writeClaim({
      address: DISCIPLINE_VAULT_ADDRESS,
      abi: DISCIPLINE_VAULT_ABI,
      functionName: 'claimRewards',
      args: [],
    })
  }

  const sharesFormatted = userShares ? (Number(userShares) / 1e6).toFixed(4) : '0'
  const pendingFormatted = pendingReward ? (Number(pendingReward) / 1e6).toFixed(6) : '0.000000'
  const totalEarnedFormatted = totalEarned ? (Number(totalEarned) / 1e6).toFixed(4) : '0'
  const totalPenaltyFormatted = totalPenaltyCollected ? (Number(totalPenaltyCollected) / 1e6).toFixed(4) : '0'
  const daysRemaining = timeRemaining ? Math.ceil(Number(timeRemaining) / 86400) : 0
  const hasPendingReward = pendingReward && pendingReward > BigInt(0)
  const hasShares = userShares && userShares > BigInt(0)

  const lockOptions: { days: 30 | 60 | 90; label: string; bonus: string }[] = [
    { days: 30, label: '30 days', bonus: 'Standard' },
    { days: 60, label: '60 days', bonus: 'More rewards' },
    { days: 90, label: '90 days', bonus: 'Max rewards' },
  ]

  return (
    <div>
      {/* Header */}
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

      {/* How it works */}
      <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
        <p style={{ color: '#92400e', fontSize: '13px', fontWeight: 600, margin: '0 0 6px 0' }}>⚡ How DisciplineVault works</p>
        <p style={{ color: '#92400e', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
          Lock your USDC for 30, 60, or 90 days. If someone withdraws early, they pay a <strong>4.5% penalty</strong>.
          That penalty is distributed to everyone who stayed locked. <strong>Patience pays.</strong>
        </p>
      </div>

      {/* Penalty pool */}
      <div style={{ backgroundColor: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#7e22ce', fontSize: '12px', fontWeight: 600, margin: '0 0 2px 0' }}>TOTAL PENALTY POOL COLLECTED</p>
          <p style={{ color: '#111827', fontSize: '20px', fontWeight: 800, margin: 0 }}>{totalPenaltyFormatted} <span style={{ fontSize: '13px', color: '#9ca3af' }}>yoUSD shares</span></p>
        </div>
        <div style={{ fontSize: '28px' }}>💸</div>
      </div>

      {/* User stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '10px', fontWeight: 600, margin: '0 0 4px 0' }}>YOUR SHARES</p>
          <p style={{ color: '#111827', fontSize: '16px', fontWeight: 800, margin: 0 }}>{sharesFormatted}</p>
        </div>
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '10px', fontWeight: 600, margin: '0 0 4px 0' }}>PENDING REWARDS</p>
          <p style={{ color: '#15803d', fontSize: '16px', fontWeight: 800, margin: 0 }}>{pendingFormatted}</p>
        </div>
        <div style={{ backgroundColor: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '10px', fontWeight: 600, margin: '0 0 4px 0' }}>TOTAL EARNED</p>
          <p style={{ color: '#7e22ce', fontSize: '16px', fontWeight: 800, margin: 0 }}>{totalEarnedFormatted}</p>
        </div>
        <div style={{ backgroundColor: isLocked ? '#eff6ff' : '#f9fafb', border: `1px solid ${isLocked ? '#bfdbfe' : '#f3f4f6'}`, borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '10px', fontWeight: 600, margin: '0 0 4px 0' }}>DAYS LEFT</p>
          <p style={{ color: isLocked ? '#3b82f6' : '#111827', fontSize: '16px', fontWeight: 800, margin: 0 }}>
            {hasShares ? (isLocked ? daysRemaining : '✅ Free') : '—'}
          </p>
        </div>
      </div>

      {/* Lock period info */}
      {hasShares && userLockPeriod && (
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#1d4ed8', fontSize: '13px', fontWeight: 600 }}>
            🔒 Your lock period: {userLockPeriod.toString()} days
          </span>
          {isLocked && (
            <span style={{ color: '#6b7280', fontSize: '12px' }}>
              {daysRemaining} days remaining
            </span>
          )}
        </div>
      )}

      {/* Claim rewards */}
      {hasPendingReward && step === 'idle' && (
        <button
          onClick={handleClaim}
          style={{ width: '100%', marginBottom: '16px', background: 'linear-gradient(135deg, #a855f7, #7e22ce)', color: 'white', fontWeight: 700, fontSize: '14px', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
        >
          🎁 Claim {pendingFormatted} yoUSD from impatient users
        </button>
      )}

      {/* Main actions */}
      {step === 'idle' && (
        <div>
          <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, margin: '0 0 8px 0' }}>CHOOSE LOCK PERIOD</p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {lockOptions.map(opt => (
              <button
                key={opt.days}
                onClick={() => setLockDays(opt.days)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  backgroundColor: lockDays === opt.days ? '#111827' : '#f3f4f6',
                  color: lockDays === opt.days ? 'white' : '#6b7280',
                  fontWeight: 700, fontSize: '13px', transition: 'all 0.15s',
                }}
              >
                <div>{opt.label}</div>
                <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>{opt.bonus}</div>
              </button>
            ))}
          </div>

          <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, margin: '0 0 8px 0' }}>DEPOSIT USDC (BASE MAINNET)</p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.01"
              style={{ flex: 1, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '10px', padding: '12px', fontSize: '15px', outline: 'none' }}
            />
            <button
              onClick={handleDeposit}
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', fontWeight: 700, fontSize: '14px', padding: '12px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
            >
              🔒 Lock & Deposit
            </button>
          </div>

          {/* Projected Earnings */}
          <ProjectedEarnings amount={amount} lockDays={lockDays} apy={4.92} />

          {hasShares && (
            <button
              onClick={handleWithdraw}
              style={{ marginTop: '4px', width: '100%', backgroundColor: isLocked ? '#fef2f2' : '#f0fdf4', border: `1px solid ${isLocked ? '#fecaca' : '#bbf7d0'}`, color: isLocked ? '#dc2626' : '#15803d', fontWeight: 700, fontSize: '14px', padding: '12px', borderRadius: '10px', cursor: 'pointer' }}
            >
              {isLocked ? `⚠️ Withdraw Early (4.5% penalty → community)` : `✅ Withdraw (no penalty)`}
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
          <p style={{ color: '#111827', fontWeight: 700 }}>Step 2 of 2 — Locking in DisciplineVault...</p>
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>Confirm in your wallet</p>
        </div>
      )}

      {step === 'done' && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>🔒</p>
          <p style={{ color: '#15803d', fontWeight: 800, fontSize: '18px', margin: '0 0 4px 0' }}>Locked for {lockDays} days!</p>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 12px 0' }}>
            Your USDC is earning yield + you'll receive 4.5% from anyone who withdraws early.
          </p>
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

      {step === 'claiming' && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: '#111827', fontWeight: 700 }}>Claiming rewards...</p>
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>Confirm in your wallet</p>
        </div>
      )}

      {step === 'claimed' && (
        <div style={{ backgroundColor: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>🎁</p>
          <p style={{ color: '#7e22ce', fontWeight: 800, fontSize: '18px', margin: '0 0 12px 0' }}>Rewards claimed!</p>
          {claimTxHash && (
            <a href={`https://basescan.org/tx/${claimTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: '13px' }}>
              View on Basescan →
            </a>
          )}
          <button onClick={() => setStep('idle')} style={{ marginTop: '12px', width: '100%', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151', fontWeight: 600, fontSize: '14px', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}>
            Done
          </button>
        </div>
      )}

      {/* Trust & Transparency */}
      <div style={{ marginTop: '24px', backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
        <p style={{ color: '#374151', fontSize: '13px', fontWeight: 700, margin: '0 0 12px 0' }}>🔍 Where do your funds go?</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'Your Wallet', color: '#3b82f6', bg: '#eff6ff' },
            { label: '→', color: '#9ca3af', bg: 'transparent' },
            { label: 'DisciplineVault', color: '#7e22ce', bg: '#fdf4ff' },
            { label: '→', color: '#9ca3af', bg: 'transparent' },
            { label: 'YO Vault', color: '#15803d', bg: '#f0fdf4' },
            { label: '→', color: '#9ca3af', bg: 'transparent' },
            { label: 'yoUSD Yield', color: '#d97706', bg: '#fffbeb' },
          ].map((item, i) => (
            <span key={i} style={{
              backgroundColor: item.bg,
              color: item.color,
              fontSize: '12px',
              fontWeight: 600,
              padding: item.label === '→' ? '0' : '4px 10px',
              borderRadius: '6px',
            }}>
              {item.label}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
          <a href="https://basescan.org/address/0x85E535Af5663426D38461B2e74d34FafA8a7472a" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>
            🔗 DisciplineVault contract on Basescan →
          </a>
          <a href="https://basescan.org/address/0x0000000f2eb9f69274678c76222b35eec7588a65" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>
            🔗 YO Protocol vault on Basescan →
          </a>
          <a href="https://basescan.org/tx/0xba6c889a70eed58fe7c6440e77804f2ad2824503868745f19576261d36e52b9f" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>
            ✅ Proof of real deposit transaction →
          </a>
        </div>
        <div style={{ marginTop: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px' }}>
          <p style={{ color: '#92400e', fontSize: '12px', margin: 0, lineHeight: 1.6 }}>
            ⚠️ <strong>Risk disclosure:</strong> HoldFirm is non-custodial. Your funds are held by smart contracts, not by us.
            DisciplineVault is unaudited — only deposit what you can afford to lose.
            YO Protocol vault risk applies. Early withdrawal incurs a 4.5% penalty redistributed to other savers.
          </p>
        </div>
      </div>
    </div>
  )
}