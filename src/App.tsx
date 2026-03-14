import { useState, useEffect } from 'react'
import { useYoVault } from './hooks/useYoVault'
import { useUSDCBalance } from './hooks/useUSDCBalance'
import { useCurrencyRate, CURRENCIES } from './hooks/useCurrencyRate'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { DepositModal } from './components/DepositModal'
import { RedeemModal } from './components/RedeemModal'
import { InflationCounter } from './components/InflationCounter'
import { CurrencySelector } from './components/CurrencySelector'
import { DisciplineVaultPanel } from './components/DisciplineVaultPanel'
import { OnboardingWizard } from './components/OnboardingWizard'
import { VaultSelector } from './components/VaultSelector'
import { APYChart } from './components/APYChart'
import { Leaderboard } from './components/Leaderboard'
import type { VaultKey } from './lib/yo'

const TABS = ['NestSave', 'DisciplineVault', 'Leaderboard'] as const
type Tab = typeof TABS[number]

export const theme = {
  pageBg: '#f3f4f6',
  white: '#ffffff',
  card: '#ffffff',
  cardAlt: '#f9fafb',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  navy: '#111827',
  navyMid: '#1f2937',
  text: '#111827',
  textSub: '#374151',
  textMuted: '#6b7280',
  textFaint: '#9ca3af',
  green: '#15803d',
  greenBright: '#16a34a',
  greenLight: '#dcfce7',
  greenBorder: '#86efac',
  amber: '#b45309',
  amberLight: '#fef3c7',
  red: '#dc2626',
  blue: '#1d4ed8',
  shadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
}

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 16px; }
  body {
    background: #f3f4f6;
    color: #111827;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    line-height: 1.5;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #f3f4f6; }
  ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
  .serif { font-family: 'Instrument Serif', Georgia, serif; }
  .num { font-family: 'Inter', sans-serif; font-weight: 700; }
  .btn-primary {
    background: #111827; color: #fff; border: none; border-radius: 8px;
    padding: 10px 24px; font-size: 14px; font-weight: 500;
    font-family: 'Inter', sans-serif; cursor: pointer;
    transition: background 0.15s ease, box-shadow 0.15s ease;
  }
  .btn-primary:hover { background: #1f2937; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
  .btn-primary-light {
    background: #ffffff; color: #111827; border: none; border-radius: 8px;
    padding: 10px 24px; font-size: 14px; font-weight: 600;
    font-family: 'Inter', sans-serif; cursor: pointer;
    transition: background 0.15s ease;
  }
  .btn-primary-light:hover { background: #f3f4f6; }
  .btn-secondary {
    background: rgba(255,255,255,0.08); color: #e5e7eb;
    border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
    padding: 10px 24px; font-size: 14px; font-weight: 500;
    font-family: 'Inter', sans-serif; cursor: pointer;
    transition: background 0.15s ease;
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.14); }
  .btn-outline {
    background: #fff; color: #111827;
    border: 1px solid #d1d5db; border-radius: 8px;
    padding: 10px 24px; font-size: 14px; font-weight: 500;
    font-family: 'Inter', sans-serif; cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .btn-outline:hover { border-color: #9ca3af; background: #f9fafb; }
  .card {
    background: #fff; border: 1px solid #e5e7eb;
    border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .tab-item {
    padding: 7px 14px; border-radius: 6px; border: none; cursor: pointer;
    font-size: 13px; font-weight: 500; font-family: 'Inter', sans-serif;
    transition: all 0.12s ease; background: transparent; color: #6b7280; white-space: nowrap;
  }
  .tab-item:hover { background: #f3f4f6; color: #374151; }
  .tab-item.active { background: #fff; color: #111827; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  .section-label { font-size: 11px; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; color: #9ca3af; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .fade-in   { animation: fadeIn 0.4s ease forwards; }
  .fade-in-2 { animation: fadeIn 0.4s ease 0.08s forwards; opacity:0; }
  .fade-in-3 { animation: fadeIn 0.4s ease 0.16s forwards; opacity:0; }
  .fade-in-4 { animation: fadeIn 0.4s ease 0.24s forwards; opacity:0; }
  input { font-family: 'Inter', sans-serif; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
`

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function EyeOffIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function HoldFirmLogo({ size = 32, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill={dark ? '#1f2937' : '#111827'} />
      <path d="M8 10h3v4.5H16V10h3v12h-3v-4.8h-5V22H8V10z" fill="white" />
      <circle cx="23" cy="19" r="2.2" fill="none" stroke="#4ade80" strokeWidth="1.8" />
      <path d="M23 16.5v-.8M23 21.5v.8M20.5 19h-.8M25.3 19h.8" stroke="#4ade80" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function DashboardMockup() {
  return (
    <div style={{ width: '100%', maxWidth: '520px', background: '#1a2235', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '8px', background: '#141c2e' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', margin: '0 8px' }} />
      </div>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '22px', height: '22px', background: '#1f2937', borderRadius: '5px' }} />
          <div style={{ width: '70px', height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[60,44,52].map((w,i) => <div key={i} style={{ width: `${w}px`, height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }} />)}
        </div>
        <div style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
      </div>
      <div style={{ padding: '24px 20px 16px' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.8px', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>TOTAL SAVINGS</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '36px', fontWeight: 700, color: '#ffffff', letterSpacing: '-1.5px', fontFamily: 'Inter, sans-serif' }}>$2,840.50</span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>USDC</span>
        </div>
        <div style={{ fontSize: '14px', color: '#4ade80', fontFamily: 'Inter, sans-serif', fontWeight: 600, marginBottom: '4px' }}>🇹🇷 TRY 92,341.20</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>Earning <span style={{ color: '#4ade80' }}>4.92% APY</span></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '0 20px 16px' }}>
        {[{ label: 'TVL', value: '$39M+' }, { label: 'APY', value: '4.92%' }, { label: 'Lock', value: '60 days' }].map(c => (
          <div key={c.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>{c.label}</div>
            <div style={{ fontSize: '14px', color: '#fff', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{c.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '4px', padding: '0 20px 12px' }}>
        {['NestSave', 'GoalStack', 'DisciplineVault'].map((t, i) => (
          <div key={t} style={{ padding: '5px 10px', borderRadius: '6px', background: i === 2 ? 'rgba(255,255,255,0.1)' : 'transparent', border: i === 2 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}>
            <span style={{ fontSize: '11px', color: i === 2 ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: i === 2 ? 600 : 400, fontFamily: 'Inter, sans-serif' }}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{ margin: '0 20px 20px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>Lock period</span>
          <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>60 days</span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginBottom: '10px' }}>
          <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, #4ade80, #22c55e)', borderRadius: '2px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>Est. APY range</span>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>5.9% – 12.9%</span>
        </div>
      </div>
    </div>
  )
}

function LandingPage({ onStart }: { onStart: () => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <style>{globalStyles}</style>
      <div style={{ background: 'linear-gradient(160deg, #0d1117 0%, #111827 50%, #0f1d2e 100%)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-200px', left: '-100px', width: '600px', height: '600px', background: 'radial-gradient(ellipse, rgba(74,222,128,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(59,130,246,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <nav style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 48px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HoldFirmLogo size={32} />
            <span style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.3px' }}>HoldFirm</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '20px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>Live on Base</span>
            </div>
            <ConnectButton />
          </div>
        </nav>
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1140px', margin: '0 auto', padding: '80px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center', minHeight: 'calc(100vh - 60px)' }}>
          <div>
            <div className={mounted ? 'fade-in' : ''} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '20px', marginBottom: '28px' }}>
              <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 600 }}>YO Protocol · 4.92% APY · Base Mainnet</span>
            </div>
            <h1 className={`serif ${mounted ? 'fade-in-2' : ''}`} style={{ fontSize: 'clamp(38px, 4.5vw, 66px)', lineHeight: 1.07, color: '#ffffff', marginBottom: '22px', fontWeight: 400, letterSpacing: '-1.5px' }}>
              Your savings<br />shouldn't{' '}<em style={{ color: '#4ade80', fontStyle: 'italic' }}>shrink<br />every year.</em>
            </h1>
            <p className={mounted ? 'fade-in-3' : ''} style={{ fontSize: '17px', color: '#9ca3af', lineHeight: 1.75, marginBottom: '14px', fontWeight: 400, maxWidth: '480px' }}>
              1.4 billion people live in high-inflation economies. HoldFirm lets them save in dollars or euros, earn real yield, and collect penalties from people who break their savings commitment.
            </p>
            <p className={mounted ? 'fade-in-3' : ''} style={{ fontSize: '13px', color: '#4b5563', marginBottom: '40px' }}>
              Non-custodial · Smart contract on Base · No KYC
            </p>
            <div className={mounted ? 'fade-in-4' : ''} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <ConnectButton.Custom>
                {({ account, openConnectModal, mounted: m }) => {
                  if (!m) return null
                  return (
                    <button className="btn-primary-light" onClick={account ? onStart : openConnectModal} style={{ padding: '13px 32px', fontSize: '15px' }}>
                      {account ? 'Open Dashboard →' : 'Get Started →'}
                    </button>
                  )
                }}
              </ConnectButton.Custom>
              <a href="https://basescan.org/address/0x85E535Af5663426D38461B2e74d34FafA8a7472a" target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>
                View contract ↗
              </a>
            </div>
            <div className={mounted ? 'fade-in-4' : ''} style={{ display: 'flex', gap: '28px', marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap' }}>
              {[
                { label: 'APY', value: '4.92%', color: '#4ade80' },
                { label: 'TVL', value: '$39M+', color: '#fff' },
                { label: 'Countries', value: '12', color: '#fff' },
                { label: 'Contract', value: 'Verified ✓', color: '#4ade80' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '20px', color: s.color, fontWeight: 700, fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: '#4b5563', fontWeight: 600, letterSpacing: '0.5px', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={mounted ? 'fade-in-3' : ''} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <DashboardMockup />
          </div>
        </div>
      </div>
      <div style={{ backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '80px 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="serif" style={{ fontSize: '36px', color: '#111827', fontWeight: 400, letterSpacing: '-0.8px', marginBottom: '12px' }}>Everything you need to save smarter</h2>
            <p style={{ fontSize: '16px', color: '#6b7280', maxWidth: '480px', margin: '0 auto' }}>Three savings modes, all built on Base mainnet. Non-custodial. Verified.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', backgroundColor: '#e5e7eb', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: '80px' }}>
            {[
              { icon: '📉', title: 'Beat Inflation', desc: 'Save in USDC or EURC and earn real APY. While your local currency loses value, your savings grow.', tag: '12 currencies' },
              { icon: '🔒', title: 'DisciplineVault', desc: 'Lock for 30–90 days. Early withdrawals pay a 4.5% penalty — automatically redistributed to committed savers.', tag: 'Smart contract enforced' },
              { icon: '🤖', title: 'AI Strategy', desc: 'Answer 4 questions. Get a personalized savings plan powered by Llama 3.3 — in seconds.', tag: 'Groq · Llama 3.3' },
            ].map(item => (
              <div key={item.title} style={{ backgroundColor: '#ffffff', padding: '36px 32px' }}>
                <div style={{ fontSize: '28px', marginBottom: '16px' }}>{item.icon}</div>
                <div style={{ color: '#111827', fontWeight: 600, fontSize: '16px', marginBottom: '10px' }}>{item.title}</div>
                <div style={{ color: '#374151', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>{item.desc}</div>
                <div style={{ display: 'inline-block', padding: '3px 10px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '20px', fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>{item.tag}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '48px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>Supporting savers in</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['🇳🇬','🇹🇷','🇦🇷','🇵🇰','🇪🇬','🇬🇭','🇪🇹','🇺🇦','🇷🇴','🇮🇩','🇬🇪','🇦🇴'].map(f => (
                <span key={f} style={{ fontSize: '22px' }}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [selectedVault, setSelectedVault] = useState<VaultKey>('yoUSD')
  const { apy, tvl, loading } = useYoVault(selectedVault)
  const { formatted: usdcBalance } = useUSDCBalance()
  const [showDeposit, setShowDeposit] = useState(false)
  const [showRedeem, setShowRedeem] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState('TRY')
  const [balanceHidden, setBalanceHidden] = useState(false)

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    return (localStorage.getItem('holdfirm_tab') as Tab) || 'NestSave'
  })

  function handleTabChange(tab: Tab) {
    setActiveTab(tab)
    localStorage.setItem('holdfirm_tab', tab)
  }

  const { rate } = useCurrencyRate(selectedCurrency)
  const usdcBalanceNumber = parseFloat(usdcBalance)
  const localBalance = (usdcBalanceNumber * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const selectedCurrencyData = CURRENCIES.find(c => c.code === selectedCurrency)
  const hidden = '••••••'
  const vaultLabel = selectedVault === 'yoEUR' ? 'EURC' : 'USDC'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Inter, sans-serif' }}>
      <style>{globalStyles}</style>

      {/* Navbar */}
      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '0 32px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HoldFirmLogo size={28} />
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827', letterSpacing: '-0.3px' }}>HoldFirm</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {[
            { label: 'APY', value: loading ? '—' : `${apy}%`, color: '#15803d' },
            { label: 'TVL', value: loading ? '—' : `$${tvl}`, color: '#111827' },
            { label: 'Balance', value: balanceHidden ? hidden : `$${usdcBalance}`, color: '#111827' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>{s.label}</span>
              <span style={{ fontSize: '13px', color: s.color, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{s.value}</span>
            </div>
          ))}
          <div style={{ width: '1px', height: '18px', backgroundColor: '#e5e7eb' }} />
          <ConnectButton />
        </div>
      </nav>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 24px' }}>

        {/* Balance card — dark navy hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0d1117 0%, #111827 60%, #0f1d2e 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '16px',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle grid overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none', borderRadius: '16px' }} />
          {/* Green glow top-left */}
          <div style={{ position: 'absolute', top: '-60px', left: '-40px', width: '240px', height: '240px', background: 'radial-gradient(ellipse, rgba(74,222,128,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              {/* Label + hide button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '12px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Total Savings</p>
                <button
                  onClick={() => setBalanceHidden(h => !h)}
                  title={balanceHidden ? 'Show balance' : 'Hide balance'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0, transition: 'color 0.15s, border-color 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.3)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)' }}
                >
                  {balanceHidden ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Big balance */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '48px', fontWeight: 700, color: '#ffffff', letterSpacing: '-2.5px', lineHeight: 1, fontFamily: 'Inter, sans-serif', filter: balanceHidden ? 'blur(10px)' : 'none', userSelect: balanceHidden ? 'none' : 'auto', transition: 'filter 0.25s ease' }}>
                  ${usdcBalance}
                </span>
                <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.35)' }}>{vaultLabel}</span>
              </div>

              {/* Local currency */}
              <p style={{ fontSize: '16px', color: '#4ade80', fontWeight: 600, marginBottom: '6px', fontFamily: 'Inter, sans-serif', filter: balanceHidden ? 'blur(10px)' : 'none', userSelect: balanceHidden ? 'none' : 'auto', transition: 'filter 0.25s ease' }}>
                {selectedCurrencyData?.flag} {selectedCurrency} {localBalance}
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
                Earning <span style={{ color: '#4ade80', fontWeight: 600 }}>{apy}% APY</span> · Protected from inflation
              </p>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <button
                onClick={() => setShowDeposit(true)}
                style={{ padding: '10px 22px', fontSize: '14px', fontWeight: 600, background: '#4ade80', color: '#0d1117', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#22c55e')}
                onMouseLeave={e => (e.currentTarget.style.background = '#4ade80')}
              >↑ Deposit</button>
              <button
                onClick={() => setShowRedeem(true)}
                style={{ padding: '10px 22px', fontSize: '14px', fontWeight: 500, background: 'rgba(255,255,255,0.08)', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              >↓ Withdraw</button>
            </div>
          </div>
        </div>

        {/* Currency + inflation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <p className="section-label" style={{ marginBottom: '12px' }}>Local Currency</p>
            <CurrencySelector selected={selectedCurrency} onChange={setSelectedCurrency} />
          </div>
          {selectedCurrencyData && (
            <div className="card" style={{ padding: '20px' }}>
              <InflationCounter usdcBalance={usdcBalanceNumber} inflationRate={selectedCurrencyData.inflation} currencyCode={selectedCurrency} currencyRate={rate} />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', backgroundColor: '#e5e7eb', borderRadius: '10px', padding: '3px', border: '1px solid #d1d5db' }}>
          {TABS.map(tab => (
            <button key={tab} className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => handleTabChange(tab)}>
              {tab === 'NestSave' ? '💰 NestSave'
                : tab === 'DisciplineVault' ? '🏦 DisciplineVault'
                : '🏆 Leaderboard'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="card" style={{ padding: '28px' }}>

          {/* ══ NestSave ══════════════════════════════════════════════════ */}
          {activeTab === 'NestSave' && (
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <h2 className="serif" style={{ fontSize: '26px', color: '#111827', fontWeight: 400, marginBottom: '4px', letterSpacing: '-0.5px' }}>NestSave</h2>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Your savings earning yield every day. Choose your currency.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '28px', color: '#15803d', fontWeight: 700, lineHeight: 1, fontFamily: 'Inter, sans-serif' }}>{loading ? '—' : `${apy}%`}</div>
                  <div className="section-label" style={{ marginTop: '3px' }}>LIVE APY</div>
                </div>
              </div>

              {/* Vault picker */}
              <VaultSelector selected={selectedVault} onChange={setSelectedVault} />

              {/* Stats cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Total Value Locked', value: loading ? '—' : `$${tvl}`, sub: 'across all savers' },
                  { label: 'Your Balance', value: balanceHidden ? hidden : `$${usdcBalance}`, sub: `in ${vaultLabel}` },
                  { label: 'Local Value', value: balanceHidden ? hidden : `${selectedCurrencyData?.flag} ${localBalance}`, sub: selectedCurrency },
                ].map(card => (
                  <div key={card.label} style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                    <p className="section-label" style={{ marginBottom: '8px' }}>{card.label}</p>
                    <p style={{ fontSize: '20px', color: '#111827', fontWeight: 700, marginBottom: '2px', fontFamily: 'Inter, sans-serif' }}>{card.value}</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* APY history chart — switches colour when vault changes */}
              <APYChart vaultKey={selectedVault} />
            </div>
          )}

          {/* ══ DisciplineVault ═══════════════════════════════════════════ */}
          {activeTab === 'DisciplineVault' && <DisciplineVaultPanel />}

          {/* ══ Leaderboard ═══════════════════════════════════════════════ */}
          {activeTab === 'Leaderboard' && <Leaderboard />}


        </div>
      </div>

      {showDeposit && (
        <DepositModal
          onClose={() => setShowDeposit(false)}
          apy={parseFloat(apy)}
          vaultKey={selectedVault}
        />
      )}
      {showRedeem && <RedeemModal onClose={() => setShowRedeem(false)} />}
    </div>
  )
}

function App() {
  const { isConnected } = useAccount()
  const [started, setStarted] = useState(() => localStorage.getItem('holdfirm_started') === 'true')
  const [showWizard, setShowWizard] = useState(() =>
    isConnected &&
    localStorage.getItem('holdfirm_wizard_done') !== 'true' &&
    localStorage.getItem('holdfirm_started') !== 'true'
  )

  function handleWizardComplete() {
    localStorage.setItem('holdfirm_wizard_done', 'true')
    localStorage.setItem('holdfirm_started', 'true')
    setShowWizard(false)
    setStarted(true)
  }

  function handleStart() {
    if (localStorage.getItem('holdfirm_wizard_done') === 'true') {
      localStorage.setItem('holdfirm_started', 'true')
      setStarted(true)
    } else {
      setShowWizard(true)
    }
  }

  useEffect(() => {
    if (!isConnected) {
      localStorage.removeItem('holdfirm_started')
      setStarted(false)
    }
  }, [isConnected])

  if (!isConnected || !started) {
    return (
      <>
        <LandingPage onStart={handleStart} />
        {showWizard && <OnboardingWizard onComplete={handleWizardComplete} />}
      </>
    )
  }

  return <Dashboard />
}

export default App
