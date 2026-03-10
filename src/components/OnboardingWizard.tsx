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
  { id: 'badly', label: '😔 Yes, badly', desc: 'My savings lost significant value' },
  { id: 'little', label: '😐 A little', desc: 'I noticed prices going up' },
  { id: 'notyet', label: '😊 Not yet', desc: 'But I want to be prepared' },
]

const GOALS = [
  { id: 'protect', label: '🛡️ Protect my savings', desc: 'Stop inflation eating my money' },
  { id: 'grow', label: '📈 Grow my wealth', desc: 'Earn as much yield as possible' },
  { id: 'goal', label: '🎯 Save for something specific', desc: 'House, education, emergency fund' },
  { id: 'discipline', label: '💪 Build saving discipline', desc: 'Commit and stop impulse spending' },
]

const LOCK_PREFS = [
  { id: 'flexible', label: '🌊 Flexible', desc: 'I might need it anytime' },
  { id: '30', label: '📅 30 days', desc: 'Short commitment' },
  { id: '60', label: '🗓️ 60 days', desc: 'Medium commitment' },
  { id: '90', label: '🏆 90 days', desc: 'Maximum rewards' },
]

type Step = 'currency' | 'experience' | 'goal' | 'lock' | 'loading' | 'result'

interface WizardState {
  currency: typeof CURRENCIES[0] | null
  experience: typeof INFLATION_EXPERIENCES[0] | null
  goal: typeof GOALS[0] | null
  lockPref: typeof LOCK_PREFS[0] | null
}

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>('currency')
  const [state, setState] = useState<WizardState>({
    currency: null, experience: null, goal: null, lockPref: null
  })
  const [recommendation, setRecommendation] = useState('')
  const [error, setError] = useState('')

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
              content: `You are a warm, empathetic DeFi savings advisor for HoldFirm — a savings app built for people in high-inflation economies. You give short, personal, actionable advice. Never use bullet points. Always write in flowing paragraphs.`,
            },
            {
              role: 'user',
              content: `A user just answered 4 onboarding questions:

1. Country: ${wizardState.currency?.country} (currency: ${wizardState.currency?.code}, inflation: ${wizardState.currency?.inflation})
2. Inflation experience: ${wizardState.experience?.label} — ${wizardState.experience?.desc}
3. Savings goal: ${wizardState.goal?.label} — ${wizardState.goal?.desc}
4. Lock commitment: ${wizardState.lockPref?.label} — ${wizardState.lockPref?.desc}

HoldFirm savings modes:
- NestSave: Simple USDC savings at 4.92% APY, view balance in local currency. Best for: anyone wanting basic inflation protection.
- GoalStack: Goal-based savings with target, deadline, progress bar. Best for: saving toward something specific.
- LockBox: 30/60/90 day soft commitment lock with progress tracking. Best for: building discipline without onchain penalty.
- DisciplineVault: Onchain smart contract lock. Early withdrawers pay 4.5% penalty distributed to committed savers. Best for: maximum discipline + earning from others' impatience.

Write exactly 3 short paragraphs (under 220 words total):
- Paragraph 1: Acknowledge their specific situation in ${wizardState.currency?.country} and their inflation experience emotionally.
- Paragraph 2: Recommend the single best HoldFirm mode for them. Explain why it fits their goal and lock preference specifically.
- Paragraph 3: Paint a vivid picture of what their savings could look like in 90 days if they start today.`,
            },
          ],
        }),
      })
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content ?? 'Unable to generate recommendation.'
      setRecommendation(text)
      setStep('result')
    } catch (err) {
      setError('Could not connect. Please try again.')
      setStep('result')
    }
  }

  const progressSteps = ['currency', 'experience', 'goal', 'lock']
  const currentIndex = progressSteps.indexOf(step)

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '16px',
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '20px', padding: '32px',
        width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🤖</div>
          <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '22px', margin: '0 0 6px 0' }}>
            Find your savings strategy
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
            4 quick questions. AI-powered recommendation.
          </p>
        </div>

        {/* Progress bar */}
        {currentIndex >= 0 && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
            {progressSteps.map((s, i) => (
              <div key={s} style={{
                flex: 1, height: '4px', borderRadius: '2px',
                backgroundColor: i <= currentIndex ? '#111827' : '#e5e7eb',
                transition: 'background-color 0.3s',
              }} />
            ))}
          </div>
        )}

        {/* Step 1: Country */}
        {step === 'currency' && (
          <div>
            <p style={{ color: '#374151', fontWeight: 700, fontSize: '16px', margin: '0 0 16px 0' }}>
              🌍 Where are you from?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {CURRENCIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => { setState(s => ({ ...s, currency: c })); setStep('experience') }}
                  style={{
                    padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                    backgroundColor: 'white', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#111827')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{c.flag}</div>
                  <div style={{ color: '#111827', fontWeight: 700, fontSize: '13px' }}>{c.country}</div>
                  <div style={{ color: '#ef4444', fontSize: '11px', fontWeight: 600 }}>Inflation: {c.inflation}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Inflation experience */}
        {step === 'experience' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px' }}>{state.currency?.flag}</span>
              <p style={{ color: '#374151', fontWeight: 700, fontSize: '16px', margin: 0 }}>
                Have you lost money to inflation in {state.currency?.country}?
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {INFLATION_EXPERIENCES.map(e => (
                <button
                  key={e.id}
                  onClick={() => { setState(s => ({ ...s, experience: e })); setStep('goal') }}
                  style={{
                    padding: '14px 16px', borderRadius: '10px', border: '1px solid #e5e7eb',
                    backgroundColor: 'white', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#111827')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                >
                  <div style={{ color: '#111827', fontWeight: 700, fontSize: '15px' }}>{e.label}</div>
                  <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>{e.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Goal */}
        {step === 'goal' && (
          <div>
            <p style={{ color: '#374151', fontWeight: 700, fontSize: '16px', margin: '0 0 16px 0' }}>
              🎯 What's your main savings goal?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {GOALS.map(g => (
                <button
                  key={g.id}
                  onClick={() => { setState(s => ({ ...s, goal: g })); setStep('lock') }}
                  style={{
                    padding: '14px 16px', borderRadius: '10px', border: '1px solid #e5e7eb',
                    backgroundColor: 'white', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#111827')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                >
                  <div style={{ color: '#111827', fontWeight: 700, fontSize: '14px' }}>{g.label}</div>
                  <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>{g.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Lock preference */}
        {step === 'lock' && (
          <div>
            <p style={{ color: '#374151', fontWeight: 700, fontSize: '16px', margin: '0 0 16px 0' }}>
              🔒 How long can you commit to saving?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {LOCK_PREFS.map(l => (
                <button
                  key={l.id}
                  onClick={() => {
                    const newState = { ...state, lockPref: l }
                    setState(newState)
                    getRecommendation(newState)
                  }}
                  style={{
                    padding: '14px 16px', borderRadius: '10px', border: '1px solid #e5e7eb',
                    backgroundColor: 'white', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#111827')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                >
                  <div style={{ color: '#111827', fontWeight: 700, fontSize: '14px' }}>{l.label}</div>
                  <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>{l.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤖</div>
            <p style={{ color: '#111827', fontWeight: 700, fontSize: '16px', margin: '0 0 8px 0' }}>
              Analyzing your situation...
            </p>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
              Building your personalized savings strategy
            </p>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
            <style>{`
              @keyframes bounce {
                0%, 100% { transform: translateY(0); opacity: 0.4; }
                50% { transform: translateY(-8px); opacity: 1; }
              }
            `}</style>
          </div>
        )}

        {/* Result */}
        {step === 'result' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ fontSize: '28px' }}>{state.currency?.flag}</div>
              <div>
                <p style={{ color: '#111827', fontWeight: 800, fontSize: '16px', margin: 0 }}>
                  Your personalized strategy
                </p>
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
                  Powered by AI · Based on your answers
                </p>
              </div>
            </div>

            {error ? (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
              </div>
            ) : (
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.75, margin: 0 }}>
                  {recommendation}
                </p>
              </div>
            )}

            {/* Summary chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {[state.currency?.country, state.goal?.id, state.lockPref?.label].filter(Boolean).map((tag, i) => (
                <span key={i} style={{ backgroundColor: '#f3f4f6', color: '#374151', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px' }}>
                  {tag}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setStep('currency'); setState({ currency: null, experience: null, goal: null, lockPref: null }); setRecommendation(''); setError('') }}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#6b7280', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
              >
                Start over
              </button>
              <button
                onClick={onComplete}
                style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
              >
                Start Saving Now →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}