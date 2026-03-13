import { useState } from 'react'
import { CURRENCIES } from '../hooks/useCurrencyRate'

interface CurrencySelectorProps {
  selected: string
  onChange: (code: string) => void
}

export function CurrencySelector({ selected, onChange }: CurrencySelectorProps) {
  const [focused, setFocused] = useState(false)
  const selectedCurrency = CURRENCIES.find(c => c.code === selected)

  return (
    <div style={{ position: 'relative', fontFamily: 'Inter, sans-serif' }}>

      {/* Selected currency preview above the dropdown */}
      {selectedCurrency && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
        }}>
          <span style={{ fontSize: '1.25rem' }}>{selectedCurrency.flag}</span>
          <div>
            <p style={{
              fontSize: '0.875rem', fontWeight: 600, color: '#111827',
              margin: 0, lineHeight: 1.2,
            }}>
              {selectedCurrency.name}
            </p>
            <p style={{
              fontSize: '0.6875rem', color: '#9ca3af',
              margin: 0, fontWeight: 500,
            }}>
              {selectedCurrency.inflation}% annual inflation
            </p>
          </div>
        </div>
      )}

      {/* Select wrapper */}
      <div style={{ position: 'relative' }}>
        <select
          value={selected}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            backgroundColor: '#f9fafb',
            border: `1.5px solid ${focused ? '#111827' : '#e5e7eb'}`,
            color: '#111827',
            borderRadius: 10,
            padding: '10px 36px 10px 14px',
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            transition: 'border-color 0.15s',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center',
          }}
        >
          {CURRENCIES.map(currency => (
            <option
              key={currency.code}
              value={currency.code}
              style={{ backgroundColor: 'white', color: '#111827' }}
            >
              {currency.flag} {currency.name} ({currency.code})
            </option>
          ))}
        </select>
      </div>

      <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px', lineHeight: 1.5 }}>
        Don't see your country? Select any high-inflation currency — the math works the same way.
      </p>
    </div>
  )
}