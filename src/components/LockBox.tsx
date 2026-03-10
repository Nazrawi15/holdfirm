import { useState } from 'react'

interface LockBoxProps {
  currentBalance: number
}

export function LockBox({ currentBalance }: LockBoxProps) {
  const [isLocked, setIsLocked] = useState(false)
  const [lockDays, setLockDays] = useState(30)
  const [lockDate, setLockDate] = useState<Date | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  function handleLock() {
    const unlock = new Date()
    unlock.setDate(unlock.getDate() + lockDays)
    setLockDate(unlock)
    setIsLocked(true)
    setShowWarning(false)
  }

  function handleUnlock() {
    setShowWarning(true)
  }

  function confirmUnlock() {
    setIsLocked(false)
    setLockDate(null)
    setShowWarning(false)
  }

  const daysRemaining = lockDate
    ? Math.ceil((lockDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const progressPercent = lockDate
    ? Math.max(0, ((lockDays - daysRemaining) / lockDays) * 100)
    : 0

  return (
    <div style={{
      backgroundColor: '#111827',
      borderRadius: '24px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{ color: 'white', fontWeight: 800, fontSize: '20px' }}>LockBox</h2>
        <span style={{ fontSize: '24px' }}>{isLocked ? '🔒' : '🔓'}</span>
      </div>

      {/* Not Locked */}
      {!isLocked && (
        <div>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
            Lock your savings for a set period. Commitment builds wealth.
          </p>

          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '10px' }}>
            Choose lock duration
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {[30, 60, 90].map(days => (
              <button
                key={days}
                onClick={() => setLockDays(days)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '14px',
                  border: lockDays === days
                    ? '1px solid #22c55e'
                    : '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: lockDays === days
                    ? 'rgba(34, 197, 94, 0.1)'
                    : '#1f2937',
                  color: lockDays === days ? '#22c55e' : '#6b7280',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {days} Days
              </button>
            ))}
          </div>

          <div style={{
            backgroundColor: '#1f2937',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '13px' }}>Locking</p>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>
                ${currentBalance.toFixed(2)} USDC
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#6b7280', fontSize: '13px' }}>Unlock date</p>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>
                {new Date(
                  new Date().setDate(new Date().getDate() + lockDays)
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <button
            onClick={handleLock}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              fontWeight: 700,
              fontSize: '16px',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Lock My Savings
          </button>
        </div>
      )}

      {/* Locked State */}
      {isLocked && !showWarning && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ fontSize: '64px', marginBottom: '8px' }}>🔒</p>
            <p style={{ color: 'white', fontSize: '40px', fontWeight: 800 }}>{daysRemaining}</p>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>days until unlock</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#6b7280', fontSize: '13px' }}>Lock progress</span>
              <span style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>
                {progressPercent.toFixed(0)}%
              </span>
            </div>
            <div style={{
              width: '100%',
              backgroundColor: '#1f2937',
              borderRadius: '100px',
              height: '8px',
            }}>
              <div style={{
                height: '8px',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                width: `${progressPercent}%`,
              }} />
            </div>
          </div>

          <div style={{
            backgroundColor: '#1f2937',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '13px' }}>Locked amount</p>
              <p style={{ color: 'white', fontWeight: 700 }}>${currentBalance.toFixed(2)} USDC</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#6b7280', fontSize: '13px' }}>Unlock date</p>
              <p style={{ color: 'white', fontWeight: 700 }}>
                {lockDate?.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '14px',
            padding: '14px',
            marginBottom: '16px',
          }}>
            <p style={{ color: '#22c55e', fontSize: '14px', fontWeight: 600 }}>
              Your savings are locked and earning yield every day
            </p>
          </div>

          <button
            onClick={handleUnlock}
            style={{
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#6b7280',
              fontWeight: 600,
              fontSize: '14px',
              padding: '14px',
              borderRadius: '14px',
              cursor: 'pointer',
            }}
          >
            Unlock Early
          </button>
        </div>
      )}

      {/* Warning State */}
      {showWarning && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</p>
            <p style={{ color: 'white', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              Unlock early?
            </p>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>
              You still have {daysRemaining} days remaining on your commitment.
              Breaking the lock early reduces your savings discipline.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowWarning(false)}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                fontWeight: 700,
                fontSize: '15px',
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Keep Locked
            </button>
            <button
              onClick={confirmUnlock}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#6b7280',
                fontWeight: 700,
                fontSize: '15px',
                padding: '14px',
                borderRadius: '14px',
                cursor: 'pointer',
              }}
            >
              Unlock
            </button>
          </div>
        </div>
      )}

    </div>
  )
}