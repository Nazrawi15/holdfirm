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
import { useUserHistory } from '@yo-protocol/react'

const TABS = ['NestSave', 'DisciplineVault', 'Leaderboard'] as const
type Tab = typeof TABS[number]

// ── Warm Obsidian Design System ──────────────────────────────────────────────
export const theme = {
  // Backgrounds
  pageBg: '#fdf8f3',
  cardBg: '#fefcf9',
  cardAlt: '#faf6f0',
  // Sidebar / dark elements
  dark: '#1c1917',
  darkMid: '#292524',
  darkLight: '#44403c',
  // Text
  text: '#1c1917',
  textSub: '#44403c',
  textMuted: '#78716c',
  textFaint: '#a8a29e',
  // Accents
  amber: '#f59e0b',
  amberDark: '#d97706',
  amberLight: '#fef3c7',
  amberBorder: '#fde68a',
  emerald: '#10b981',
  emeraldDark: '#059669',
  emeraldLight: '#d1fae5',
  emeraldBorder: '#6ee7b7',
  // Borders
  border: '#e8e0d8',
  borderLight: '#f0ebe3',
  // Shadows
  shadow: '0 1px 4px rgba(28,25,23,0.06), 0 2px 8px rgba(28,25,23,0.04)',
  shadowMd: '0 4px 16px rgba(28,25,23,0.08), 0 2px 6px rgba(28,25,23,0.04)',
}

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 17px; }
  body {
    background: #fdf8f3;
    color: #1c1917;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    line-height: 1.5;
  }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #fdf8f3; }
  ::-webkit-scrollbar-thumb { background: #d6cdc3; border-radius: 3px; }
  .serif { font-family: 'Instrument Serif', Georgia, serif; }
  .mono { font-family: 'DM Mono', monospace; font-weight: 500; }
  .btn-primary {
    background: #1c1917; color: #fdf8f3; border: none; border-radius: 10px;
    padding: 11px 24px; font-size: 14px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
    transition: background 0.15s ease, transform 0.1s ease;
  }
  .btn-primary:hover { background: #292524; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }
  .btn-amber {
    background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; border: none; border-radius: 10px;
    padding: 11px 24px; font-size: 14px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
    transition: opacity 0.15s ease, transform 0.1s ease;
    box-shadow: 0 4px 14px rgba(245,158,11,0.35);
  }
  .btn-amber:hover { opacity: 0.92; transform: translateY(-1px); }
  .btn-emerald {
    background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; border-radius: 10px;
    padding: 11px 24px; font-size: 14px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
    transition: opacity 0.15s ease, transform 0.1s ease;
    box-shadow: 0 4px 14px rgba(16,185,129,0.3);
  }
  .btn-emerald:hover { opacity: 0.92; transform: translateY(-1px); }
  .btn-outline {
    background: transparent; color: #44403c;
    border: 1.5px solid #d6cdc3; border-radius: 10px;
    padding: 11px 24px; font-size: 14px; font-weight: 500;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .btn-outline:hover { border-color: #a8a29e; background: #faf6f0; }
  .card {
    background: #fefcf9;
    border: 1px solid #e8e0d8;
    border-radius: 14px;
    box-shadow: 0 1px 4px rgba(28,25,23,0.05), 0 2px 8px rgba(28,25,23,0.03);
  }
  .card-hover {
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }
  .card-hover:hover {
    box-shadow: 0 4px 20px rgba(28,25,23,0.1), 0 2px 8px rgba(28,25,23,0.06);
    transform: translateY(-2px);
  }
  .tab-item {
    padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer;
    font-size: 15px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all 0.15s ease; background: transparent; color: #78716c; white-space: nowrap;
  }
  .tab-item:hover { background: #f0ebe3; color: #44403c; }
  .tab-item.active { background: #1c1917; color: #fdf8f3; font-weight: 600; box-shadow: 0 2px 8px rgba(28,25,23,0.2); }
  .section-label { font-size: 12px; font-weight: 800; letter-spacing: 0.7px; text-transform: uppercase; color: #44403c; font-family: 'Plus Jakarta Sans', sans-serif; }
  /* Grain texture overlay */
  .grain::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    border-radius: inherit;
    pointer-events: none;
    opacity: 0.4;
  }
  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
  .fade-in   { animation: fadeIn 0.5s ease forwards; }
  .fade-in-2 { animation: fadeIn 0.5s ease 0.1s forwards; opacity:0; }
  .fade-in-3 { animation: fadeIn 0.5s ease 0.2s forwards; opacity:0; }
  .fade-in-4 { animation: fadeIn 0.5s ease 0.3s forwards; opacity:0; }
  input { font-family: 'Plus Jakarta Sans', sans-serif; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
  @media (max-width: 640px) {
    .hf-nav-stats { display: none !important; }
    .hf-page { padding: 14px 12px !important; }
    .hf-currency-grid { grid-template-columns: 1fr !important; }
    .hf-stats-grid { grid-template-columns: 1fr 1fr !important; }
    .hf-tabs { gap: 2px !important; }
    .hf-tab-item { padding: 6px 10px !important; font-size: 11px !important; }
    .hf-content { padding: 18px !important; }
    .hf-vault-cards { flex-direction: column !important; }
  }
`

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
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

function HoldFirmLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#1c1917" />
      <path d="M8 10h3v4.5H16V10h3v12h-3v-4.8h-5V22H8V10z" fill="#fdf8f3" />
      <circle cx="23" cy="19" r="2.2" fill="none" stroke="#f59e0b" strokeWidth="1.8" />
      <path d="M23 16.5v-.8M23 21.5v.8M20.5 19h-.8M25.3 19h.8" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

// ── Dashboard Mockup for landing page ───────────────────────────────────────
function DashboardMockup() {
  return (
    <div style={{ width: '100%', maxWidth: '540px', background: '#fefcf9', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e8e0d8', boxShadow: '0 32px 80px rgba(28,25,23,0.18), 0 8px 24px rgba(28,25,23,0.08)', animation: 'float 6s ease-in-out infinite' }}>
      {/* Mock titlebar */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0ebe3', display: 'flex', alignItems: 'center', gap: '8px', background: '#faf6f0' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, height: '7px', background: '#e8e0d8', borderRadius: '4px', margin: '0 8px' }} />
      </div>
      {/* Mock navbar */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #f0ebe3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fefcf9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '22px', height: '22px', background: '#1c1917', borderRadius: '5px' }} />
          <div style={{ width: '65px', height: '7px', background: '#e8e0d8', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {[50,38,46].map((w,i) => <div key={i} style={{ width: `${w}px`, height: '6px', background: '#f0ebe3', borderRadius: '4px' }} />)}
        </div>
        <div style={{ width: '28px', height: '28px', background: '#f0ebe3', borderRadius: '50%' }} />
      </div>
      {/* Mock balance card */}
      <div style={{ margin: '16px', borderRadius: '14px', padding: '20px', background: 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.8px', marginBottom: '8px' }}>TOTAL SAVINGS</div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: '4px' }}>$2,840.50</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginBottom: '4px' }}>🇹🇷 TRY 92,341.20</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Earning <span style={{ color: '#fff', fontWeight: 700 }}>4.92% APY</span></div>
      </div>
      {/* Mock stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '0 16px 12px' }}>
        {[{l:'TVL',v:'$39M+'},{l:'APY',v:'4.92%'},{l:'Lock',v:'60d'}].map(c => (
          <div key={c.l} style={{ background: '#faf6f0', borderRadius: '10px', padding: '10px 12px', border: '1px solid #f0ebe3' }}>
            <div style={{ fontSize: '9px', color: '#a8a29e', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '4px' }}>{c.l}</div>
            <div style={{ fontSize: '14px', color: '#1c1917', fontWeight: 700 }}>{c.v}</div>
          </div>
        ))}
      </div>
      {/* Mock tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '0 16px 12px' }}>
        {['NestSave','DisciplineVault','Leaderboard'].map((t,i) => (
          <div key={t} style={{ padding: '5px 10px', borderRadius: '6px', background: i === 1 ? '#1c1917' : 'transparent', border: i === 1 ? 'none' : 'none' }}>
            <span style={{ fontSize: '10px', color: i === 1 ? '#fdf8f3' : '#a8a29e', fontWeight: i === 1 ? 600 : 400 }}>{t}</span>
          </div>
        ))}
      </div>
      {/* Mock discipline jackpot */}
      <div style={{ margin: '0 16px 16px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '10px', padding: '12px 14px', border: '1px solid #fde68a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '9px', color: '#b45309', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '4px' }}>🎰 DISCIPLINE JACKPOT</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1c1917' }}>0.0021 <span style={{ fontSize: '10px', color: '#78716c', fontWeight: 400 }}>yoUSD</span></div>
          </div>
          <div style={{ fontSize: '22px' }}>💎</div>
        </div>
      </div>
    </div>
  )
}

// ── Landing Page ─────────────────────────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: '1px solid #e8e0d8', borderRadius: '12px', overflow: 'hidden', background: '#fefcf9', marginBottom: '8px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'left', gap: '16px' }}
      >
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#1c1917', lineHeight: 1.4 }}>{question}</span>
        <span style={{ fontSize: '18px', color: '#10b981', fontWeight: 700, flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block' }}>+</span>
      </button>
      {open && (
        <div style={{ padding: '0 22px 18px', borderTop: '1px solid #f0ebe3' }}>
          <p style={{ fontSize: '14px', color: '#44403c', lineHeight: 1.75, margin: '14px 0 0', fontWeight: 500 }}>{answer}</p>
        </div>
      )}
    </div>
  )
}

function LandingPage({ onStart }: { onStart: () => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#fdf8f3' }}>
      <style>{globalStyles}</style>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(253,248,243,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e8e0d8', padding: '0 48px', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HoldFirmLogo size={32} />
          <span style={{ fontSize: '17px', fontWeight: 700, color: '#1c1917', letterSpacing: '-0.3px' }}>HoldFirm</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '20px' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: '11px', color: '#065f46', fontWeight: 700 }}>Live on Base</span>
          </div>
          <ConnectButton />
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '80px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '72px', alignItems: 'center', minHeight: 'calc(100vh - 62px)' }}>
        <div>
          {/* Badge */}
          <div className={mounted ? 'fade-in' : ''} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '20px', marginBottom: '28px' }}>
            <span style={{ fontSize: '13px', color: '#92400e', fontWeight: 700 }}>YO Protocol · 4.92% APY · Base Mainnet</span>
          </div>

          {/* Headline */}
          <h1 className={`serif ${mounted ? 'fade-in-2' : ''}`} style={{ fontSize: 'clamp(40px, 4.5vw, 68px)', lineHeight: 1.06, color: '#1c1917', marginBottom: '24px', fontWeight: 400, letterSpacing: '-2px' }}>
            Your savings<br />
            shouldn't{' '}
            <em style={{ color: '#f59e0b', fontStyle: 'italic', position: 'relative' }}>
              shrink
              <svg style={{ position: 'absolute', bottom: '-4px', left: 0, width: '100%' }} viewBox="0 0 200 8" fill="none">
                <path d="M2 6 C50 2, 150 2, 198 6" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5"/>
              </svg>
            </em>
            <br />
            <em style={{ color: '#10b981', fontStyle: 'italic' }}>every year.</em>
          </h1>

          <p className={mounted ? 'fade-in-3' : ''} style={{ fontSize: '17px', color: '#78716c', lineHeight: 1.75, marginBottom: '14px', maxWidth: '480px' }}>
            1.4 billion people live in high-inflation economies. HoldFirm lets them save in dollars or euros, earn real yield, and collect penalties from people who break their savings commitment.
          </p>
          <p className={mounted ? 'fade-in-3' : ''} style={{ fontSize: '13px', color: '#a8a29e', marginBottom: '40px' }}>
            Non-custodial · Smart contract on Base · No KYC
          </p>

          {/* CTAs */}
          <div className={mounted ? 'fade-in-4' : ''} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
            <ConnectButton.Custom>
              {({ account, openConnectModal, mounted: m }) => {
                if (!m) return null
                return (
                  <button className="btn-amber" onClick={account ? onStart : openConnectModal} style={{ padding: '13px 32px', fontSize: '15px' }}>
                    {account ? 'Open Dashboard →' : 'Get Started →'}
                  </button>
                )
              }}
            </ConnectButton.Custom>
            <a href="https://basescan.org/address/0x85E535Af5663426D38461B2e74d34FafA8a7472a" target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#78716c', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View contract ↗
            </a>
          </div>

          {/* Stats row */}
          <div className={mounted ? 'fade-in-4' : ''} style={{ display: 'flex', gap: '32px', paddingTop: '32px', borderTop: '1px solid #e8e0d8', flexWrap: 'wrap' }}>
            {[
              { label: 'APY', value: '4.92%', color: '#10b981' },
              { label: 'TVL', value: '$39M+', color: '#1c1917' },
              { label: 'Countries', value: '12', color: '#1c1917' },
              { label: 'Contract', value: 'Open Source', color: '#f59e0b' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '22px', color: s.color, fontWeight: 800, lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#a8a29e', fontWeight: 600, letterSpacing: '0.5px', marginTop: '4px', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className={mounted ? 'fade-in-3' : ''} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <DashboardMockup />
        </div>
      </div>

      {/* Feature section */}
      <div style={{ background: '#1c1917' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '80px 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 className="serif" style={{ fontSize: '38px', color: '#fdf8f3', fontWeight: 400, letterSpacing: '-0.8px', marginBottom: '12px' }}>
              Everything you need to save smarter
            </h2>
            <p style={{ fontSize: '16px', color: '#78716c', maxWidth: '480px', margin: '0 auto' }}>
              Three savings modes, all built on Base mainnet. Non-custodial. Verified.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', backgroundColor: '#292524', borderRadius: '16px', overflow: 'hidden', border: '1px solid #292524', marginBottom: '64px' }}>
            {[
              { icon: '📉', title: 'Beat Inflation', desc: 'Save in USDC or EURC and earn real APY. While your local currency loses value, your savings grow.', tag: '12 currencies', color: '#10b981' },
              { icon: '🔒', title: 'DisciplineVault', desc: 'Lock for 30–90 days. Early withdrawals pay a 4.5% penalty — automatically redistributed to committed savers.', tag: 'Smart contract enforced', color: '#f59e0b' },
              { icon: '🤖', title: 'AI Strategy', desc: 'Answer 4 questions. Get a personalized savings plan powered by Llama 3.3 — in seconds.', tag: 'Groq · Llama 3.3', color: '#a78bfa' },
            ].map(item => (
              <div key={item.title} style={{ backgroundColor: '#1c1917', padding: '36px 32px' }}>
                <div style={{ fontSize: '28px', marginBottom: '16px' }}>{item.icon}</div>
                <div style={{ color: item.color, fontWeight: 700, fontSize: '16px', marginBottom: '10px' }}>{item.title}</div>
                <div style={{ color: '#a8a29e', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>{item.desc}</div>
                <div style={{ display: 'inline-block', padding: '3px 10px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '20px', fontSize: '11px', color: '#78716c', fontWeight: 500 }}>{item.tag}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #292524', paddingTop: '40px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: '#78716c', fontWeight: 600 }}>Supporting savers in</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['🇳🇬','🇹🇷','🇦🇷','🇵🇰','🇪🇬','🇬🇭','🇪🇹','🇺🇦','🇷🇴','🇮🇩','🇬🇪','🇦🇴'].map(f => (
                <span key={f} style={{ fontSize: '22px' }}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div style={{ background: '#fdf8f3', borderTop: '1px solid #e8e0d8' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '80px 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 className="serif" style={{ fontSize: '38px', color: '#1c1917', fontWeight: 400, letterSpacing: '-0.8px', marginBottom: '12px' }}>
              Frequently asked questions
            </h2>
            <p style={{ fontSize: '16px', color: '#78716c' }}>Everything you need to know before saving with HoldFirm.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[
              { q: 'Where does the yield come from?', a: 'Your USDC or EURC is deposited into YO Protocol vaults — audited, onchain yield infrastructure built on Base. The current APY is around 4.92%, generated from real DeFi activity, not token emissions.' },
              { q: 'What happens if I withdraw early from DisciplineVault?', a: 'You pay a 4.5% penalty on your shares. That penalty is automatically redistributed to everyone who stayed locked. Your principal minus the penalty is returned instantly to your wallet.' },
              { q: 'Is HoldFirm audited?', a: 'YO Protocol vaults are audited infrastructure. The DisciplineVault contract is unaudited — only deposit what you can afford to lose. The contract is open source and visible on Basescan.' },
              { q: 'Who controls my funds?', a: 'Nobody. HoldFirm is fully non-custodial. Your funds are held by smart contracts on Base mainnet, not by us. We have no admin keys, no ability to pause withdrawals, and no access to your money.' },
              { q: 'What is the difference between NestSave and DisciplineVault?', a: 'NestSave is flexible — deposit and withdraw anytime, earn ~4.92% APY. DisciplineVault locks your funds for 30, 60, or 90 days. Early withdrawers pay a penalty that goes to committed savers, so patient savers earn more.' },
              { q: 'Can I save in euros instead of dollars?', a: 'Yes. HoldFirm supports both yoUSD (USDC savings) and yoEUR (EURC savings). Choose the currency that best protects you from your local inflation.' },
              { q: 'Do I need KYC or an account?', a: 'No. HoldFirm requires only a Web3 wallet like MetaMask. No email, no ID verification, no account creation. Connect your wallet and start saving in seconds.' },
              { q: 'What blockchain is HoldFirm on?', a: 'Base mainnet — an Ethereum L2 built by Coinbase. Transactions are fast, gas fees are low (typically under $0.01), and the network is backed by Coinbase infrastructure.' },
              { q: 'What is the minimum deposit?', a: 'There is no minimum deposit set by HoldFirm. However, very small deposits may not be economical after gas fees. We recommend at least $10 to start.' },
              { q: 'How do I claim my penalty rewards from DisciplineVault?', a: 'When other savers withdraw early, their penalties are automatically allocated to your position. You can claim them anytime by clicking "Claim Rewards" in the DisciplineVault tab.' },
            ].map((item, i) => (
              <FAQItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>

          {/* Contact */}
          <div style={{ marginTop: '56px', padding: '32px', background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(16,185,129,0.06))', border: '1px solid #e8e0d8', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>💬</div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1c1917', marginBottom: '8px' }}>Still have questions?</h3>
            <p style={{ fontSize: '15px', color: '#78716c', marginBottom: '20px', fontWeight: 500 }}>
              Reach out directly — we're happy to help.
            </p>
            <a
              href="https://t.me/Nasrohassen"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: '#1c1917', color: '#fdf8f3', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span>✈️</span> Contact us on Telegram @Nasrohassen
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}


// ── Recent Activity Component ────────────────────────────────────────────────
const YOUSD_VAULT = '0x0000000f2eb9f69274678c76222b35eec7588a65' as const

function RecentActivity() {
  const { address } = useAccount()
  const { history, isLoading } = useUserHistory(YOUSD_VAULT, address, { limit: 5, enabled: !!address })

  if (isLoading) {
    return (
      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#faf6f0', borderRadius: '10px', border: '1px solid #f0ebe3', textAlign: 'center' }}>
        <div style={{ width: '18px', height: '18px', border: '2px solid #e8e0d8', borderTopColor: '#10b981', borderRadius: '50%', animation: 'hf-spin 0.75s linear infinite', margin: '0 auto' }} />
        <style>{`@keyframes hf-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // console.log('YO history:', history)
  const transactions = history?.slice(0, 5) ?? []

  if (!address || transactions.length === 0) return null

  return (
    <div style={{ marginTop: '24px' }}>
      <p className="section-label" style={{ marginBottom: '12px' }}>Recent Activity</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {transactions.map((tx: any, i: number) => {
          const isDeposit = tx.type === 'deposit'
          const amount = tx.assets?.formatted ?? '—'
          const date = tx.blockTimestamp ? new Date(Number(tx.blockTimestamp) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
          return (
            <a key={i} href={`https://basescan.org/tx/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#faf6f0', borderRadius: '10px', border: '1px solid #f0ebe3', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isDeposit ? '#d1fae5' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                  {isDeposit ? '↑' : '↓'}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#1c1917', margin: 0 }}>{isDeposit ? 'Deposit' : 'Withdrawal'}</p>
                  <p style={{ fontSize: '12px', color: '#78716c', margin: 0, fontWeight: 500 }}>{date}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', fontWeight: 800, color: isDeposit ? '#059669' : '#d97706', margin: 0, fontFamily: "'DM Mono', monospace" }}>
                  {isDeposit ? '+' : '-'}{amount}
                </p>
                <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0, fontWeight: 500 }}>USDC</p>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────────────────────────
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
  const EXTRA_FLAGS: Record<string, string> = { USD: '💵', EUR: '💶' }
  const EXTRA_NAMES: Record<string, string> = { USD: 'USD', EUR: 'EUR' }
  const displayFlag = selectedCurrencyData?.flag ?? EXTRA_FLAGS[selectedCurrency] ?? ''
  const displayName = selectedCurrencyData?.name ?? EXTRA_NAMES[selectedCurrency] ?? selectedCurrency
  const hidden = '••••••'
  const vaultLabel = selectedVault === 'yoEUR' ? 'EURC' : 'USDC'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fdf8f3', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{globalStyles}</style>

      {/* Navbar */}
      <nav style={{ backgroundColor: '#fefcf9', borderBottom: '1px solid #e8e0d8', padding: '0 32px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(28,25,23,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HoldFirmLogo size={28} />
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1c1917', letterSpacing: '-0.3px' }}>HoldFirm</span>
        </div>
        <div className="hf-nav-stats" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {[
            { label: 'APY', value: loading ? '—' : `${apy}%`, color: '#10b981' },
            { label: 'TVL', value: loading ? '—' : `$${tvl}`, color: '#1c1917' },
            { label: 'Balance', value: balanceHidden ? hidden : `$${usdcBalance}`, color: '#1c1917' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '13px', color: '#78716c', fontWeight: 500 }}>{s.label}</span>
              <span style={{ fontSize: '14px', color: s.color, fontWeight: 800, fontFamily: "'DM Mono', monospace" }}>{s.value}</span>
            </div>
          ))}
          <div style={{ width: '1px', height: '18px', backgroundColor: '#e8e0d8' }} />
          <ConnectButton />
        </div>
      </nav>

      <div className="hf-page" style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' }}>

        {/* Balance card — gradient hero */}
        <div style={{ borderRadius: '18px', padding: '28px 32px', marginBottom: '16px', background: 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(245,158,11,0.25), 0 4px 16px rgba(16,185,129,0.15)' }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-60px', right: '80px', width: '160px', height: '160px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '12px' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>Total Savings</p>
                <button
                  onClick={() => setBalanceHidden(h => !h)}
                  title={balanceHidden ? 'Show balance' : 'Hide balance'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, background: 'rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 0, transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)' }}
                >
                  {balanceHidden ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '52px', fontWeight: 800, color: '#ffffff', letterSpacing: '-2.5px', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif", filter: balanceHidden ? 'blur(10px)' : 'none', userSelect: balanceHidden ? 'none' : 'auto', transition: 'filter 0.25s ease' }}>
                  ${usdcBalance}
                </span>
                <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{vaultLabel}</span>
              </div>
              <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.95)', fontWeight: 700, marginBottom: '6px', filter: balanceHidden ? 'blur(10px)' : 'none', userSelect: balanceHidden ? 'none' : 'auto', transition: 'filter 0.25s ease' }}>
                {displayFlag} {displayName} {localBalance}
              </p>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                Earning <span style={{ color: '#ffffff', fontWeight: 700 }}>{apy}% APY</span> · Protected from inflation
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <button
                onClick={() => setShowDeposit(true)}
                style={{ padding: '10px 22px', fontSize: '14px', fontWeight: 700, background: 'rgba(255,255,255,0.95)', color: '#1c1917', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'background 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#ffffff')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.95)')}
              >↑ Deposit</button>
              <button
                onClick={() => setShowRedeem(true)}
                style={{ padding: '10px 22px', fontSize: '14px', fontWeight: 600, background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              >↓ Withdraw</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="hf-tabs" style={{ display: 'flex', gap: '4px', marginBottom: '14px', backgroundColor: '#f0ebe3', borderRadius: '12px', padding: '4px', border: '1px solid #e8e0d8' }}>
          {TABS.map(tab => (
            <button key={tab} className={`tab-item hf-tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => handleTabChange(tab)}>
              {tab === 'NestSave' ? '💰 NestSave'
                : tab === 'DisciplineVault' ? '🏦 DisciplineVault'
                : '🏆 Leaderboard'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="card hf-content" style={{ padding: '32px', marginBottom: '16px' }}>

          {/* NestSave */}
          {activeTab === 'NestSave' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid #f0ebe3' }}>
                <div>
                  <h2 className="serif" style={{ fontSize: '30px', color: '#1c1917', fontWeight: 400, marginBottom: '6px', letterSpacing: '-0.5px' }}>NestSave</h2>
                  <p style={{ fontSize: '16px', color: '#44403c', fontWeight: 500 }}>Your savings earning yield every day. Choose your currency.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '32px', color: '#059669', fontWeight: 800, lineHeight: 1, fontFamily: "'DM Mono', monospace" }}>{loading ? '—' : `${apy}%`}</div>
                  <div className="section-label" style={{ marginTop: '3px' }}>LIVE APY</div>
                </div>
              </div>

              <VaultSelector selected={selectedVault} onChange={setSelectedVault} />

              <div className="hf-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Total Value Locked', value: loading ? '—' : `$${tvl}`, sub: 'across all savers' },
                  { label: 'Your Balance', value: balanceHidden ? hidden : `$${usdcBalance}`, sub: `in ${vaultLabel}` },
                  { label: 'Local Value', value: balanceHidden ? hidden : `${displayFlag} ${localBalance}`, sub: selectedCurrency },
                ].map(card => (
                  <div key={card.label} style={{ padding: '18px', backgroundColor: '#faf6f0', borderRadius: '12px', border: '1px solid #e8e0d8' }}>
                    <p className="section-label" style={{ marginBottom: '8px' }}>{card.label}</p>
                    <p style={{ fontSize: '24px', color: '#1c1917', fontWeight: 800, marginBottom: '4px', fontFamily: "'DM Mono', monospace" }}>{card.value}</p>
                    <p style={{ fontSize: '13px', color: '#78716c', fontWeight: 600 }}>{card.sub}</p>
                  </div>
                ))}
              </div>

              <APYChart vaultKey={selectedVault} />
              <RecentActivity />
            </div>
          )}

          {activeTab === 'DisciplineVault' && <DisciplineVaultPanel />}
          {activeTab === 'Leaderboard' && <Leaderboard />}
        </div>

        {/* Currency + inflation — below tabs */}
        <div className="hf-currency-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
          <div className="card" style={{ padding: '22px' }}>
            <p className="section-label" style={{ marginBottom: '12px' }}>Local Currency</p>
            <CurrencySelector selected={selectedCurrency} onChange={setSelectedCurrency} />
          </div>
          {selectedCurrencyData && (
            <div className="card" style={{ padding: '22px' }}>
              <InflationCounter usdcBalance={usdcBalanceNumber} inflationRate={selectedCurrencyData.inflation} currencyCode={selectedCurrency} currencyRate={rate} />
            </div>
          )}
        </div>
      </div>

      {showDeposit && (
        <DepositModal onClose={() => setShowDeposit(false)} apy={parseFloat(apy)} vaultKey={selectedVault} />
      )}
      {showRedeem && <RedeemModal onClose={() => setShowRedeem(false)} />}
    </div>
  )
}

// ── App root ─────────────────────────────────────────────────────────────────
function App() {
  const { isConnected } = useAccount()
  const [showDashboard, setShowDashboard] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    if (!isConnected) {
      setShowDashboard(false)
      setShowWizard(false)
    }
  }, [isConnected])

  if (showDashboard && isConnected) {
    return <Dashboard />
  }

  return (
    <div>
      <LandingPage onStart={() => {
        if (isConnected) setShowWizard(true)
      }} />
      {showWizard && isConnected && (
        <OnboardingWizard onComplete={() => {
          setShowWizard(false)
          setShowDashboard(true)
        }} />
      )}
    </div>
  )
}

export default App
