import { useReadContract, useReadContracts } from 'wagmi'
import { useState } from 'react'

const DISCIPLINE_VAULT = '0x85E535Af5663426D38461B2e74d34FafA8a7472a' as const
const PRECISION = BigInt('1000000000000000000') // 1e18

const VAULT_ABI = [
  {
    name: 'getDepositorCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'depositors',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'index', type: 'uint256' }],
    outputs: [{ type: 'address' }],
  },
  {
    name: 'users',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'addr', type: 'address' }],
    outputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'depositTime', type: 'uint256' },
      { name: 'lockPeriod', type: 'uint256' },
      { name: 'rewardDebt', type: 'uint256' },
      { name: 'earnedFromPenalties', type: 'uint256' },
    ],
  },
  {
    name: 'getPendingReward',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'userAddr', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'accRewardPerShare',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'totalPenaltyCollected',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'totalShares',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'isLocked',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'userAddr', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
] as const

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function formatShares(raw: bigint) {
  return (Number(raw) / 1e6).toFixed(4)
}

function formatLockDays(lockPeriod: bigint) {
  const days = Number(lockPeriod) / 86400
  if (days >= 90) return '90d'
  if (days >= 60) return '60d'
  return '30d'
}

function lockColor(lockPeriod: bigint) {
  const days = Number(lockPeriod) / 86400
  if (days >= 90) return { bg: '#dcfce7', color: '#15803d', label: '90d' }
  if (days >= 60) return { bg: '#dbeafe', color: '#1d4ed8', label: '60d' }
  return { bg: '#fef3c7', color: '#b45309', label: '30d' }
}

type Tab = 'patient' | 'earners'

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<Tab>('patient')

  // ── Global stats ────────────────────────────────────────────────────────
  const { data: depositorCount } = useReadContract({
    address: DISCIPLINE_VAULT,
    abi: VAULT_ABI,
    functionName: 'getDepositorCount',
  })

  const { data: totalPenalty } = useReadContract({
    address: DISCIPLINE_VAULT,
    abi: VAULT_ABI,
    functionName: 'totalPenaltyCollected',
  })

  const { data: totalShares } = useReadContract({
    address: DISCIPLINE_VAULT,
    abi: VAULT_ABI,
    functionName: 'totalShares',
  })

  // ── Fetch all depositor addresses ────────────────────────────────────────
  const count = depositorCount ? Number(depositorCount) : 0

  const depositorCalls = Array.from({ length: count }, (_, i) => ({
    address: DISCIPLINE_VAULT as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'depositors' as const,
    args: [BigInt(i)] as const,
  }))

  const { data: depositorAddresses } = useReadContracts({
    contracts: depositorCalls,
    query: { enabled: count > 0 },
  })

  // ── Fetch user info for each address ─────────────────────────────────────
  const addresses = (depositorAddresses ?? [])
    .map(r => r.result as `0x${string}` | undefined)
    .filter(Boolean) as `0x${string}`[]

  const userInfoCalls = addresses.flatMap(addr => [
    {
      address: DISCIPLINE_VAULT as `0x${string}`,
      abi: VAULT_ABI,
      functionName: 'users' as const,
      args: [addr] as const,
    },
    {
      address: DISCIPLINE_VAULT as `0x${string}`,
      abi: VAULT_ABI,
      functionName: 'getPendingReward' as const,
      args: [addr] as const,
    },
    {
      address: DISCIPLINE_VAULT as `0x${string}`,
      abi: VAULT_ABI,
      functionName: 'isLocked' as const,
      args: [addr] as const,
    },
  ])

  const { data: userInfoResults } = useReadContracts({
    contracts: userInfoCalls,
    query: { enabled: addresses.length > 0 },
  })

  // ── Parse results ─────────────────────────────────────────────────────────
  type Entry = {
    address: string
    shares: bigint
    lockPeriod: bigint
    earnedFromPenalties: bigint
    pendingReward: bigint
    totalEarned: bigint
    isLocked: boolean
  }

  const entries: Entry[] = addresses
    .map((addr, i) => {
      const userRaw = userInfoResults?.[i * 3]?.result as
        | [bigint, bigint, bigint, bigint, bigint]
        | undefined
      const pending = userInfoResults?.[i * 3 + 1]?.result as bigint | undefined
      const locked = userInfoResults?.[i * 3 + 2]?.result as boolean | undefined

      if (!userRaw) return null

      const [shares, , lockPeriod, , earnedFromPenalties] = userRaw
      const pendingReward = pending ?? BigInt(0)

      return {
        address: addr,
        shares,
        lockPeriod,
        earnedFromPenalties,
        pendingReward,
        totalEarned: earnedFromPenalties + pendingReward,
        isLocked: locked ?? false,
      }
    })
    .filter(Boolean) as Entry[]

  // ── Sort lists ────────────────────────────────────────────────────────────
  const patientLeaders = [...entries]
    .filter(e => e.shares > BigInt(0))
    .sort((a, b) => {
      // Sort by lock period desc, then shares desc
      const lockDiff = Number(b.lockPeriod) - Number(a.lockPeriod)
      if (lockDiff !== 0) return lockDiff
      return Number(b.shares - a.shares)
    })
    .slice(0, 10)

  const earnerLeaders = [...entries]
    .filter(e => e.totalEarned > BigInt(0))
    .sort((a, b) => Number(b.totalEarned - a.totalEarned))
    .slice(0, 10)

  const loading = count > 0 && addresses.length === 0
  const empty = !loading && entries.length === 0

  const totalPenaltyFormatted = totalPenalty
    ? (Number(totalPenalty) / 1e6).toFixed(4)
    : '0'

  const totalSharesFormatted = totalShares
    ? (Number(totalShares) / 1e6).toFixed(2)
    : '0'

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid #f3f4f6' }}>
        <div>
          <h2 className="serif" style={{ fontSize: '26px', color: '#111827', fontWeight: 400, marginBottom: '4px', letterSpacing: '-0.5px' }}>
            Leaderboard
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            On-chain rankings from DisciplineVault · Base Mainnet
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827', fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>
            {count}
          </div>
          <div className="section-label" style={{ marginTop: '3px' }}>SAVERS</div>
        </div>
      </div>

      {/* Global stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Savers', value: count.toString(), sub: 'on Base mainnet' },
          { label: 'Total Penalties Paid', value: `${totalPenaltyFormatted} yoUSD`, sub: 'redistributed to savers' },
          { label: 'Total Locked', value: `${totalSharesFormatted} yoUSD`, sub: 'earning YO yield' },
        ].map(card => (
          <div key={card.label} style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
            <p className="section-label" style={{ marginBottom: '8px' }}>{card.label}</p>
            <p style={{ fontSize: '16px', color: '#111827', fontWeight: 700, marginBottom: '2px', fontFamily: 'Inter, sans-serif' }}>{card.value}</p>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '3px' }}>
        {([
          { key: 'patient', label: '🔒 Most Patient Savers' },
          { key: 'earners', label: '💰 Top Penalty Earners' },
        ] as { key: Tab; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              flex: 1, padding: '7px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: activeTab === t.key ? 600 : 500,
              fontFamily: 'Inter, sans-serif',
              background: activeTab === t.key ? '#fff' : 'transparent',
              color: activeTab === t.key ? '#111827' : '#6b7280',
              boxShadow: activeTab === t.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.12s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ width: '24px', height: '24px', border: '2px solid #e5e7eb', borderTopColor: '#15803d', borderRadius: '50%', animation: 'hf-spin 0.75s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes hf-spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>Reading on-chain data…</p>
        </div>
      )}

      {empty && !loading && (
        <div style={{ padding: '48px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏆</div>
          <p style={{ fontSize: '15px', color: '#374151', fontWeight: 600, marginBottom: '6px' }}>No savers yet</p>
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>Be the first to lock in DisciplineVault and claim the top spot.</p>
        </div>
      )}

      {!loading && !empty && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 80px 120px', gap: '0', padding: '10px 16px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            {['#', 'Address', activeTab === 'patient' ? 'Locked' : 'Total Earned', 'Lock', 'Status'].map((h, i) => (
              <p key={i} className="section-label" style={{ margin: 0 }}>{h}</p>
            ))}
          </div>

          {/* Rows */}
          {(activeTab === 'patient' ? patientLeaders : earnerLeaders).map((entry, i) => {
            const lock = lockColor(entry.lockPeriod)
            return (
              <div
                key={entry.address}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 120px 80px 120px',
                  gap: '0',
                  padding: '14px 16px',
                  borderBottom: i < patientLeaders.length - 1 ? '1px solid #f3f4f6' : 'none',
                  backgroundColor: i === 0 ? '#fffbeb' : '#fff',
                  alignItems: 'center',
                }}
              >
                {/* Rank */}
                <span style={{ fontSize: '16px' }}>
                  {i < 3 ? medals[i] : `${i + 1}`}
                </span>

                {/* Address */}
                <a
                  href={`https://basescan.org/address/${entry.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '13px', color: '#111827', fontFamily: 'Inter, sans-serif', fontWeight: 600, textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#15803d')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#111827')}
                >
                  {shortAddr(entry.address)} ↗
                </a>

                {/* Shares or earned */}
                <span style={{ fontSize: '13px', color: '#111827', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  {activeTab === 'patient'
                    ? `${formatShares(entry.shares)} yoUSD`
                    : `${formatShares(entry.totalEarned)} yoUSD`}
                </span>

                {/* Lock badge */}
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, backgroundColor: lock.bg, color: lock.color, fontFamily: 'Inter, sans-serif' }}>
                  {lock.label}
                </span>

                {/* Status */}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: entry.isLocked ? '#15803d' : '#9ca3af', fontWeight: 500 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: entry.isLocked ? '#15803d' : '#d1d5db', display: 'inline-block' }} />
                  {entry.isLocked ? 'Locked' : 'Unlocked'}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer note */}
      <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px', textAlign: 'center' }}>
        All data read directly from{' '}
        <a
          href="https://basescan.org/address/0x85E535Af5663426D38461B2e74d34FafA8a7472a"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#6b7280', textDecoration: 'underline' }}
        >
          DisciplineVault on Base
        </a>
        {' '}· Updates on every block
      </p>
    </div>
  )
}
