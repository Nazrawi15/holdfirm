import { useState } from 'react'
import { useYoVault } from './hooks/useYoVault'
import { useUSDCBalance } from './hooks/useUSDCBalance'
import { useCurrencyRate, CURRENCIES } from './hooks/useCurrencyRate'
import { useAccount } from 'wagmi'
import { DepositModal } from './components/DepositModal'
import { RedeemModal } from './components/RedeemModal'
import { InflationCounter } from './components/InflationCounter'
import { CurrencySelector } from './components/CurrencySelector'
import { GoalStack } from './components/GoalStack'
import { LockBox } from './components/LockBox'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import SavingsStreak from './components/SavingsStreak'
import RecurringReminder from './components/RecurringReminder'

function App() {
  const { apy, tvl, loading } = useYoVault()
  const { formatted: usdcBalance } = useUSDCBalance()
  const { isConnected } = useAccount()
  const [showDeposit, setShowDeposit] = useState(false)
  const [showRedeem, setShowRedeem] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState('NGN')
  const [activeMode, setActiveMode] = useState<'nestsave' | 'goalstack' | 'lockbox'>('nestsave')

  const { rate } = useCurrencyRate(selectedCurrency)
  const usdcBalanceNumber = parseFloat(usdcBalance)
  const localBalance = (usdcBalanceNumber * rate).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const selectedCurrencyData = CURRENCIES.find(c => c.code === selectedCurrency)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#030712',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>

      <Navbar />

      <div style={{
        position: 'fixed',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        padding: '100px 16px 60px 16px',
      }}>

        <Hero
          apy={loading ? '...' : apy}
          tvl={loading ? '...' : tvl}
          onGetStarted={() => {}}
          isConnected={isConnected}
        />

        <div style={{ width: '100%', maxWidth: '480px' }}>
          <CurrencySelector selected={selectedCurrency} onChange={setSelectedCurrency} />
        </div>

        {selectedCurrencyData && (
          <div style={{ width: '100%', maxWidth: '480px' }}>
            <InflationCounter
              usdcBalance={usdcBalanceNumber}
              inflationRate={selectedCurrencyData.inflation}
              currencyCode={selectedCurrency}
              currencyRate={rate}
            />
          </div>
        )}

        {isConnected && (
          <div style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#111827',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Your Savings</p>
            <p style={{ color: 'white', fontSize: '36px', fontWeight: 800, marginBottom: '4px' }}>
              ${usdcBalance} USDC
            </p>
            <p style={{ color: '#22c55e', fontSize: '16px', marginBottom: '4px' }}>
              {selectedCurrencyData?.flag} {selectedCurrency} {localBalance}
            </p>
            <p style={{ color: '#4b5563', fontSize: '13px', marginBottom: '20px' }}>
              Earning {apy}% APY — protected from inflation
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeposit(true)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '16px',
                  padding: '14px',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Deposit
              </button>
              <button
                onClick={() => setShowRedeem(true)}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#60a5fa',
                  fontWeight: 700,
                  fontSize: '16px',
                  padding: '14px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                }}
              >
                Withdraw
              </button>
            </div>
          </div>
        )}

        {isConnected && (
          <div style={{
            width: '100%',
            maxWidth: '480px',
            display: 'flex',
            gap: '8px',
            backgroundColor: '#111827',
            borderRadius: '16px',
            padding: '6px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {(['nestsave', 'goalstack', 'lockbox'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '13px',
                  backgroundColor: activeMode === mode ? '#22c55e' : 'transparent',
                  color: activeMode === mode ? 'white' : '#6b7280',
                  transition: 'all 0.2s',
                }}
              >
                {mode === 'nestsave' ? 'NestSave' : mode === 'goalstack' ? 'GoalStack' : 'LockBox'}
              </button>
            ))}
          </div>
        )}

        {isConnected && activeMode === 'nestsave' && (
          <div style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#111827',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <h2 style={{ color: 'white', fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>
              NestSave
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
              Your savings in dollars, earning yield every day.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>Current APY</p>
                <p style={{ color: '#22c55e', fontSize: '28px', fontWeight: 800 }}>{apy}%</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>Total Locked</p>
                <p style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>${tvl}</p>
              </div>
            </div>
          </div>
        )}

        {isConnected && activeMode === 'goalstack' && (
          <div style={{ width: '100%', maxWidth: '480px' }}>
            <GoalStack currentBalance={usdcBalanceNumber} apy={apy} />
          </div>
        )}

        {isConnected && activeMode === 'lockbox' && (
          <div style={{ width: '100%', maxWidth: '480px' }}>
            <LockBox currentBalance={usdcBalanceNumber} />
          </div>
        )}

        {/* Streak + Reminder — always visible when connected */}
        {isConnected && (
          <>
            <div style={{ width: '100%', maxWidth: '480px' }}>
              <SavingsStreak />
            </div>
            <div style={{ width: '100%', maxWidth: '480px' }}>
              <RecurringReminder />
            </div>
          </>
        )}

        {!isConnected && (
          <div style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#111827',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <h2 style={{ color: 'white', fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>
              YO Vault — yoUSD
            </h2>
            {loading ? (
              <p style={{ color: '#6b7280' }}>Loading vault data...</p>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '13px' }}>APY</p>
                  <p style={{ color: '#22c55e', fontSize: '28px', fontWeight: 800 }}>{apy}%</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#6b7280', fontSize: '13px' }}>TVL</p>
                  <p style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>${tvl}</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} />}
      {showRedeem && <RedeemModal onClose={() => setShowRedeem(false)} />}

    </div>
  )
}

export default App