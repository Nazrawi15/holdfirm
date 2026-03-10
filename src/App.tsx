import { useState } from 'react'
import { useYoVault } from './hooks/useYoVault'
import { useUSDCBalance } from './hooks/useUSDCBalance'
import { useCurrencyRate, CURRENCIES } from './hooks/useCurrencyRate'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { DepositModal } from './components/DepositModal'
import { RedeemModal } from './components/RedeemModal'
import { InflationCounter } from './components/InflationCounter'
import { CurrencySelector } from './components/CurrencySelector'
import { GoalStack } from './components/GoalStack'
import { LockBox } from './components/LockBox'
import SavingsStreak from './components/SavingsStreak'
import RecurringReminder from './components/RecurringReminder'

const TABS = ['NestSave', 'GoalStack', 'LockBox', 'Streak & Habits'] as const
type Tab = typeof TABS[number]

function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1117 0%, #0a1628 50%, #0f1117 100%)',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top nav */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>🔒</div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.3px' }}>HoldFirm</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: '20px',
            padding: '6px 14px',
            color: '#4ade80',
            fontSize: '13px',
            fontWeight: 600,
          }}>
            🟢 Live on Base
          </div>
          <ConnectButton />
        </div>
      </div>

      {/* Hero */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
        gap: '24px',
      }}>
        {/* Badge */}
        <div style={{
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: '20px',
          padding: '6px 16px',
          color: '#4ade80',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.5px',
        }}>
          POWERED BY YO PROTOCOL · 4.92% APY
        </div>

        {/* Main headline */}
        <div>
          <h1 style={{
            color: 'white',
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            margin: 0,
            marginBottom: '6px',
          }}>
            Inflation doesn't ask permission.
          </h1>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            margin: 0,
            background: 'linear-gradient(90deg, #22c55e, #4ade80)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            HoldFirm does.
          </h1>
        </div>

        <p style={{
          color: '#9ca3af',
          fontSize: '17px',
          maxWidth: '500px',
          lineHeight: 1.65,
          margin: 0,
        }}>
          Save in dollars. Earn real yield. Protect everything you've built —
          no matter where you live or what your currency does.
        </p>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {[
            { label: 'APY', value: '4.92%', color: '#4ade80' },
            { label: 'Total Protected', value: '$39M+', color: 'white' },
            { label: 'Currencies', value: '12', color: 'white' },
            { label: 'Chain', value: 'Base', color: '#60a5fa' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              padding: '14px 24px',
              textAlign: 'center',
              minWidth: '100px',
            }}>
              <div style={{ color: stat.color, fontSize: '22px', fontWeight: 800 }}>{stat.value}</div>
              <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '3px', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Flags */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '400px',
        }}>
          {['🇳🇬', '🇹🇷', '🇦🇷', '🇵🇰', '🇪🇬', '🇬🇭', '🇪🇹', '🇺🇦', '🇷🇴', '🇮🇩', '🇬🇪', '🇦🇴'].map(flag => (
            <span key={flag} style={{ fontSize: '26px' }}>{flag}</span>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <ConnectButton.Custom>
            {({ account, openConnectModal, mounted }) => {
              if (!mounted) return null
              if (!account) {
                return (
                  <button
                    onClick={openConnectModal}
                    style={{
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '17px',
                      padding: '16px 44px',
                      borderRadius: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      letterSpacing: '-0.2px',
                      boxShadow: '0 0 40px rgba(34,197,94,0.25)',
                    }}
                  >
                    Connect Wallet to Start Saving →
                  </button>
                )
              }
              return (
                <button
                  onClick={onStart}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '17px',
                    padding: '16px 44px',
                    borderRadius: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '-0.2px',
                    boxShadow: '0 0 40px rgba(34,197,94,0.25)',
                  }}
                >
                  Start Saving Now →
                </button>
              )
            }}
          </ConnectButton.Custom>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>No sign-up. No KYC. Just connect and save.</p>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const { apy, tvl, loading } = useYoVault()
  const { formatted: usdcBalance } = useUSDCBalance()
  const [showDeposit, setShowDeposit] = useState(false)
  const [showRedeem, setShowRedeem] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState('TRY')
  const [activeTab, setActiveTab] = useState<Tab>('NestSave')

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
      backgroundColor: '#eef1f6',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    }}>

      {/* Top navbar */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>🔒</div>
          <span style={{ color: '#111827', fontWeight: 700, fontSize: '16px' }}>HoldFirm</span>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {[
            { label: 'APY', value: loading ? '...' : `${apy}%`, color: '#16a34a' },
            { label: 'TVL', value: loading ? '...' : `$${tvl}`, color: '#111827' },
            { label: 'YOUR BALANCE', value: `$${usdcBalance}`, color: '#111827' },
            { label: 'CHAIN', value: '● Base', color: '#3b82f6' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ color: s.color, fontWeight: 700, fontSize: '15px' }}>{s.value}</div>
              <div style={{ color: '#9ca3af', fontSize: '10px', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <ConnectButton />
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Currency + Inflation row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '12px', margin: '0 0 12px 0' }}>YOUR LOCAL CURRENCY</p>
            <CurrencySelector selected={selectedCurrency} onChange={setSelectedCurrency} />
          </div>

          {selectedCurrencyData && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <InflationCounter
                usdcBalance={usdcBalanceNumber}
                inflationRate={selectedCurrencyData.inflation}
                currencyCode={selectedCurrency}
                currencyRate={rate}
              />
            </div>
          )}
        </div>

        {/* Savings card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', margin: '0 0 4px 0' }}>YOUR SAVINGS</p>
              <p style={{ color: '#111827', fontSize: '36px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-1px' }}>
                ${usdcBalance} <span style={{ fontSize: '18px', color: '#6b7280', fontWeight: 600 }}>USDC</span>
              </p>
              <p style={{ color: '#16a34a', fontSize: '15px', fontWeight: 600, margin: '0 0 4px 0' }}>
                {selectedCurrencyData?.flag} {selectedCurrency} {localBalance}
              </p>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                Earning {apy}% APY — protected from inflation
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowDeposit(true)}
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(34,197,94,0.25)',
                }}
              >
                ↑ Deposit
              </button>
              <button
                onClick={() => setShowRedeem(true)}
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#3b82f6',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
              >
                ↓ Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                border: activeTab === tab ? 'none' : '1px solid #e5e7eb',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '13px',
                backgroundColor: activeTab === tab ? '#111827' : 'white',
                color: activeTab === tab ? 'white' : '#6b7280',
                transition: 'all 0.15s',
                boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {tab === 'NestSave' ? '💰 NestSave' :
               tab === 'GoalStack' ? '🎯 GoalStack' :
               tab === 'LockBox' ? '🔒 LockBox' : '🔥 Streak & Habits'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {activeTab === 'NestSave' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '20px', margin: 0 }}>NestSave</h2>
                  <p style={{ color: '#9ca3af', fontSize: '14px', margin: '4px 0 0 0' }}>
                    Your savings in dollars, earning yield every day.
                  </p>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  textAlign: 'center',
                }}>
                  <div style={{ color: '#16a34a', fontSize: '24px', fontWeight: 800 }}>{apy}%</div>
                  <div style={{ color: '#16a34a', fontSize: '11px', fontWeight: 600 }}>LIVE APY</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Total Value Locked', value: `$${tvl}`, sub: 'across all savers' },
                  { label: 'Your Balance', value: `$${usdcBalance}`, sub: 'in USDC' },
                  { label: 'Local Value', value: `${selectedCurrencyData?.flag} ${selectedCurrency} ${localBalance}`, sub: 'at current rate' },
                ].map(card => (
                  <div key={card.label} style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #f3f4f6',
                  }}>
                    <p style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', margin: '0 0 4px 0' }}>{card.label.toUpperCase()}</p>
                    <p style={{ color: '#111827', fontSize: '18px', fontWeight: 800, margin: '0 0 2px 0' }}>{card.value}</p>
                    <p style={{ color: '#d1d5db', fontSize: '12px', margin: 0 }}>{card.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'GoalStack' && (
            <GoalStack currentBalance={usdcBalanceNumber} apy={apy} />
          )}

          {activeTab === 'LockBox' && (
            <LockBox currentBalance={usdcBalanceNumber} />
          )}

          {activeTab === 'Streak & Habits' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <SavingsStreak />
              <RecurringReminder />
            </div>
          )}
        </div>
      </div>

      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} />}
      {showRedeem && <RedeemModal onClose={() => setShowRedeem(false)} />}
    </div>
  )
}

function App() {
  const { isConnected } = useAccount()
  const [started, setStarted] = useState(false)

  if (!isConnected || !started) {
    return <LandingPage onStart={() => setStarted(true)} />
  }

  return <Dashboard />
}

export default App