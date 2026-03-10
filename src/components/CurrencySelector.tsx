import { CURRENCIES } from '../hooks/useCurrencyRate'

interface CurrencySelectorProps {
  selected: string
  onChange: (code: string) => void
}

export function CurrencySelector({ selected, onChange }: CurrencySelectorProps) {
  return (
    <div>
      <select
        value={selected}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          color: '#111827',
          borderRadius: '12px',
          padding: '12px 16px',
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
            style={{ backgroundColor: 'white', color: '#111827' }}
          >
            {currency.flag} {currency.name}
          </option>
        ))}
      </select>
    </div>
  )
}