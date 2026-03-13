import { useState, useEffect } from 'react'
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
  {
    // ERC-4626: preview how much USDC you get back for N shares
    name: 'previewRedeem',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'shares', type: 'uint256' }],
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

  // ── Share balance ────────────────────────────────────────────────────────
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

  const sharesNum = parseFloat(formattedShares)
  const amountNum = parseFloat(amount) || 0
  const isValid = amountNum > 0 && amountNum <= sharesNum
  const percentOfBalance = sharesNum > 0 ? Math.min((amountNum / sharesNum) * 100, 100) : 0

  // ── Withdraw preview — calls previewRedeem on the vault ──────────────────
  // Converts the typed share amount into on-chain units and asks the vault
  // exactly how much USDC will come back (includes all yield earned so far)
  const sharesInUnits = amountNum > 0
    ? BigInt(Math.floor(amountNum * 1_000_000))
    : BigInt(0)

  const { data: previewData } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'previewRedeem',
    args: [sharesInUnits],
    query: { enabled: amountNum > 0 },
  })

  // How much USDC the user will actually receive
  const usdcOut = previewData ? Number(previewData) / 1_000_000 : amountNum
  // Yield = USDC received minus original shares (yield earned on top)
  const yieldEarned = usdcOut - amountNum

  // ── Redeem TX ────────────────────────────────────────────────────────────
  const { writeContract, data: redeemTxHash } = useWriteContract()
  const { isSuccess: redeemSuccess } = useWaitForTransactionReceipt({ hash: redeemTxHash })

  useEffect(() => {
    if (redeemSuccess && step === 'redeeming') {
      setStep('done')
    }
  }, [redeemSuccess])

  function handleRedeem() {
    if (!isValid) return
    setStep('redeeming')
    writeContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: 'redeem',
      args: [sharesInUnits, address!, address!],
    })
  }

  function handleMax() {
    setAmount(formattedShares)
  }

  const shortTx = redeemTxHash
    ? `${redeemTxHash.slice(0, 10)}...${redeemTxHash.slice(-8)}`
    : ''

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 9999, backgroundColor: 'rgba(17, 24, 39, 0.55)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: '440px', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.06)', fontFamily: 'Inter, sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>Withdraw Savings</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px', margin: 0 }}>Redeem yoUSD shares back to USDC</p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #e5e7eb', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px' }}>

          {/* INPUT */}
          {step === 'input' && (
            <div>

              {/* Available balance */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '10px', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Available to Withdraw</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                    {formattedShares}{' '}
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>yoUSD</span>
                  </p>
                </div>
                <button onClick={handleMax} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#ffffff', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Max
                </button>
              </div>

              {/* Amount input */}
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Amount to withdraw</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '0 16px', backgroundColor: '#f9fafb' }}>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.000000"
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '24px', fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#111827', padding: '14px 0' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginLeft: '8px' }}>yoUSD</span>
              </div>

              {/* Progress bar */}
              {amountNum > 0 && sharesNum > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Withdrawing</span>
                    <span style={{ fontSize: '12px', color: '#111827', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                      {percentOfBalance.toFixed(1)}% of balance
                    </span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: '#f3f4f6', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${percentOfBalance}%`, backgroundColor: percentOfBalance > 90 ? '#dc2626' : '#111827', borderRadius: '2px', transition: 'width 0.2s, background 0.2s' }} />
                  </div>
                </div>
              )}

              {/* ── WITHDRAW PREVIEW ────────────────────────────────────
                  Shows exact USDC they'll receive + yield earned on top.
                  Fetched live from previewRedeem() on the vault contract.
              ──────────────────────────────────────────────────────── */}
              {amountNum > 0 && amountNum <= sharesNum && (
                <div style={{ marginTop: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                  {/* Preview header */}
                  <div style={{ padding: '10px 14px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                      Withdrawal Preview
                    </p>
                  </div>

                  {/* Preview rows */}
                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                    {/* Shares in */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>Shares redeemed</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', fontFamily: 'Inter, sans-serif' }}>
                        {amountNum.toFixed(6)} yoUSD
                      </span>
                    </div>

                    {/* Yield earned */}
                    {yieldEarned > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Yield earned</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', fontFamily: 'Inter, sans-serif' }}>
                          +${yieldEarned.toFixed(6)}
                        </span>
                      </div>
                    )}

                    {/* Divider */}
                    <div style={{ height: '1px', backgroundColor: '#f3f4f6' }} />

                    {/* USDC you receive */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>You receive</span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827', fontFamily: 'Inter, sans-serif' }}>
                        ${usdcOut.toFixed(6)}{' '}
                        <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>USDC</span>
                      </span>
                    </div>

                  </div>
                </div>
              )}

              {/* Over-balance warning */}
              {amountNum > sharesNum && sharesNum > 0 && (
                <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}>
                    Amount exceeds your available balance of {formattedShares} yoUSD
                  </p>
                </div>
              )}

              {/* Info note */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px', padding: '10px 12px', backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>💡</span>
                <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.55, margin: 0 }}>
                  Shares are redeemed 1:1 plus all yield earned. Funds arrive in your wallet instantly.
                </p>
              </div>

              {/* Withdraw button */}
              <button
                onClick={handleRedeem}
                disabled={!isValid}
                style={{ width: '100%', marginTop: '18px', padding: '13px 0', borderRadius: '12px', border: 'none', background: !isValid ? '#e5e7eb' : '#111827', color: !isValid ? '#9ca3af' : '#ffffff', fontSize: '15px', fontWeight: 600, cursor: !isValid ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.15s' }}
              >
                {isValid ? `Withdraw $${usdcOut.toFixed(2)} USDC` : 'Withdraw USDC'}
              </button>
            </div>
          )}

          {/* REDEEMING */}
          {step === 'redeeming' && (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <Spinner />
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginTop: '18px', marginBottom: '6px' }}>Processing Withdrawal</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Confirm the transaction in your wallet</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>yoUSD shares are being redeemed to USDC</p>
            </div>
          )}

          {/* SUCCESS */}
          {step === 'done' && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 20px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#f0fdf4', border: '2px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#15803d', marginBottom: '16px', fontWeight: 700 }}>✓</div>
                <p style={{ fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>Withdrawal Confirmed</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  ${usdcOut.toFixed(2)} USDC returned to your wallet
                </p>
              </div>

              {redeemTxHash && (
                <a href={`https://basescan.org/tx/${redeemTxHash}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', textDecoration: 'none', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '3px' }}>Transaction</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#111827', fontWeight: 600, margin: 0 }}>{shortTx}</p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>View on Base ↗</span>
                </a>
              )}

              <button onClick={onClose} style={{ width: '100%', padding: '13px 0', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: 'transparent', color: '#374151', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Done
              </button>
            </div>
          )}

        </div>
      </div>
      <style>{`@keyframes hf-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#111827', borderRadius: '50%', animation: 'hf-spin 0.75s linear infinite', margin: '0 auto' }} />
  )
}
