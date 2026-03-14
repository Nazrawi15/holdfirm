import { useState } from 'react'

const CURRENCIES = [
  { code: 'TRY', flag: '🇹🇷', country: 'Turkey', inflation: '65%' },
  { code: 'ARS', flag: '🇦🇷', country: 'Argentina', inflation: '211%' },
  { code: 'NGN', flag: '🇳🇬', country: 'Nigeria', inflation: '28.9%' },
  { code: 'PKR', flag: '🇵🇰', country: 'Pakistan', inflation: '29%' },
  { code: 'EGP', flag: '🇪🇬', country: 'Egypt', inflation: '35%' },
  { code: 'GHS', flag: '🇬🇭', country: 'Ghana', inflation: '23%' },
  { code: 'ETB', flag: '🇪🇹', country: 'Ethiopia', inflation: '30.2%' },
  { code: 'UAH', flag: '🇺🇦', country: 'Ukraine', inflation: '26.6%' },
  { code: 'IDR', flag: '🇮🇩', country: 'Indonesia', inflation: '2.8%' },
  { code: 'RON', flag: '🇷🇴', country: 'Romania', inflation: '10.4%' },
  { code: 'GEL', flag: '🇬🇪', country: 'Georgia', inflation: '9.5%' },
  { code: 'AOA', flag: '🇦🇴', country: 'Angola', inflation: '20%' },
  { code: 'USD', flag: '🌍', country: 'Other / Global', inflation: 'varies' },
]

const INFLATION_EXPERIENCES = [
  { id: 'badly', label: 'Yes, badly', desc: 'My savings lost significant value' },
  { id: 'little', label: 'A little', desc: 'I noticed prices going up' },
  { id: 'notyet', label: 'Not yet', desc: 'But I want to be prepared' },
]

const GOALS = [
  { id: 'protect', label: 'Protect my savings', desc: 'Stop inflation eating my money' },
  { id: 'grow', label: 'Grow my wealth', desc: 'Earn as much yield as possible' },
  { id: 'goal', label: 'Save for something specific', desc: 'House, education, emergency fund' },
  { id: 'discipline', label: 'Build saving discipline', desc: 'Commit and stop impulse spending' },
]

const LOCK_PREFS = [
  { id: 'flexible', label: 'Flexible', desc: 'I might need it anytime' },
  { id: '30', label: '30 days', desc: 'Short commitment' },
  { id: '60', label: '60 days', desc: 'Medium commitment' },
  { id: '90', label: '90 days', desc: 'Maximum rewards' },
]

type Step = 'currency' | 'experience' | 'goal' | 'lock' | 'loading' | 'result'

interface WizardState {
  currency: typeof CURRENCIES[0] | null
  experience: typeof INFLATION_EXPERIENCES[0] | null
  goal: typeof GOALS[0] | null
  lockPref: typeof LOCK_PREFS[0] | null
}

const wStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
  @keyframes wiz-spin { to { transform: rotate(360deg); } }
  @keyframes wiz-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes wiz-pulse { 0%,100% { opacity:0.6; transform:scale(1); } 50% { opacity:0; transform:scale(2.2); } }
  .wiz-opt {
    width: 100%;
    padding: 14px 16px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
    font-family: 'Inter', sans-serif;
  }
  .wiz-opt:hover {
    border-color: rgba(74,222,128,0.4);
    background: rgba(74,222,128,0.05);
  }
  .wiz-opt.selected {
    border-color: #4ade80;
    border-width: 1.5px;
    background: rgba(74,222,128,0.08);
  }
  .wiz-dd-item {
    width: 100%;
    padding: 11px 16px;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: transparent;
    cursor: pointer;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: background 0.1s ease;
    font-family: 'Inter', sans-serif;
  }
  .wiz-dd-item:hover { background: rgba(255,255,255,0.05); }
  .wiz-dd-item:last-child { border-bottom: none; }
`

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>('currency')
  const [state, setState] = useState<WizardState>({ currency: null, experience: null, goal: null, lockPref: null })
  const [recommendation, setRecommendation] = useState('')
  const [error, setError] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  async function getRecommendation(wizardState: WizardState) {
    setStep('loading')
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 300,
          messages: [
            {
              role: 'system',
              content: `You are a warm, empathetic DeFi savings advisor for HoldFirm — a savings app for people facing inflation or currency risk anywhere in the world. You give short, personal, actionable advice. Never use bullet points. Always write in flowing paragraphs.`,
            },
            {
              role: 'user',
              content: `A user answered 4 questions:
1. Local currency: ${wizardState.currency?.country} (${wizardState.currency?.code}, inflation: ${wizardState.currency?.inflation})
2. Inflation experience: ${wizardState.experience?.label} — ${wizardState.experience?.desc}
3. Goal: ${wizardState.goal?.label} — ${wizardState.goal?.desc}
4. Lock preference: ${wizardState.lockPref?.label} — ${wizardState.lockPref?.desc}

HoldFirm modes:
- NestSave: Simple USDC or EURC savings at 4-5% APY. Best for basic inflation protection with full flexibility.
- DisciplineVault: Onchain lock for 30/60/90 days. Early withdrawers pay 4.5% penalty redistributed to committed savers. Best for discipline + earning from others.

Write exactly 3 short paragraphs under 220 words:
- Para 1: Acknowledge their financial situation emotionally — works for anyone globally, not just specific countries.
- Para 2: Recommend the single best HoldFirm mode and explain why it fits their answers.
- Para 3: Paint a vivid picture of what their savings look like in 90 days if they start today.`,
            },
          ],
        }),
      })
      const data = await response.json()
      setRecommendation(data.choices?.[0]?.message?.content ?? 'Unable to generate recommendation.')
      setStep('result')
    } catch {
      setError('Could not connect. Please try again.')
      setStep('result')
    }
  }

  const progressSteps = ['currency', 'experience', 'goal', 'lock']
  const currentIndex = progressSteps.indexOf(step)

  const stepTitles: Record<string, { title: string; sub: string }> = {
    currency: { title: 'What\'s your local currency?', sub: 'HoldFirm works everywhere — pick the closest match' },
    experience: { title: 'Has inflation hurt your savings?', sub: state.currency?.code === 'USD' ? 'Currency risk affects everyone differently' : `Inflation in ${state.currency?.country ?? 'your region'} is ${state.currency?.inflation}` },
    goal: { title: 'What\'s your main savings goal?', sub: 'We\'ll recommend the best saving mode for you' },
    lock: { title: 'How long can you commit?', sub: 'Longer locks earn more from the penalty pool' },
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(12px)' }}>
      <style>{wStyles}</style>

      <div style={{ backgroundColor: '#0d1117', borderRadius: '20px', width: '100%', maxWidth: '500px', maxHeight: '92vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,222,128,0.05)', fontFamily: 'Inter, sans-serif', animation: 'wiz-up 0.35s ease forwards', position: 'relative', overflow: 'hidden' }}>

        {/* Subtle green glow top */}
        <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'radial-gradient(ellipse, rgba(74,222,128,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: step !== 'loading' && step !== 'result' ? '16px' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>🤖</div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>AI Strategy Advisor</span>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>Powered by Llama 3.3</div>
              </div>
            </div>
            {currentIndex >= 0 && (
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                {currentIndex + 1} / 4
              </span>
            )}
          </div>

          {/* Progress bar */}
          {currentIndex >= 0 && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {progressSteps.map((s, i) => (
                <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= currentIndex ? '#4ade80' : 'rgba(255,255,255,0.08)', transition: 'background 0.3s ease' }} />
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>

          {/* Step heading */}
          {currentIndex >= 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: '0 0 4px 0', fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.3px' }}>
                {stepTitles[step]?.title}
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                {stepTitles[step]?.sub}
              </p>
            </div>
          )}

          {/* STEP 1: Currency picker */}
          {step === 'currency' && (
            <div>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: `1px solid ${state.currency ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.1)'}`, background: state.currency ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {state.currency ? (
                      <>
                        <span style={{ fontSize: '22px' }}>{state.currency.flag}</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{state.currency.country}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                            {state.currency.code === 'USD' ? 'Save in USD · works globally' : `${state.currency.inflation} annual inflation`}
                          </div>
                        </div>
                      </>
                    ) : (
                      <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>Select your local currency...</span>
                    )}
                  </div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{dropdownOpen ? '▲' : '▼'}</span>
                </button>

                {dropdownOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100, backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.5)', maxHeight: '280px', overflowY: 'auto' }}>
                    {CURRENCIES.map(c => (
                      <button
                        key={c.code}
                        className="wiz-dd-item"
                        onClick={() => { setState(s => ({ ...s, currency: c })); setDropdownOpen(false) }}
                      >
                        <span style={{ fontSize: '20px' }}>{c.flag}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>{c.country}</div>
                          {c.code === 'USD' && <div style={{ fontSize: '11px', color: 'rgba(74,222,128,0.7)' }}>HoldFirm works everywhere</div>}
                        </div>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                          {c.code === 'USD' ? 'Global' : `${c.inflation} inflation`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {state.currency && (
                <button
                  onClick={() => setStep('experience')}
                  style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', background: '#4ade80', color: '#0d1117', fontWeight: 700, fontSize: '15px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.15s' }}
                >
                  Continue →
                </button>
              )}

              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: '12px', lineHeight: 1.5 }}>
                Don't see your currency? Choose "Other / Global" — HoldFirm works everywhere.
              </p>
            </div>
          )}

          {/* STEP 2: Experience */}
          {step === 'experience' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {INFLATION_EXPERIENCES.map(e => (
                <button
                  key={e.id}
                  className="wiz-opt"
                  onClick={() => { setState(s => ({ ...s, experience: e })); setStep('goal') }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '2px' }}>{e.label}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{e.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 3: Goal */}
          {step === 'goal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {GOALS.map(g => (
                <button
                  key={g.id}
                  className="wiz-opt"
                  onClick={() => { setState(s => ({ ...s, goal: g })); setStep('lock') }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '2px' }}>{g.label}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{g.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 4: Lock */}
          {step === 'lock' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {LOCK_PREFS.map(l => (
                <button
                  key={l.id}
                  className="wiz-opt"
                  onClick={() => { const ns = { ...state, lockPref: l }; setState(ns); getRecommendation(ns) }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '2px' }}>{l.label}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{l.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* LOADING */}
          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              {/* Animated dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', animation: `wiz-pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
              <p style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0', fontFamily: 'Instrument Serif, Georgia, serif' }}>Analyzing your situation...</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Building your personalized savings strategy</p>
            </div>
          )}

          {/* RESULT */}
          {step === 'result' && (
            <div style={{ animation: 'wiz-up 0.35s ease forwards' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '14px 16px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '12px' }}>
                <span style={{ fontSize: '28px' }}>{state.currency?.flag}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Your personalized strategy</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0, marginTop: '2px' }}>Powered by Llama 3.3 · Based on your answers</p>
                </div>
              </div>

              {error ? (
                <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <p style={{ color: '#f87171', fontSize: '14px', margin: 0 }}>{error}</p>
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '18px', marginBottom: '16px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>{recommendation}</p>
                </div>
              )}

              {/* Tags */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {[state.currency?.country, state.goal?.label, state.lockPref?.label].filter(Boolean).map((tag, i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 500, padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>{tag}</span>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { setStep('currency'); setState({ currency: null, experience: null, goal: null, lockPref: null }); setRecommendation(''); setError('') }}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontWeight: 500, fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  Start over
                </button>
                <button
                  onClick={onComplete}
                  style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: '#4ade80', color: '#0d1117', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  Start Saving →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
