import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { recordSavingToday } from './SavingsStreak'
import { VAULTS } from '../lib/yo'
import type { VaultKey } from '../lib/yo'

const EURC_ADDRESS = '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42' as `0x${string}`
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`

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
  apy?: number
  vaultKey?: VaultKey
}

export function DepositModal({ onClose, apy = 4.92, vaultKey = 'yoUSD' }: DepositModalProps) {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState('input')

  const vault = VAULTS[vaultKey]
  const assetAddress = vaultKey === 'yoEUR' ? EURC_ADDRESS : USDC_ADDRESS
  const assetSymbol = vault.asset
  const vaultAddress = vault.address
  const vaultColor = vault.color

  const { writeContract, data: approveTxHash } = useWriteContract()
  const { writeContract: writeDeposit, data: depositTxHash } = useWriteContract()

  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash })
  const { isSuccess: depositSuccess } = useWaitForTransactionReceipt({ hash: depositTxHash })

  const amountNum = parseFloat(amount) || 0
  const yearlyYield = amountNum * (apy / 100)
  const monthlyYield = yearlyYield / 12

  useEffect(() => {
    if (approveSuccess && step === 'approving') {
      setStep('depositing')
      const amountInUnits = BigInt(Math.floor(Number(amount) * 1_000_000))
      writeDeposit({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'deposit',
        args: [amountInUnits, address!],
      })
    }
  }, [approveSuccess])

  useEffect(() => {
    if (depositSuccess && step === 'depositing') {
      setStep('done')
      recordSavingToday()
    }
  }, [depositSuccess])

  function handleDeposit() {
    if (!amount || Number(amount) <= 0) return
    setStep('approving')
    const amountInUnits = BigInt(Math.floor(Number(amount) * 1_000_000))
    writeContract({
      address: assetAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [vaultAddress, amountInUnits],
    })
  }

  const shortTx = depositTxHash
    ? `${depositTxHash.slice(0, 10)}...${depositTxHash.slice(-8)}`
    : ''

  const isEUR = vaultKey === 'yoEUR'
  const previewBg = isEUR ? '#eff6ff' : '#f0fdf4'
  const previewBorder = isEUR ? '#bfdbfe' : '#bbf7d0'
  const successBg = isEUR ? '#eff6ff' : '#f0fdf4'
  const successBorder = isEUR ? '#93c5fd' : '#86efac'

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 9999, backgroundColor: 'rgba(17, 24, 39, 0.55)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: '440px', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.06)', fontFamily: 'Inter, sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <span style={{ fontSize: '18px' }}>{vault.flag}</span>
              <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Deposit {assetSymbol}
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              Earn {apy}% APY via YO Protocol · {vault.label}
            </p>
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Amount</label>

              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '0 16px', backgroundColor: '#f9fafb' }}>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '24px', fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#111827', padding: '14px 0' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginLeft: '8px' }}>{assetSymbol}</span>
              </div>

              {/* Yield preview */}
              {amountNum > 0 && (
                <div style={{ marginTop: '14px', padding: '14px 16px', backgroundColor: previewBg, border: `1px solid ${previewBorder}`, borderRadius: '12px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: vaultColor, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
                    Projected Earnings
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '3px' }}>Monthly</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 700, color: vaultColor }}>+${monthlyYield.toFixed(4)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '3px' }}>Yearly</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 700, color: vaultColor }}>+${yearlyYield.toFixed(4)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Trust note */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px', padding: '10px 12px', backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>🔒</span>
                <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.55, margin: 0 }}>
                  Non-custodial. Your {assetSymbol} goes directly to the YO Protocol {vault.symbol} vault. Withdraw anytime.
                </p>
              </div>

              {/* Button */}
              <button
                onClick={handleDeposit}
                disabled={!amount || amountNum <= 0}
                style={{ width: '100%', marginTop: '18px', padding: '13px 0', borderRadius: '12px', border: 'none', background: !amount || amountNum <= 0 ? '#e5e7eb' : vaultColor, color: !amount || amountNum <= 0 ? '#9ca3af' : '#ffffff', fontSize: '15px', fontWeight: 600, cursor: !amount || amountNum <= 0 ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.15s' }}
              >
                Deposit {assetSymbol}
              </button>
            </div>
          )}

          {/* APPROVING */}
          {step === 'approving' && (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <StepIndicator current={1} total={2} color={vaultColor} />
              <Spinner color={vaultColor} />
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginTop: '18px', marginBottom: '6px' }}>Approving {assetSymbol}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Confirm the approval in your wallet</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>This lets the vault access your {assetSymbol}</p>
            </div>
          )}

          {/* DEPOSITING */}
          {step === 'depositing' && (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <StepIndicator current={2} total={2} color={vaultColor} />
              <Spinner color={vaultColor} />
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginTop: '18px', marginBottom: '6px' }}>Depositing into {vault.symbol}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Confirm the deposit in your wallet</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Your {assetSymbol} is being forwarded to the vault</p>
            </div>
          )}

          {/* SUCCESS */}
          {step === 'done' && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 20px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: successBg, border: `2px solid ${successBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: vaultColor, marginBottom: '16px', fontWeight: 700 }}>✓</div>
                <p style={{ fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>Deposit Confirmed</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{vault.flag} Your {assetSymbol} is now earning {apy}% APY</p>
              </div>

              {depositTxHash && (
                <a href={`https://basescan.org/tx/${depositTxHash}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', textDecoration: 'none', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '3px' }}>Transaction</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#111827', fontWeight: 600, margin: 0 }}>{shortTx}</p>
                  </div>
                  <span style={{ fontSize: '12px', color: vaultColor, fontWeight: 600 }}>View on Base ↗</span>
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

function Spinner({ color = '#15803d' }: { color?: string }) {
  return (
    <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: color, borderRadius: '50%', animation: 'hf-spin 0.75s linear infinite', margin: '0 auto' }} />
  )
}

function StepIndicator({ current, total, color = '#15803d' }: { current: number; total: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, backgroundColor: i < current ? color : '#f3f4f6', color: i < current ? '#fff' : '#9ca3af', transition: 'background 0.2s' }}>
            {i < current - 1 ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div style={{ width: '28px', height: '2px', backgroundColor: i < current - 1 ? color : '#e5e7eb', borderRadius: '2px' }} />
          )}
        </div>
      ))}
    </div>
  )
}
