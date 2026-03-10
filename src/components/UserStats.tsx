import { useUserData } from '../hooks/useUserData'

interface UserStatsProps {
  address?: string
}

export function UserStats({ address }: UserStatsProps) {
  const { performance, history, balances, loading } = useUserData(address)

  if (!address) return null

  return (
    <div>
      <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '20px', margin: '0 0 4px 0' }}>
        Your YO Performance
      </h2>
      <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 20px 0' }}>
        Live data from YO Protocol SDK
      </p>

      {loading && (
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading SDK data...</p>
      )}

      {performance && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '14px',
            padding: '16px',
          }}>
            <p style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', margin: '0 0 4px 0' }}>YIELD EARNED (REALIZED)</p>
            <p style={{ color: '#15803d', fontSize: '22px', fontWeight: 800, margin: 0 }}>
              ${parseFloat(performance.realized.formatted || '0').toFixed(4)}
            </p>
          </div>
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '14px',
            padding: '16px',
          }}>
            <p style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', margin: '0 0 4px 0' }}>ACCRUING (UNREALIZED)</p>
            <p style={{ color: '#3b82f6', fontSize: '22px', fontWeight: 800, margin: 0 }}>
              ${parseFloat(performance.unrealized.formatted || '0').toFixed(4)}
            </p>
          </div>
        </div>
      )}

      {balances && balances.assets.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', margin: '0 0 10px 0' }}>WALLET ASSETS (VIA SDK)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {balances.assets.slice(0, 3).map((asset, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f9fafb',
                border: '1px solid #f3f4f6',
                borderRadius: '10px',
                padding: '12px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {asset.logo && (
                    <img src={asset.logo} alt={asset.symbol} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                  )}
                  <div>
                    <p style={{ color: '#111827', fontWeight: 700, fontSize: '14px', margin: 0 }}>{asset.symbol}</p>
                    <p style={{ color: '#9ca3af', fontSize: '11px', margin: 0 }}>{asset.chainName}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#111827', fontWeight: 700, fontSize: '14px', margin: 0 }}>
                    {parseFloat(asset.balance).toFixed(4)}
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '11px', margin: 0 }}>${parseFloat(asset.balanceUsd).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <p style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', margin: '0 0 10px 0' }}>RECENT TRANSACTIONS (VIA SDK)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((tx, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f9fafb',
                border: '1px solid #f3f4f6',
                borderRadius: '10px',
                padding: '12px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{tx.type === 'deposit' ? '↑' : '↓'}</span>
                  <div>
                    <p style={{ color: '#111827', fontWeight: 700, fontSize: '14px', margin: 0, textTransform: 'capitalize' }}>
                      {tx.type}
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: '11px', margin: 0 }}>
                      {new Date(tx.blockTimestamp * 1000).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: tx.type === 'deposit' ? '#15803d' : '#3b82f6', fontWeight: 700, fontSize: '14px', margin: 0 }}>
                    {tx.type === 'deposit' ? '+' : '-'}${parseFloat(tx.assets.formatted).toFixed(2)}
                  </p>
                  
                    href={`https://basescan.org/tx/${tx.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#9ca3af', fontSize: '11px' }}
                  >
                    View →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !performance && history.length === 0 && (
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #f3f4f6',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
            Make your first deposit to see your YO performance here.
          </p>
        </div>
      )}
    </div>
  )
}