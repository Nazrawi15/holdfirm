import { useVaultHistory } from '../hooks/useVaultHistory'
import type { VaultKey } from '../lib/yo'
import { VAULTS } from '../lib/yo'

interface APYChartProps {
  vaultKey?: VaultKey
}

export function APYChart({ vaultKey = 'yoUSD' }: APYChartProps) {
  const { data, loading } = useVaultHistory(vaultKey)
  const vault = VAULTS[vaultKey]
  const color = vault.color

  // ── Chart dimensions ────────────────────────────────────────────────────
  const W = 600
  const H = 120
  const PAD_LEFT = 40
  const PAD_RIGHT = 12
  const PAD_TOP = 12
  const PAD_BOTTOM = 28

  const chartW = W - PAD_LEFT - PAD_RIGHT
  const chartH = H - PAD_TOP - PAD_BOTTOM

  // ── Scale helpers ───────────────────────────────────────────────────────
  const apyValues = data.map(d => d.apy)
  const minAPY = apyValues.length ? Math.max(0, Math.min(...apyValues) - 0.5) : 0
  const maxAPY = apyValues.length ? Math.max(...apyValues) + 0.5 : 10

  function xPos(i: number) {
    return PAD_LEFT + (i / Math.max(data.length - 1, 1)) * chartW
  }
  function yPos(apy: number) {
    return PAD_TOP + chartH - ((apy - minAPY) / (maxAPY - minAPY)) * chartH
  }

  // Build SVG polyline points
  const linePoints = data.map((d, i) => `${xPos(i)},${yPos(d.apy)}`).join(' ')

  // Build filled area path
  const areaPath = data.length > 0
    ? `M ${xPos(0)},${PAD_TOP + chartH} ` +
      data.map((d, i) => `L ${xPos(i)},${yPos(d.apy)}`).join(' ') +
      ` L ${xPos(data.length - 1)},${PAD_TOP + chartH} Z`
    : ''

  // Latest + min + max for stats row
  const latestAPY = data.length ? data[data.length - 1].apy : null
  const minVal = apyValues.length ? Math.min(...apyValues) : null
  const maxVal = apyValues.length ? Math.max(...apyValues) : null

  // Show every ~5th label to avoid crowding
  const labelStep = Math.max(1, Math.floor(data.length / 6))

  // Horizontal gridlines at 3 levels
  const gridLevels = [0, 0.5, 1].map(t => minAPY + t * (maxAPY - minAPY))

  return (
    <div style={{ marginTop: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>

      {/* Card header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '2px' }}>
            APY History · 30 Days
          </p>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            {vault.flag} {vault.symbol} via YO Protocol
          </p>
        </div>
        {latestAPY !== null && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color, fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>
              {latestAPY}%
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>current</div>
          </div>
        )}
      </div>

      {/* Chart area */}
      <div style={{ padding: '8px 0 0', backgroundColor: '#fafafa' }}>
        {loading ? (
          <div style={{ height: `${H}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '20px', height: '20px', border: '2px solid #e5e7eb', borderTopColor: color, borderRadius: '50%', animation: 'hf-spin 0.75s linear infinite' }} />
            <style>{`@keyframes hf-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : data.length === 0 ? (
          <div style={{ height: `${H}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>No history available</p>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            height={H}
            style={{ display: 'block' }}
          >
            {/* Gradient fill */}
            <defs>
              <linearGradient id={`apy-fill-${vaultKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.12" />
                <stop offset="100%" stopColor={color} stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {gridLevels.map((level, i) => (
              <g key={i}>
                <line
                  x1={PAD_LEFT} y1={yPos(level)}
                  x2={W - PAD_RIGHT} y2={yPos(level)}
                  stroke="#f3f4f6" strokeWidth="1"
                />
                <text
                  x={PAD_LEFT - 6} y={yPos(level) + 4}
                  fontSize="9" fill="#9ca3af"
                  textAnchor="end"
                  fontFamily="Inter, sans-serif"
                >
                  {level.toFixed(1)}%
                </text>
              </g>
            ))}

            {/* Filled area */}
            <path d={areaPath} fill={`url(#apy-fill-${vaultKey})`} />

            {/* Line */}
            <polyline
              points={linePoints}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Dots + X labels */}
            {data.map((d, i) => (
              <g key={i}>
                {/* Dot on every point */}
                <circle
                  cx={xPos(i)} cy={yPos(d.apy)}
                  r="2.5"
                  fill={color}
                  opacity="0.7"
                />
                {/* X-axis label every labelStep points */}
                {i % labelStep === 0 && (
                  <text
                    x={xPos(i)} y={H - 6}
                    fontSize="9" fill="#9ca3af"
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                  >
                    {d.date}
                  </text>
                )}
              </g>
            ))}

            {/* Latest value highlight dot */}
            {data.length > 0 && (
              <circle
                cx={xPos(data.length - 1)}
                cy={yPos(data[data.length - 1].apy)}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
            )}
          </svg>
        )}
      </div>

      {/* Stats row */}
      {!loading && data.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid #f3f4f6' }}>
          {[
            { label: '30D Low', value: `${minVal?.toFixed(2)}%`, color: '#6b7280' },
            { label: '30D Avg', value: `${(apyValues.reduce((a, b) => a + b, 0) / apyValues.length).toFixed(2)}%`, color },
            { label: '30D High', value: `${maxVal?.toFixed(2)}%`, color: '#15803d' },
          ].map(stat => (
            <div key={stat.label} style={{ padding: '12px 14px', textAlign: 'center', borderRight: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{stat.label}</p>
              <p style={{ fontSize: '15px', fontWeight: 700, color: stat.color, fontFamily: 'Inter, sans-serif', margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
