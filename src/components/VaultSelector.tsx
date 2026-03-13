import { VAULTS } from '../lib/yo'
import type { VaultKey } from '../lib/yo'
import { useYoVault } from '../hooks/useYoVault'

interface Props {
  selected: VaultKey
  onChange: (key: VaultKey) => void
}

function VaultCard({ vaultKey, selected, onClick }: { vaultKey: VaultKey; selected: boolean; onClick: () => void }) {
  const vault = VAULTS[vaultKey]
  const { apy, tvl, loading } = useYoVault(vaultKey)
  const isUSD = vaultKey === 'yoUSD'

  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '16px',
        borderRadius: '10px',
        border: selected ? `2px solid ${vault.color}` : '1px solid #e5e7eb',
        background: selected ? (isUSD ? '#f0fdf4' : '#eff6ff') : '#ffffff',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s ease',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
      }}
    >
      {/* Selected indicator */}
      {selected && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: vault.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: '#fff',
          fontWeight: 700,
        }}>✓</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '20px' }}>{vault.flag}</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{vault.symbol}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>{vault.label}</div>
        </div>
      </div>

      {/* APY + TVL */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '2px' }}>APY</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: vault.color, fontFamily: 'Inter, sans-serif' }}>
            {loading ? '—' : `${apy}%`}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '2px' }}>TVL</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', fontFamily: 'Inter, sans-serif' }}>
            {loading ? '—' : `$${tvl}`}
          </div>
        </div>
      </div>

      {/* Asset badge */}
      <div style={{
        display: 'inline-block',
        fontSize: '11px',
        fontWeight: 600,
        color: vault.color,
        background: isUSD ? '#dcfce7' : '#dbeafe',
        borderRadius: '4px',
        padding: '2px 8px',
        marginBottom: '8px',
      }}>
        {vault.asset}
      </div>

      {/* Description */}
      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
        {vault.description}
      </p>
    </button>
  )
}

export function VaultSelector({ selected, onChange }: Props) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.6px',
        textTransform: 'uppercase',
        color: '#9ca3af',
        marginBottom: '10px',
      }}>
        Choose your savings currency
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <VaultCard vaultKey="yoUSD" selected={selected === 'yoUSD'} onClick={() => onChange('yoUSD')} />
        <VaultCard vaultKey="yoEUR" selected={selected === 'yoEUR'} onClick={() => onChange('yoEUR')} />
      </div>
    </div>
  )
}
