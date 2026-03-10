import { CURRENCIES } from '../hooks/useCurrencyRate'

interface CurrencySelectorProps {
  selected: string
  onChange: (code: string) => void
}

export function CurrencySelector({ selected, onChange }: CurrencySelectorProps) {
  return (
    <div className="w-full max-w-md">
      <p className="text-gray-400 text-sm mb-2">Select your local currency</p>
      <select
        value={selected}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-800 text-white rounded-xl p-4 outline-none border border-gray-700 text-lg"
      >
        {CURRENCIES.map(currency => (
          <option key={currency.code} value={currency.code}>
            {currency.flag} {currency.name}
          </option>
        ))}
      </select>
    </div>
  )
}