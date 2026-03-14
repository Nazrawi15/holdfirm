import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { DISCIPLINE_VAULT_ABI, DISCIPLINE_VAULT_ADDRESS, USDC_MAINNET } from '../lib/disciplineVault'

const ERC20_ABI = [
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
] as const

const s = {
  label: { fontSize: '11px', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.85)', marginBottom: '6px' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px' },
  divider: { height: '1px', background: 'rgba(255,255,255,0.07)', margin: '20px 0' },
}

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
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Projected earnings · {lockDays} days</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80', fontFamily: 'Inter, sans-serif' }}>{apyLow}% – {apyHigh}% APY</span>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>Deposit</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>${deposit.toFixed(2)} USDC</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>Base YO yield ({apy}% APY)</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#4ade80', fontFamily: 'Inter, sans-serif' }}>+${baseYield.toFixed(4)}</span>
        </div>
        <div style={s.divider} />
        <p style={{ ...s.label, margin: 0 }}>Penalty rewards from early withdrawers</p>
        {[
          { label: 'Low activity', value: penaltyLow, apy: apyLow },
          { label: 'Medium activity', value: penaltyMed, apy: apyMed },
          { label: 'High activity', value: penaltyHigh, apy: apyHigh },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: row.label === 'Low activity' ? '#fbbf24' : row.label === 'Medium activity' ? '#f97316' : '#ef4444' }} />
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{row.label}</span>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#4ade80', fontFamily: 'Inter, sans-serif' }}>+${row.value.toFixed(4)}</span>
          </div>
        ))}
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

  const { data: userShares, refetch: refetchShares } = useReadContract({ address: DISCIPLINE_VAULT_ADDRESS, abi: DISCIPLINE_VAULT_ABI, functionName: 'getUserShares', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: pendingReward, refetch: refetchReward } = useReadContract({ address: DISCIPLINE_VAULT_ADDRESS, abi: DISCIPLINE_VAULT_ABI, functionName: 'getPendingReward', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: totalEarned } = useReadContract({ address: DISCIPLINE_VAULT_ADDRESS, abi: DISCIPLINE_VAULT_ABI, functionName: 'getTotalEarnedFromPenalties', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: userLockPeriod } = useReadContract({ address: DISCIPLINE_VAULT_ADDRESS, abi: DISCIPLINE_VAULT_ABI, functionName: 'getUserLockPeriod', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: isLocked } = useReadContract({ address: DISCIPLINE_VAULT_ADDRESS, abi: DISCIPLINE_VAULT_ABI, functionName: 'isLocked', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: timeRemaining } = useReadContract({ address: DISCIPLINE_VAULT_ADDRESS, abi: DISCIPLINE_VAULT_ABI, functionName: 'getTimeRemaining', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: depositorCount } = useReadContract({ address: DISCIPLINE_VAULT_ADDRESS, abi: DISCIPLINE_VAULT_ABI, functionName: 'getDepositorCount' })
  const { data: totalPenaltyCollected } = useReadContract({ address: DISCIPLINE_VAULT_ADDRESS, abi: DISCIPLINE_VAULT_ABI, functionName: 'totalPenaltyCollected' })

  useEffect(() => {
    if (approveSuccess && step === 'approving') {
      setStep('depositing')
      const amountInUnits = BigInt(Math.floor(Number(amount) * 1_000_000))
      writeDeposit({ address: DISCIPLINE_VAULT_ADDRESS, abi: DISCIPLINE_VAULT_ABI, functionName: 'deposit', args: [amountInUnits, BigInt(lockDays)] })
    }
  }, [approveSuccess])

  useEffect(() => { if (depositSuccess && step === 'depositing') { setStep('done'); refetchShares(); refetchReward() } }, [depositSuccess])
  useEffect(() => { if (withdrawSuccess && step === 'withdrawing') setStep('withdrawn') }, [withdrawSuccess])
  useEffect(() => { if (claimSuccess && step === 'claiming') { setStep('claimed'); refetchReward() } }, [claimSuccess])

  function handleDeposit() {
    if (!amount || Number(amount) <= 0) return
    setStep('approving')
    const amountInUnits = BigInt(Math.floor(Number(amount) * 1_000_000))
    writeContract({ address: USDC_MAINNET, abi: ERC20_ABI, functionName: 'approve', args: [DISCIPLINE_VAULT_ADDRESS, amountInUnits] })
  }
  function handleWithdraw() {
    if (!userShares || userShares === BigInt(0)) return
    setStep('withdrawing')
    writeWithdraw({ address: DISCIPLINE_VAULT_ADDRESS, abi: DISCIPLINE_VAULT_ABI, functionName: 'withdraw', args: [userShares] })
  }
  function handleClaim() {
    setStep('claiming')
    writeClaim({ address: DISCIPLINE_VAULT_ADDRESS, abi: DISCIPLINE_VAULT_ABI, functionName: 'claimRewards', args: [] })
  }

  const sharesFormatted = userShares ? (Number(userShares) / 1e6).toFixed(4) : '0'
  const pendingFormatted = pendingReward ? (Number(pendingReward) / 1e6).toFixed(6) : '0.000000'
  const totalEarnedFormatted = totalEarned ? (Number(totalEarned) / 1e6).toFixed(4) : '0'
  const totalPenaltyFormatted = totalPenaltyCollected ? (Number(totalPenaltyCollected) / 1e6).toFixed(4) : '0'
  const daysRemaining = timeRemaining ? Math.ceil(Number(timeRemaining) / 86400) : 0
  const hasPendingReward = !!(pendingReward && pendingReward > BigInt(0))
  const hasShares = !!(userShares && userShares > BigInt(0))

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <h2 style={{ fontSize: '26px', color: '#ffffff', fontWeight: 400, marginBottom: '4px', letterSpacing: '-0.5px', fontFamily: 'Instrument Serif, Georgia, serif' }}>DisciplineVault</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', margin: 0 }}>Lock savings. Earn from early withdrawals. Fully onchain.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>{depositorCount?.toString() ?? '0'}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.5px', marginTop: '2px' }}>ACTIVE SAVERS</div>
        </div>
      </div>

      {/* How it works banner */}
      <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 600, marginBottom: '4px' }}>How it works</p>
        <p style={{ fontSize: '13px', color: 'rgba(251,191,36,0.9)', margin: 0, lineHeight: 1.6 }}>
          Lock USDC for 30, 60, or 90 days. If anyone withdraws early, they pay a <strong>4.5% penalty</strong> — automatically distributed to everyone who stayed committed. <strong>Every early withdrawal makes your position more valuable.</strong> Patience pays.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Your Shares', value: sharesFormatted, color: '#ffffff' },
          { label: 'Pending Rewards', value: pendingFormatted, color: '#4ade80' },
          { label: 'Total Earned', value: totalEarnedFormatted, color: '#ffffff' },
          { label: 'Days Left', value: hasShares ? (isLocked ? `${daysRemaining}d` : '✅ Free') : '—', color: isLocked ? '#60a5fa' : '#ffffff' },
        ].map(stat => (
          <div key={stat.label} style={s.card}>
            <p style={s.label}>{stat.label}</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: stat.color, margin: 0, fontFamily: 'Inter, sans-serif' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 🎰 Discipline Jackpot */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.07) 100%)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', marginBottom: '20px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#fbbf24', margin: '0 0 6px 0' }}>🎰 Discipline Jackpot</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: '0 0 4px 0', fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>
            {totalPenaltyFormatted} <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>yoUSD</span>
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(251,191,36,0.85)', margin: 0 }}>Paid by weak hands. Waiting for diamond hands.</p>
        </div>
        <div style={{ fontSize: '32px' }}>💎</div>
      </div>

      {/* Lock period info */}
      {hasShares && userLockPeriod && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: '#60a5fa', fontWeight: 600 }}>Your lock period: {userLockPeriod.toString()} days</span>
          {isLocked && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{daysRemaining} days remaining</span>}
        </div>
      )}

      {/* Claim rewards */}
      {hasPendingReward && step === 'idle' && (
        <button
          onClick={handleClaim}
          style={{ width: '100%', marginBottom: '16px', background: '#4ade80', color: '#0d1117', fontWeight: 700, fontSize: '14px', padding: '13px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
        >
          Claim {pendingFormatted} yoUSD from penalty pool →
        </button>
      )}

      {/* Main idle form */}
      {step === 'idle' && (
        <div>
          <div style={s.divider} />
          <p style={s.label}>Lock period</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {([
              { days: 30 as const, label: '30 days', sub: 'Standard' },
              { days: 60 as const, label: '60 days', sub: 'More rewards' },
              { days: 90 as const, label: '90 days', sub: 'Max rewards' },
            ]).map(opt => (
              <button
                key={opt.days}
                onClick={() => setLockDays(opt.days)}
                style={{
                  padding: '12px', borderRadius: '8px', cursor: 'pointer',
                  border: lockDays === opt.days ? '2px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
                  background: lockDays === opt.days ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.03)',
                  transition: 'all 0.12s ease', textAlign: 'center' as const, fontFamily: 'Inter, sans-serif',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 600, color: lockDays === opt.days ? '#4ade80' : '#ffffff' }}>{opt.label}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>{opt.sub}</div>
              </button>
            ))}
          </div>

          <p style={s.label}>Deposit amount (USDC)</p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', borderRadius: '8px', padding: '11px 14px', fontSize: '15px', outline: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            />
            <button
              onClick={handleDeposit}
              style={{ background: '#4ade80', color: '#0d1117', fontWeight: 700, fontSize: '14px', padding: '11px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const, fontFamily: 'Inter, sans-serif' }}
            >
              Lock & Deposit
            </button>
          </div>

          <ProjectedEarnings amount={amount} lockDays={lockDays} apy={4.92} />

          {hasShares && (
            <button
              onClick={handleWithdraw}
              style={{
                width: '100%',
                background: isLocked ? 'rgba(220,38,38,0.08)' : 'rgba(74,222,128,0.08)',
                border: `1px solid ${isLocked ? 'rgba(220,38,38,0.3)' : 'rgba(74,222,128,0.3)'}`,
                color: isLocked ? '#f87171' : '#4ade80',
                fontWeight: 600, fontSize: '14px', padding: '12px',
                borderRadius: '8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              {isLocked ? '⚠️ Withdraw early (4.5% penalty → community)' : '✅ Withdraw (no penalty)'}
            </button>
          )}
        </div>
      )}

      {/* Transaction steps */}
      {(step === 'approving' || step === 'depositing' || step === 'withdrawing' || step === 'claiming') && (
        <div style={{ textAlign: 'center', padding: '32px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: '32px', height: '32px', border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #4ade80', borderRadius: '50%', margin: '0 auto 16px', animation: 'hf-spin 0.8s linear infinite' }} />
          <style>{`@keyframes hf-spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '15px', margin: '0 0 4px 0' }}>
            {step === 'approving' ? 'Step 1 of 2 — Approving USDC' : step === 'depositing' ? 'Step 2 of 2 — Locking in vault' : step === 'withdrawing' ? 'Withdrawing funds' : 'Claiming rewards'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0 }}>Confirm in your wallet</p>
        </div>
      )}

      {/* Success: deposited */}
      {step === 'done' && (
        <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '10px', padding: '24px', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', background: '#4ade80', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '20px', color: '#0d1117', fontWeight: 700 }}>✓</div>
          <p style={{ color: '#4ade80', fontWeight: 600, fontSize: '17px', margin: '0 0 6px 0' }}>Locked for {lockDays} days</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 16px 0' }}>You'll earn yield + a share of every early withdrawal penalty.</p>
          {depositTxHash && <a href={`https://basescan.org/tx/${depositTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '12px' }}>View on Basescan ↗</a>}
          <button onClick={() => { setStep('idle'); setAmount('') }} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', fontWeight: 600, fontSize: '14px', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Done</button>
        </div>
      )}

      {/* Success: withdrawn */}
      {step === 'withdrawn' && (
        <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '10px', padding: '24px', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', background: '#4ade80', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '20px', color: '#0d1117', fontWeight: 700 }}>✓</div>
          <p style={{ color: '#4ade80', fontWeight: 600, fontSize: '17px', margin: '0 0 16px 0' }}>Withdrawn successfully</p>
          {withdrawTxHash && <a href={`https://basescan.org/tx/${withdrawTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '12px' }}>View on Basescan ↗</a>}
          <button onClick={() => setStep('idle')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', fontWeight: 600, fontSize: '14px', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Done</button>
        </div>
      )}

      {/* Success: claimed */}
      {step === 'claimed' && (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '24px', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', background: '#4ade80', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '20px', color: '#0d1117', fontWeight: 700 }}>✓</div>
          <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '17px', margin: '0 0 16px 0' }}>Rewards claimed</p>
          {claimTxHash && <a href={`https://basescan.org/tx/${claimTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '12px' }}>View on Basescan ↗</a>}
          <button onClick={() => setStep('idle')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', fontWeight: 600, fontSize: '14px', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Done</button>
        </div>
      )}

      {/* Trust & Transparency */}
      <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '20px' }}>
        <p style={s.label}>Where do your funds go?</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {[
            { label: 'Your Wallet', bg: 'rgba(96,165,250,0.12)', color: '#60a5fa' },
            { label: '→', bg: 'transparent', color: 'rgba(255,255,255,0.5)' },
            { label: 'DisciplineVault', bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)' },
            { label: '→', bg: 'transparent', color: 'rgba(255,255,255,0.5)' },
            { label: 'YO Vault', bg: 'rgba(74,222,128,0.1)', color: '#4ade80' },
            { label: '→', bg: 'transparent', color: 'rgba(255,255,255,0.5)' },
            { label: 'yoUSD Yield', bg: 'rgba(251,191,36,0.1)', color: '#fbbf24' },
          ].map((item, i) => (
            <span key={i} style={{ background: item.bg, color: item.color, fontSize: '12px', fontWeight: 600, padding: item.label === '→' ? '0' : '4px 10px', borderRadius: '6px', border: item.label === '→' ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
              {item.label}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
          {[
            { label: 'DisciplineVault contract', href: 'https://basescan.org/address/0x85E535Af5663426D38461B2e74d34FafA8a7472a' },
            { label: 'YO Protocol vault', href: 'https://basescan.org/address/0x0000000f2eb9f69274678c76222b35eec7588a65' },
            { label: 'Proof of real deposit transaction', href: 'https://basescan.org/tx/0xba6c889a70eed58fe7c6440e77804f2ad2824503868745f19576261d36e52b9f' },
          ].map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>{link.label} ↗</a>
          ))}
        </div>
        <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '8px', padding: '12px 14px' }}>
          <p style={{ color: 'rgba(251,191,36,0.9)', fontSize: '12px', margin: 0, lineHeight: 1.6 }}>
            <strong>Risk disclosure:</strong> HoldFirm is non-custodial. Funds are held by smart contracts, not by us. DisciplineVault is unaudited — only deposit what you can afford to lose. Early withdrawal incurs a 4.5% penalty redistributed to other savers.
          </p>
        </div>
      </div>
    </div>
  )
}
