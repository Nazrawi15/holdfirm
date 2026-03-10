import { CURRENCIES } from '../hooks/useCurrencyRate'

interface CurrencySelectorProps {
  selected: string
  onChange: (code: string) => void
}

export function CurrencySelector({ selected, onChange }: CurrencySelectorProps) {
  return (
    <div>
      <p style={{
        color: '#6b7280',
        fontSize: '13px',
        marginBottom: '8px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        Your local currency
      </p>
      <select
        value={selected}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          backgroundColor: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'white',
          borderRadius: '16px',
          padding: '14px 16px',
          fontSize: '15px',
          fontWeight: 600,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 16px center',
        }}
      >
        {CURRENCIES.map(currency => (
          <option
            key={currency.code}
            value={currency.code}
            style={{ backgroundColor: '#111827' }}
          >
            {currency.flag} {currency.name}
          </option>
        ))}
      </select>
    </div>
  )
}