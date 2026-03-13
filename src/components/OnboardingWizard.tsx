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
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .w-opt {
    width: 100%;
    padding: 14px 16px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    cursor: pointer;
    text-align: left;
    transition: all 0.12s ease;
    font-family: 'Inter', sans-serif;
  }
  .w-opt:hover { border-color: #111827; background: #f9fafb; }
  .w-opt.selected { border-color: #111827; border-width: 2px; background: #f9fafb; }
  .w-dd-item {
    width: 100%;
    padding: 11px 16px;
    border: none;
    border-bottom: 1px solid #f3f4f6;
    background: transparent;
    cursor: pointer;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: background 0.1s ease;
    font-family: 'Inter', sans-serif;
  }
  .w-dd-item:hover { background: #f9fafb; }
  .w-dd-item:last-child { border-bottom: none; }
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
              content: `You are a warm, empathetic DeFi savings advisor for HoldFirm — a savings app for people in high-inflation economies. You give short, personal, actionable advice. Never use bullet points. Always write in flowing paragraphs.`,
            },
            {
              role: 'user',
              content: `A user answered 4 questions:
1. Country: ${wizardState.currency?.country} (${wizardState.currency?.code}, inflation: ${wizardState.currency?.inflation})
2. Inflation experience: ${wizardState.experience?.label} — ${wizardState.experience?.desc}
3. Goal: ${wizardState.goal?.label} — ${wizardState.goal?.desc}
4. Lock: ${wizardState.lockPref?.label} — ${wizardState.lockPref?.desc}

HoldFirm modes:
- NestSave: Simple USDC at 4.92% APY. Best for basic inflation protection.
- GoalStack: Goal-based savings with target + deadline. Best for saving toward something.
- DisciplineVault: Onchain lock. Early withdrawers pay 4.5% penalty to committed savers. Best for max discipline + earning from others.

Write exactly 3 short paragraphs under 220 words:
- Para 1: Acknowledge their situation in ${wizardState.currency?.country} emotionally.
- Para 2: Recommend the single best HoldFirm mode and explain why.
- Para 3: Paint a vivid picture of what their savings look like in 90 days.`,
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

  const stepTitles: Record<string, string> = {
    currency: 'Where are you from?',
    experience: `Lost money to inflation in ${state.currency?.country ?? 'your country'}?`,
    goal: "What's your main savings goal?",
    lock: 'How long can you commit?',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(8px)' }}>
      <style>{wStyles}</style>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', fontFamily: 'Inter, sans-serif', animation: 'fadeUp 0.3s ease forwards' }}>

        {/* Top bar */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', background: '#111827', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🤖</div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>AI Strategy Advisor</span>
            </div>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'DM Mono, monospace' }}>
              {currentIndex >= 0 ? `${currentIndex + 1} / 4` : ''}
            </span>
          </div>

          {/* Progress bar */}
          {currentIndex >= 0 && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {progressSteps.map((s, i) => (
                <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', backgroundColor: i <= currentIndex ? '#111827' : '#e5e7eb', transition: 'background-color 0.3s' }} />
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>

          {/* Step heading */}
          {currentIndex >= 0 && (
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0' }}>
              {stepTitles[step]}
            </p>
          )}

          {/* Step 1: Country dropdown */}
          {step === 'currency' && (
            <div>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.12s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {state.currency ? (
                      <>
                        <span style={{ fontSize: '20px' }}>{state.currency.flag}</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{state.currency.country}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'DM Mono, monospace' }}>Inflation: {state.currency.inflation}</div>
                        </div>
                      </>
                    ) : (
                      <span style={{ fontSize: '14px', color: '#9ca3af' }}>Select your country...</span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>{dropdownOpen ? '▲' : '▼'}</span>
                </button>

                {dropdownOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100, backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: '260px', overflowY: 'auto' }}>
                    {CURRENCIES.map(c => (
                      <button
                        key={c.code}
                        className="w-dd-item"
                        onClick={() => { setState(s => ({ ...s, currency: c })); setDropdownOpen(false) }}
                      >
                        <span style={{ fontSize: '18px' }}>{c.flag}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>{c.country}</div>
                        </div>
                        <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'DM Mono, monospace' }}>{c.inflation} inflation</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {state.currency && (
                <button
                  onClick={() => setStep('experience')}
                  style={{ width: '100%', padding: '13px', borderRadius: '8px', border: 'none', background: '#111827', color: '#ffffff', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  Continue →
                </button>
              )}
            </div>
          )}

          {/* Step 2: Experience */}
          {step === 'experience' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {INFLATION_EXPERIENCES.map(e => (
                <button
                  key={e.id}
                  className="w-opt"
                  onClick={() => { setState(s => ({ ...s, experience: e })); setStep('goal') }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '2px' }}>{e.label}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{e.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Goal */}
          {step === 'goal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {GOALS.map(g => (
                <button
                  key={g.id}
                  className="w-opt"
                  onClick={() => { setState(s => ({ ...s, goal: g })); setStep('lock') }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '2px' }}>{g.label}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{g.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Lock */}
          {step === 'lock' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {LOCK_PREFS.map(l => (
                <button
                  key={l.id}
                  className="w-opt"
                  onClick={() => { const ns = { ...state, lockPref: l }; setState(ns); getRecommendation(ns) }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '2px' }}>{l.label}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{l.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: '36px', height: '36px', border: '2px solid #e5e7eb', borderTop: '2px solid #111827', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 20px' }} />
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 6px 0' }}>Analyzing your situation...</p>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Building your personalized strategy</p>
            </div>
          )}

          {/* Result */}
          {step === 'result' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '24px' }}>{state.currency?.flag}</span>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>Your personalized strategy</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, fontFamily: 'DM Mono, monospace' }}>Powered by Llama 3.3 · Based on your answers</p>
                </div>
              </div>

              {error ? (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                  <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
                </div>
              ) : (
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', marginBottom: '16px' }}>
                  <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.75, margin: 0 }}>{recommendation}</p>
                </div>
              )}

              {/* Tags */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {[state.currency?.country, state.goal?.label, state.lockPref?.label].filter(Boolean).map((tag, i) => (
                  <span key={i} style={{ background: '#f3f4f6', color: '#374151', fontSize: '11px', fontWeight: 500, padding: '4px 10px', borderRadius: '20px', border: '1px solid #e5e7eb' }}>{tag}</span>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { setStep('currency'); setState({ currency: null, experience: null, goal: null, lockPref: null }); setRecommendation(''); setError('') }}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#6b7280', fontWeight: 500, fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  Start over
                </button>
                <button
                  onClick={onComplete}
                  style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', background: '#111827', color: '#ffffff', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
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